import {
    auth,
    db,
    doc,
    getDoc,
    getDocs,
    query,
    collection,
    where,
} from '../apis/firebase.js';
import { formatTimestamp } from '../apis/timestamp.js';
import { escapeHtml } from '../apis/escapeHtml.js';

// Función para obtener el número de tweets a los que el usuario ha dado "like"
const getUserLikedCount = async (userId) => {
    try {
        // Refiere a la colección principal de posts
        const postsCollectionRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        
        let likeCount = 0;
        
        // Itera por cada post y revisa si el userId está en el array de likesBy
        postsSnapshot.forEach((doc) => {
            const postData = doc.data();
            const likesByArray = postData.likesBy || []; // Asegúrate de que likesBy es un array
            if (likesByArray.includes(userId)) {
                likeCount++; // Incrementa el conteo si el usuario ha dado like a este post
            }
        });

        return likeCount; // Devuelve el número total de likes del usuario
    } catch (error) {
        console.error('Error fetching likes count:', error.message);
        return 0;
    }
};

// Función para actualizar el conteo de likes en la UI
const updateCountLiked = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid; // Obtiene el ID del usuario autenticado
        const likeCount = await getUserLikedCount(userId); // Llama a la función para obtener el conteo de likes
        document.querySelector('.user-likes').textContent = `${likeCount} like Tweets`; // Actualiza el contenido del DOM con el conteo de likes
    } else {
        console.error('No user is currently authenticated.');
    }
};
const likedTweetsContainer = document.querySelector('.liked-tweets');

// Función para mostrar los tweets que el usuario ha dado like
export const displayLikedTweets = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        updateCountLiked();

        try {
            // Obtener el nombre de usuario
            const userDoc = await getDoc(doc(db, 'users', userId)); // Ajusta 'users' a tu colección de usuarios

            // Consulta para obtener todos los tweets que el usuario ha dado like
            const q = query(collection(db, 'posts'), where('likesBy', 'array-contains', userId)); // Ajusta 'posts' y 'likes' según tu estructura de colección
            const querySnapshot = await getDocs(q);
            const likedTweets = querySnapshot.docs.map(doc => doc.data());

            // Limpiar el contenedor de tweets antes de añadir los nuevos
            likedTweetsContainer.innerHTML = '';

            if (likedTweets.length > 0) {
                // Crear el HTML para cada tweet que el usuario ha dado like
                likedTweets.forEach(tweet => {
                    const tweetElement = document.createElement('div');
                    tweetElement.classList.add('tweet');
                    const userHasLiked = tweet.likesBy && tweet.likesBy.includes(auth.currentUser.uid);
                    tweetElement.innerHTML = `
                        <div class="tweet-post">
                            <div class="compose-profile-container">
                                <img class="compose-profile" src="${userDoc.data().avatarUrl || './images/avatar.png'}" alt="Imagen de perfil">
                                <div class="tweet-profile-content-container">
                                    <div class="tweet-profile-title-container">
                                        <div class="tweet-profile-info">
                                            <div class="tweet-profile-title">${escapeHtml(userDoc.data().username || 'Anonymous')}</div>
                                            <div class="tweet-check-mark">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                            <div class="tweet-handle">@${escapeHtml(userDoc.data().userHandle || 'Anonymous')} · ${formatTimestamp(tweet.timestamp)}</div>
                                        </div>
                                    </div>
                                    <div class="tweet-content">${escapeHtml(tweet.text)}</div>
                                </div>
                            </div>

                            ${tweet.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${tweet.postImg}" alt="Imagen del post"></div>` : ''}

                            <div class="tweet-buttons">
                                <div class="buttons-container">
                                    <i class="far fa-comment"></i>
                                    <div class="number-comments">${tweet.commentsBy ? tweet.commentsBy.length : 0}</div>
                                </div>
                                <div class="buttons-container">
                                    <i class="fas fa-retweet"></i>
                                    <div class="number-retweets">${tweet.retweets || 0}</div>
                                </div>
                                <div class="buttons-container">
                                    <i class="${userHasLiked ? 'fas fa-heart rojo' : 'far fa-heart'}"></i>
                                    <div class="${userHasLiked ? 'number-likes rojo' : 'number-likes'}">${tweet.likes || 0}</div>
                                </div>
                            </div>
                        </div>
                    `;
                    likedTweetsContainer.appendChild(tweetElement);
                });
            } else {
                likedTweetsContainer.innerHTML = '<p>No has dado like a ningún tweet.</p>';
            }

        } catch (error) {
            console.error('Error fetching liked tweets:', error.message);
        }
    }
};