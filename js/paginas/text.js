import {
    auth,
    db,
    doc,
    collection,
    getDoc,
    query,
    orderBy,
    onSnapshot,
} from '../firebase.js';
import { handleLike, handleComment, handleRetweet, deletePost } from '../handlers.js';
import { displayUserTweets } from './perfil.js';

const postsContainer = document.querySelector('.posts-container');
const searchInput = document.querySelector('#searchInput');

// Función para obtener y renderizar los posts
export const fetchPosts = async () => {
    try {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

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

                    // Si el post ya existe en el DOM, lo actualizamos, si no, lo creamos
                    let postElement = document.querySelector(`.tweet-post[data-id="${postId}"]`);
                    if (!postElement) {
                        postElement = document.createElement('div');
                        postElement.classList.add('tweet-post'); // Añadimos la clase aquí
                        postElement.setAttribute('data-id', postId);
                        postsContainer.prepend(postElement); // Añadimos el post al contenedor principal
                    }

                    // Actualizamos el contenido del post
                    postElement.innerHTML = `
                    <div class="${composeProfileContainerClass}">
                        <img class="compose-profile" src="${userData.avatarUrl || './images/avatar.png'}" draggable="false" alt="Imagen de perfil">
                        <div class="tweet-profile-content-container">
                            <div class="tweet-profile-title-container">
                                <div class="tweet-profile-info">
                                    <div class="tweet-profile-title">${userData.username || 'Anonymous'}</div>
                                    <div class="tweet-check-mark">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div class="tweet-handle">@${userData.userHandle || 'Anonymous'} · ${new Date(post.timestamp?.seconds * 1000).toLocaleTimeString()}</div>
                                </div>
                                ${post.userId === auth.currentUser.uid ? `
                                    <div class="buttons-container" data-id="${postId}">
                                        <i class="fas fa-trash-alt del-btn"></i>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="tweet-content">${post.text}</div>
                        </div>
                    </div>

                    ${post.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${post.postImg}" alt="Imagen del post"></div>` : ''}

                    <div class="tweet-buttons">
                        <div class="buttons-container comment-toggle-btn">
                            <i class="far fa-comment"></i>
                            <div class="number-comments">${post.commentsBy ? post.commentsBy.length : 0}</div>
                        </div>
                        <div class="buttons-container retweet-btn" data-id="${postId}">
                            <i class="${userHasRetweeted ? 'fas fa-retweet rojo' : 'fas fa-retweet'}"></i>
                            <div class="${userHasRetweeted ? 'number-retweets rojo' : 'number-retweets'}">${post.retweets || 0}</div>
                        </div>
                        <div class="buttons-container like-btn" data-id="${postId}">
                            <i class="${userHasLiked ? 'fas fa-heart rojo' : 'far fa-heart'}"></i>
                            <div class="${userHasLiked ? 'number-likes rojo' : 'number-likes'}">${post.likes || 0}</div>
                        </div>
                    </div>

                    <div class="comment-section hidden">
                        <textarea class="comment-input" placeholder="Escribe un comentario..."></textarea>
                        <button class="compose-button comment-btn" data-id="${postId}">Responder</button>
                        <div class="comment-list"></div>
                    </div>
                    `;

                    if (post.commentsBy && post.commentsBy.length > 0) {
                        const commentSection = postElement.querySelector('.comment-section');
                        const commentList = postElement.querySelector('.comment-list');
                        commentList.innerHTML = ''; // Limpiar comentarios anteriores
                    
                        for (const comment of post.commentsBy) {
                            try {
                                // Obtener los datos del usuario que hizo el comentario desde la colección "users"
                                const commentUserDoc = await getDoc(doc(db, 'users', comment.userId));
                                const commentUserData = commentUserDoc.data();
                    
                                // Renderizar el comentario con los datos del usuario
                                const commentElement = document.createElement('div');
                                commentElement.classList.add('comment');
                                commentElement.innerHTML = `
                                    <div class="compose-profile-container">
                                        <img class="compose-profile" src="${commentUserData.avatarUrl || './images/avatar.png'}" alt="Imagen de perfil">
                                        <div class="tweet-profile-content-container">
                                            <div class="tweet-profile-title-container">
                                                <div class="tweet-profile-info">
                                                    <div class="tweet-profile-title">${commentUserData.username || 'Anonymous'}</div>
                                                    <div class="tweet-check-mark">
                                                        <i class="fas fa-check-circle"></i>
                                                    </div>
                                                    <div class="tweet-handle">@${commentUserData.userHandle || 'Anonymous'} · ${new Date(comment.timestamp.seconds * 1000).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                            <div class="tweet-content">${comment.text}</div>
                                        </div>
                                    </div>
                                `;
                                commentList.appendChild(commentElement);
                            } catch (error) {
                                console.error('Error al obtener datos del usuario del comentario:', error);
                            }
                        }
                    }
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
    }
});

// Funcionalidad del buscador
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase(); // Convertimos el término de búsqueda a minúsculas
    const posts = document.querySelectorAll('.post'); // Seleccionamos todos los posts

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