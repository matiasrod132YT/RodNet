// perfil.js
import {
    auth,
    db,
    doc,
    updateDoc,
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    query,
    getDoc,
    collection,
    where,
    getDocs,
} from '../apis/firebase.js';
import { displayUserProfile } from '../app.js';
import { formatTimestamp } from '../apis/timestamp.js';
import { escapeHtml } from '../apis/escapeHtml.js';
const storage = getStorage();

const getUserPostCount = async (userId) => {
    try {
        const q = query(collection(db, 'posts'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error fetching post count:', error.message);
        return 0;
    }
};

export const updateCountPosts = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const postCount = await getUserPostCount(userId);
        document.querySelector('.user-posts').textContent = `${postCount} posts`;
    } else {
        console.error('No user is currently authenticated.');
    }
};

const updateNameButton = document.getElementById('update-btn-username');
const newUsernameInput = document.getElementById('new-username');

updateNameButton.addEventListener('click', async () => {
    const newUsername = newUsernameInput.value.trim();
    if (newUsername) {
        try {
            const userId = auth.currentUser.uid;
            await updateDoc(doc(db, 'users', userId), {
                username: newUsername
            });
            Swal.fire({
                icon: "success",
                title: "Username actualizado",
                text: "Tu username fue actualizado correctamente!",
            });
            displayUserProfile(); // Refresh user profile data
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al actualizar username!",
                footer: `${error.message}`
            });
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor ingrese un username!"
        });
    }
});

const avatarPreview = document.getElementById('img-frame');
const fileInput = document.querySelector('.file-input');
const uploadButton = document.querySelector('.upload-btn');
let selectedFile; 

fileInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
});

uploadButton.addEventListener('click', () => {
    if (selectedFile) {
        const postButton = document.getElementById('uploadButton'); // El botón de envío del post
        postButton.disabled = true;

        const userId = auth.currentUser.uid;
        const storageRef = ref(storage, `users/${userId}/avatar/${selectedFile.name}`);

        uploadBytes(storageRef, selectedFile).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                updateDoc(doc(db, 'users', userId), {
                    avatarUrl: downloadURL
                });
                Swal.fire({
                    icon: "success",
                    title: "Avatar actualizado",
                    text: "Tu avatar fue actualizado correctamente!",
                });

                postButton.disabled = false;
                avatarPreview.style.backgroundImage = "";
                displayUserProfile()
            });
        }).catch((error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al actualizar avatar!",
                footer: `${error.message}`
            });
            postButton.disabled = false;
            avatarPreview.style.backgroundImage = "";
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor selecciona una imagen!"
        });
        postButton.disabled = false;
    }
});

const headerPreview = document.getElementById('img-frame-header');
const fileInputHeader = document.querySelector('.file-input-header');
const uploadButtonHeader = document.querySelector('.upload-btn-header');
let selectedFileHeader; 

fileInputHeader.addEventListener('change', (event) => {
    selectedFileHeader = event.target.files[0];
});

uploadButtonHeader.addEventListener('click', () => {
    if (selectedFileHeader) {
        const postButton = document.getElementById('uploadButton'); // El botón de envío del post
        postButton.disabled = true;

        const userId = auth.currentUser.uid;
        const storageRef = ref(storage, `users/${userId}/header/${selectedFileHeader.name}`);

        uploadBytes(storageRef, selectedFileHeader).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                updateDoc(doc(db, 'users', userId), {
                    headerUrl: downloadURL
                });
                Swal.fire({
                    icon: "success",
                    title: "Header actualizado",
                    text: "Tu header fue actualizado correctamente!",
                });
                postButton.disabled = false;
                headerPreview.style.backgroundImage = "";
                displayUserProfile()
            });
        }).catch((error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al actualizar header!",
                footer: `${error.message}`
            });
            postButton.disabled = false;
            headerPreview.style.backgroundImage = "";
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor selecciona una imagen!"
        });
        postButton.disabled = false;
    }
});

// Función para obtener los tweets del usuario
const getUserTweets = async (userId) => {
    try {
        const q = query(collection(db, 'posts'), where('userId', '==', userId)); // Ajusta 'posts' al nombre de tu colección de tweets
        const querySnapshot = await getDocs(q);
        const tweets = querySnapshot.docs.map(doc => doc.data());
        return tweets;
    } catch (error) {
        console.error('Error fetching user tweets:', error.message);
        return [];
    }
};

const perfilTweetsContainer = document.querySelector('.perfil-tweets');

// Función para renderizar los tweets en el HTML
export const displayUserTweets = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        try {
            // Obtener el nombre de usuario
            const userDoc = await getDoc(doc(db, 'users', userId)); // Ajusta 'users' a tu colección de usuarios

            // Obtener los tweets del usuario
            const q = query(collection(db, 'posts'), where('userId', '==', userId)); // Ajusta 'posts' al nombre de tu colección de tweets
            const querySnapshot = await getDocs(q);
            const tweets = querySnapshot.docs.map(doc => doc.data());

            // Limpiar el contenedor de tweets antes de añadir los nuevos
            perfilTweetsContainer.innerHTML = '';

            if (tweets.length > 0) {
                // Crear el HTML para cada tweet
                tweets.forEach(tweet => {
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
                    `;
                    perfilTweetsContainer.prepend(tweetElement);
                });
            } else {
                perfilTweetsContainer.innerHTML = '<p>No tienes tweets.</p>';
            }

        } catch (error) {
            console.error('Error fetching user data or tweets:', error.message);
            perfilTweetsContainer.innerHTML = '<p>Error al cargar los tweets.</p>';
        }
    } else {
        console.error('No user is currently authenticated.');
        perfilTweetsContainer.innerHTML = '<p>No hay usuario autenticado.</p>';
    }
};
