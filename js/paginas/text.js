import {
    auth,
    db,
    doc,
    collection,
    getDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
} from '../apis/firebase.js';
import { handleLike, handleComment, handleRetweet, deletePost, deleteComment } from '../handlers.js';
import { displayUserTweets } from './perfil.js';
import { formatTimestamp } from '../apis/timestamp.js';
import { escapeHtml } from '../apis/escapeHtml.js';

const postsContainer = document.querySelector('.posts-container');
const searchInput = document.querySelector('#searchInput');

// Función para obtener y renderizar los posts
export const fetchPosts = async () => {
    try {
        // Consulta para obtener los posts ordenados por timestamp en orden descendente (más reciente primero)
        const q = query(collection(db, 'posts'), orderBy('timestamp'));

        onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const postId = change.doc.id;
                const post = change.doc.data();

                // Si es un nuevo post o un post que cambió
                if (change.type === 'added' || change.type === 'modified') {
                    const userDoc = await getDoc(doc(db, 'users', post.userId));
                    const userData = userDoc.data();

                    const userHasLiked = post.likesBy && post.likesBy.includes(auth.currentUser.uid);
                    const userHasRetweeted = post.retweetsBy && post.retweetsBy.includes(auth.currentUser.uid);

                    const isRetweet = post.isRetweet || false;
                    const composeProfileContainerClass = isRetweet ? 'compose-profile-container retweet-style' : 'compose-profile-container';

                    // Verifica si el post ya existe en el DOM
                    let postElement = document.querySelector(`.tweet-post[data-id="${postId}"]`);
                    if (!postElement) {
                        // Si el post no existe, lo creamos
                        postElement = document.createElement('div');
                        postElement.classList.add('tweet-post');
                        postElement.setAttribute('data-id', postId);
                        
                    }
                    const commentsSnapshot = await getDocs(collection(db, `posts/${postId}/comments`));
                    postsContainer.prepend(postElement);

                    // Actualizamos el contenido del post
                    postElement.innerHTML = `
                        <div class="main-post">
                            <div class="${composeProfileContainerClass}">
                                <img class="compose-profile" src="${userData.avatarUrl || './images/avatar.png'}" draggable="false" alt="Imagen de perfil">
                                <div class="tweet-profile-content-container">
                                    <div class="tweet-profile-title-container">
                                        <div class="tweet-profile-info">
                                            <div class="tweet-profile-title">${escapeHtml(userData.username || 'Anonymous')}</div>
                                            ${userData.verificado === true ? `
                                                <div class="tweet-check-mark">
                                                    <i class="fas fa-check-circle"></i>
                                                </div>
                                            ` : ''}
                                            <div class="tweet-handle">@${escapeHtml(userData.userHandle || 'Anonymous')} · ${formatTimestamp(post.timestamp)}</div>
                                        </div>
                                        ${post.userId === auth.currentUser.uid ? `
                                            <div class="del-container" data-id="${postId}">
                                                <i class="fas fa-trash-alt del-btn"></i>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="tweet-content">${escapeHtml(post.text)}</div>
                                </div>
                            </div>

                            ${post.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${post.postImg}" alt="Imagen del post"></div>` : ''}

                            <div class="tweet-buttons">
                                <div class="buttons-container comment-toggle-btn">
                                    <i class="far fa-comment"></i>
                                    <div id="comment-count-${postId}" class="number-comments">${commentsSnapshot.size}</div>
                                </div>
                                <div id="retweet-count-${postId}" class="buttons-container retweet-btn" data-id="${postId}">
                                    <i class="${userHasRetweeted ? 'fas fa-retweet rojo' : 'fas fa-retweet'}"></i>
                                    <div class="${userHasRetweeted ? 'number-retweets rojo' : 'number-retweets'}">${post.retweets || 0}</div>
                                </div>
                                <div class="buttons-container like-btn" data-id="${postId}">
                                    <i class="${userHasLiked ? 'fas fa-heart rojo' : 'far fa-heart'}"></i>
                                    <div class="${userHasLiked ? 'number-likes rojo' : 'number-likes'}">${post.likes || 0}</div>
                                </div>
                            </div>
                        </div>

                        <div class="comment-section hidden">
                            <div class="main-post">
                                <textarea class="comment-input" placeholder="Escribe un comentario..."></textarea>
                                <button id="comment-button" class="compose-button comment-btn" data-id="${postId}">Responder</button>
                            </div>
                            <div class="comment-list"></div>
                        </div>
                    `;

                    const commentList = postElement.querySelector('.comment-list');
                    commentList.innerHTML = ''; // Limpiar comentarios anteriores
                
                    // Consulta para obtener los comentarios de la subcolección
                    const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy('timestamp', 'asc'));
                
                    onSnapshot(commentsQuery, (snapshot) => {
                        commentList.innerHTML = ''; // Limpiar los comentarios anteriores
                
                        snapshot.forEach(async (commentDoc) => {
                            const comment = commentDoc.data();
                            const commentElement = document.createElement('div');

                            const userDoc = await getDoc(doc(db, 'users', comment.userId));
                            const userData = userDoc.data();

                            commentElement.classList.add('comment');
                            commentElement.setAttribute('data-comment-id', commentDoc.id);
                
                            commentElement.innerHTML = `
                                <div class="compose-profile-container2">
                                    <img class="compose-profile" src="${escapeHtml(userData.avatarUrl || './images/avatar.png')}" alt="Imagen de perfil">
                                    <div class="tweet-profile-content-container">
                                        <div class="tweet-profile-title-container">
                                            <div class="tweet-profile-info">
                                                <div class="tweet-profile-title">${escapeHtml(userData.username || 'Anonymous')}</div>
                                                <div class="tweet-handle">@${escapeHtml(userData.userHandle || 'Anonymous')} · ${formatTimestamp(comment.timestamp)}</div>
                                            </div>
                                            ${comment.userId === auth.currentUser.uid ? `
                                                <div class="del-container" data-id="${postId}">
                                                    <i class="fas fa-trash-alt del-comment-btn" data-comment-id="${commentDoc.id}"></i>
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="tweet-content">${escapeHtml(comment.text)}</div>
                                    </div>
                                </div>
                            `;
                            commentList.appendChild(commentElement);
                        });
                    });                                
                }

                // Si un post fue eliminado
                if (change.type === 'removed') {
                    const postElement = document.querySelector(`.tweet-post[data-id="${postId}"]`);
                    if (postElement) {
                        postElement.remove();
                        displayUserTweets();
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error fetching posts:', error.message);
    }
};

