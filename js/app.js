// app.js
import {
    auth,
    db,
    doc,
    signOut,
    collection,
    addDoc,
    getDoc,
    serverTimestamp,
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from './firebase.js';
import { fetchPosts } from './paginas/text.js';
import { displayUserTweets, updateCountPosts } from './paginas/perfil.js';
import { displayLikedTweets } from './paginas/liked.js';
import { displayReTweets } from './paginas/retweet.js';
import { displayNotificaciones } from './paginas/notificaciones.js';
import { updateTrends } from './trends.js';

const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');

// Manejar clic en el icono de carga de imagen
document.getElementById('image-upload-icon').addEventListener('click', () => {
    document.getElementById('image-input').click();
});

// Manejar selección de imagen
document.getElementById('image-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Manejar envío del formulario
document.getElementById('post-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = document.getElementById('post-text').value.trim();
    const file = document.getElementById('image-input').files[0];
    const userId = auth.currentUser.uid;

    if (text || file) {
        try {
            let postImgUrl = '';
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();

            // Subir imagen si hay una
            if (file) {
                const storage = getStorage();
                const storageRef = ref(storage, `posts/${file.name}`);
                await uploadBytes(storageRef, file);
                postImgUrl = await getDownloadURL(storageRef);
            }
            
            // Guardar datos del post en Firestore
            await addDoc(collection(db, 'posts'), {
                text,
                userId: userId,
                postImg: postImgUrl,
                timestamp: serverTimestamp(),
                likes: 0,
                likesBy: [],
                commentsBy: [],
                retweets: 0,
            });

            // Limpiar formulario
            document.getElementById('post-text').value = '';
            document.getElementById('image-input').value = '';
            imagePreviewContainer.style.display = 'none';
            
            displayUserTweets();

        } catch (error) {
            console.error('Error al publicar:', error);
        }
    }
});
document.getElementById('logout')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // Redirect to index.html on sign out
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Set up an authentication state listener
auth.onAuthStateChanged(user => {
    if (user) {
        displayUserProfile();
    } else {
        // Handle the case where the user is not authenticated (e.g., redirect to login)
        window.location.href = 'index.html'; // Redirect to login page or handle as needed
    }
});

// Function to get and display user profile data
export const displayUserProfile = async () => {
    const userId = auth.currentUser.uid;

    try {
        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
                
            document.querySelectorAll('.username').forEach(element => {
                element.textContent = userData.username || 'Anonymous';
            });

            document.querySelectorAll('.user-email').forEach(element => {
                element.textContent = userData.email || 'No email';
            })

            document.querySelectorAll('.handle').forEach(element => {
                element.textContent = `@${auth.currentUser.email.split('@')[0]}` || 'No handle';
            });
            
            document.querySelectorAll('.user-avatar').forEach(imgElement => {
                if (userData.avatarUrl) {
                    imgElement.src = userData.avatarUrl;
                } else {
                    imgElement.src = './images/avatar.png';
                }
            });

            document.querySelectorAll('.header-img').forEach(imgElement => {
                // Verifica si userData.headerUrl está definido y no está vacío
                if (userData.headerUrl) {
                    // Establece el backgroundImage con la URL proporcionada por userData
                    imgElement.style.backgroundImage = `url(${userData.headerUrl})`;
                }
            });

            updateCountPosts();
            displayUserTweets();
            displayLikedTweets();
            displayReTweets();
            displayNotificaciones();
        } else {
            console.log('User document does not exist!');
        }
    } catch (error) {
        console.error('Error fetching user profile data:', error.message);
    }
};

// Function to show a specific section
const showSection = (sectionId) => {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
};
  
// Agrega event listeners a los botones de navegación
document.getElementById('logo-btn').addEventListener('click', () => showSection('home'));
document.getElementById('home-btn').addEventListener('click', () => showSection('home'));
document.getElementById('notificaciones-btn').addEventListener('click', () => showSection('notificaciones'));
document.getElementById('retweets-btn').addEventListener('click', () => showSection('retweets'));
document.getElementById('liked-btn').addEventListener('click', () => showSection('liked'));
document.getElementById('admin-btn').addEventListener('click', () => showSection('admin'));
document.getElementById('post').addEventListener('click', () => showSection('home'));
document.getElementById('profile-btn').addEventListener('click', () => showSection('perfil'));

// Opcional: Muestra la sección de inicio por defecto
showSection('home');

fetchPosts(); // Cargar publicaciones al iniciar
updateTrends();