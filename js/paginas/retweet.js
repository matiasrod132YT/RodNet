import {
    auth,
    db,
    doc,
    getDoc,
    getDocs,
    query,
    collection,
    where,
} from '../firebase.js';

// Función para obtener el número de retweets hechos por el usuario
const getUserRetweetCount = async (userId) => {
    try {
        // Refiere a la colección principal de posts
        const postsCollectionRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsCollectionRef);
        
        let retweetCount = 0;
        
        // Itera por cada post y revisa si es un retweet hecho por el userId
        postsSnapshot.forEach((doc) => {
            const postData = doc.data();
            if (postData.isRetweet && postData.userId === userId) {
                retweetCount++; // Incrementa el conteo si el usuario ha hecho un retweet
            }
        });

        return retweetCount; // Devuelve el número total de retweets hechos por el usuario
    } catch (error) {
        console.error('Error fetching retweets count:', error.message);
        return 0;
    }
};

// Función para actualizar el conteo de retweets en la UI
const updateCountRetweets = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid; // Obtiene el ID del usuario autenticado
        const retweetCount = await getUserRetweetCount(userId); // Llama a la función para obtener el conteo de retweets
        document.querySelector('.user-retweets').textContent = `${retweetCount} retweets`; // Actualiza el contenido del DOM con el conteo de retweets
    } else {
        console.error('No user is currently authenticated.');
    }
};

const likedTweetsContainer = document.querySelector('.re-tweets');

// Función para mostrar los tweets que el usuario ha retweeteado
export const displayReTweets = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        updateCountRetweets();

        try {
            // Obtener el nombre de usuario
            const userDoc = await getDoc(doc(db, 'users', userId)); // Ajusta 'users' a tu colección de usuarios

            // Consulta para obtener todos los tweets que el usuario ha retweeteado
            const q = query(collection(db, 'posts'), where('isRetweet', '==', true), where('userId', '==', userId)); // Ajusta 'posts' y 'isRetweet' según tu estructura de colección
            const querySnapshot = await getDocs(q);
            const retweetedTweets = querySnapshot.docs.map(doc => doc.data());


            // Limpiar el contenedor de tweets antes de añadir los nuevos
            likedTweetsContainer.innerHTML = '';

            if (retweetedTweets.length > 0) {
                // Crear el HTML para cada tweet que el usuario ha retweeteado
                retweetedTweets.forEach(tweet => {
                    const tweetElement = document.createElement('div');
                    tweetElement.classList.add('tweet');

                    const isRetweet = tweet.isRetweet || false;
                    const composeProfileContainerClass = isRetweet ? 'compose-profile-container retweet-style' : 'compose-profile-container';
                    
                    tweetElement.innerHTML = `
                        <div class="tweet-post ${isRetweet ? 'retweet-post' : ''}">
                            <div class="${composeProfileContainerClass}">
                                <img class="compose-profile" src="${userDoc.data().avatarUrl || './images/avatar.png'}" alt="Imagen de perfil">
                                <div class="tweet-profile-content-container">
                                    <div class="tweet-profile-title-container">
                                        <div class="tweet-profile-info">
                                            <div class="tweet-profile-title">${userDoc.data().username || 'Anonymous'}</div>
                                            <div class="tweet-check-mark">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                            <div class="tweet-handle">@${userDoc.data().userHandle || 'Anonymous'} · ${new Date(tweet.timestamp.seconds * 1000).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div class="tweet-content">${tweet.text}</div>
                                </div>
                            </div>

                            ${tweet.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${tweet.postImg}" alt="Imagen del post"></div>` : ''}

                        </div>
                    `;
                    likedTweetsContainer.appendChild(tweetElement);
                });
            } else {
                likedTweetsContainer.innerHTML = '<p>No has hecho ningún retweet.</p>';
            }

        } catch (error) {
            console.error('Error fetching retweeted tweets:', error.message);
        }
    }
};