// Event listeners for dynamic content
postsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const postId = target.closest('[data-id]').getAttribute('data-id');
    
    if (target.matches('.like-btn')) {
        handleLike(postId);
    } else if (target.matches('.comment-btn')) {
        const commentInput = target.closest('.comment-section').querySelector('.comment-input');
        if (commentInput.value.trim()) {
            handleComment(postId, commentInput.value);
            commentInput.value = ''; // Clear input field
        }
    } else if (target.matches('.retweet-btn')) {
        handleRetweet(postId);
    } else if (target.matches('.del-btn')) {
        deletePost(postId);
    } else if (target.matches('.comment-toggle-btn')) {
        const commentSection = target.closest('.tweet-post').querySelector('.comment-section');
        commentSection.classList.toggle('hidden');
    } else if (target.matches('.del-comment-btn')) {
        const commentId = target.getAttribute('data-comment-id'); // Obtén el ID del comentario
        deleteComment(postId, commentId); // Llama a la función de eliminar comentario
    }
});

// Funcionalidad del buscador
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase(); // Convertimos el término de búsqueda a minúsculas
    const posts = document.querySelectorAll('.tweet-post'); // Seleccionamos todos los posts

    posts.forEach((post) => {
        const postContent = post.querySelector('.tweet-content').textContent.toLowerCase(); // Obtenemos el texto del post
        const username = post.querySelector('.tweet-profile-title').textContent.toLowerCase(); // Obtenemos el nombre de usuario

        // Verificamos si el término de búsqueda está en el contenido del post o en el nombre de usuario
        if (postContent.includes(searchTerm) || username.includes(searchTerm)) {
            post.style.display = 'block'; // Mostramos el post si coincide con la búsqueda
        } else {
            post.style.display = 'none'; // Ocultamos el post si no coincide
        }
    });
});

postsContainer.addEventListener('click', (event) => {
    const target = event.target;

    if (target.matches('.del-comment-btn')) {
        const postId = target.closest('[data-id]').getAttribute('data-id');
        const commentId = target.getAttribute('data-comment-id'); // Obtén el ID del comentario
        
        console.log("Post ID:", postId);
        console.log("Comment ID:", commentId);
        
        deleteComment(postId, commentId); // Llama a la función de eliminar comentario
    }
});