// app.js
import {
    auth,
    db,
    doc,
    signOut,
    collection,
    addDoc,
    getDoc,
    updateDoc,
    getDocs,
    orderBy,
    query,
    arrayUnion,
    arrayRemove,
    getFirestore,
    serverTimestamp,
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from './firebase.js';
import { updateCountPosts } from './perfil.js';

const postsContainer = document.getElementById('posts-container');
const imageInput = document.getElementById('image-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');


const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    postsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas publicaciones
    querySnapshot.forEach((docSnapshot) => {
        const post = docSnapshot.data();
        const postId = docSnapshot.id; // Obtener el ID de la publicación
        const postElement = document.createElement('div');

        // Determinar si el usuario actual ha dado like a la publicación
        const userHasLiked = post.likesBy && post.likesBy.includes(auth.currentUser.uid);

        // Estructura HTML para cada publicación con el diseño deseado
        postElement.innerHTML = `
            <div class="tweet-post" data-id="${postId}">
                <div class="compose-profile-container">
                    <img class="compose-profile" src="${post.profileImg || './images/avatar.png'}" alt="Imagen de perfil">
                    <div class="tweet-profile-content-container">
                        <div class="tweet-profile-title-container">
                            <div class="tweet-profile-info">
                                <div class="tweet-profile-title">${post.username || 'Anónimo'}</div>
                                <div class="tweet-check-mark">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="tweet-handle">@${post.userHandle || 'Desconocido'} · ${new Date(post.timestamp.seconds * 1000).toLocaleTimeString()}</div>
                            </div>
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
                    <div class="buttons-container">
                        <i class="fas fa-retweet"></i>
                        <div class="number-retweets">${post.retweets || 0}</div>
                    </div>
                    <div class="buttons-container like-btn" data-id="${postId}">
                        <i class="${userHasLiked ? 'fas fa-heart rojo' : 'far fa-heart'}"></i>
                        <div class="${userHasLiked ? 'number-likes rojo' : 'number-likes'}">${post.likes || 0}</div>
                    </div>
                </div>

                <!-- Sección de comentarios -->
                <div class="comment-section hidden">
                    <textarea class="comment-input" placeholder="Escribe un comentario..."></textarea>
                    <button class="compose-button comment-btn" data-id="${postId}">Responder</button>
                    <div class="comment-list"></div>
                </div>
            </div>
        `;

        postsContainer.appendChild(postElement); // Agregar la publicación al contenedor

        // Mostrar comentarios existentes
        if (post.commentsBy && post.commentsBy.length > 0) {
            post.commentsBy.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.innerHTML = `
                    <div class="compose-profile-container">
                        <img class="compose-profile" src="${comment.profileImg || './images/avatar.png'}" alt="Imagen de perfil">
                        <div class="tweet-profile-content-container">
                            <div class="tweet-profile-title-container">
                                <div class="tweet-profile-info">
                                    <div class="tweet-profile-title">${comment.userName || 'Anónimo'}</div>
                                    <div class="tweet-check-mark">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div class="tweet-handle">@${comment.userHandle || 'Desconocido'} · ${new Date(comment.timestamp.seconds * 1000).toLocaleTimeString()}</div>
                                </div>
                            </div>
                            <div class="tweet-content">${comment.text}</div>
                        </div>
                    </div>
                `;
                postElement.querySelector('.comment-list').appendChild(commentElement);
            });
        }
    });

    // Add event listener to the like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const postId = e.currentTarget.getAttribute('data-id');
            await handleLike(postId);
        });
    });

    // Add event listener to the comment toggle buttons
    const commentToggleButtons = document.querySelectorAll('.comment-toggle-btn');
    commentToggleButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const postElement = e.currentTarget.closest('.tweet-post');
            const commentSection = postElement.querySelector('.comment-section');

            // Check if the comment section is already visible
            const isVisible = !commentSection.classList.contains('hidden');

            // Hide all comment sections
            document.querySelectorAll('.comment-section').forEach(section => {
                section.classList.add('hidden');
            });

            // Toggle the visibility of the clicked comment section only if it was not already visible
            if (isVisible) {
                commentSection.classList.add('hidden');
            } else {
                commentSection.classList.remove('hidden');
            }
        });
    });

    // Add event listener to comment buttons
    const commentButtons = document.querySelectorAll('.comment-btn');
    commentButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const postId = e.currentTarget.getAttribute('data-id');
            const commentInput = e.currentTarget.previousElementSibling;

            // Check if previousElementSibling exists and is a textarea
            if (commentInput && commentInput.tagName === 'TEXTAREA') {
                const commentText = commentInput.value;

                if (commentText.trim() === '') return;

                await handleComment(postId, commentText);
                commentInput.value = ''; // Clear the input field
            } else {
                console.error('Comment input textarea not found');
            }
        });
    });

    // Function to handle the like logic
    const handleLike = async (postId) => {
        try {
            const userId = auth.currentUser.uid;
            const postRef = doc(db, 'posts', postId);
            const postSnapshot = await getDoc(postRef);

            if (postSnapshot.exists()) {
                const postData = postSnapshot.data();
                const currentLikes = postData.likes || 0;
                const likesBy = postData.likesBy || [];

                if (likesBy.includes(userId)) {
                    // User has already liked the post, so remove the like
                    await updateDoc(postRef, {
                        likes: currentLikes - 1,
                        likesBy: arrayRemove(userId), // Remove user ID from likesBy
                    });
                } else {
                    // User has not liked the post, so add the like
                    await updateDoc(postRef, {
                        likes: currentLikes + 1,
                        likesBy: arrayUnion(userId), // Add user ID to likesBy
                    });
                }

                // Re-fetch the posts to update the UI
                fetchPosts();
            } else {
                console.log('Post does not exist!');
            }
        } catch (error) {
            console.error('Error updating likes:', error.message);
        }
    };

    // Function to handle the comment logic
    const handleComment = async (postId, commentText) => {
        try {
            const userId = auth.currentUser.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userName = userDoc.exists() ? userDoc.data().username : 'Anonymous';

            const newComment = {
                text: commentText,
                userId,
                userName,
                timestamp: new Date(),
            };

            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsBy: arrayUnion(newComment), // Add the comment to the 'commentsBy' array
            });

            // Re-fetch the posts to update the UI
            fetchPosts();
        } catch (error) {
            console.error('Error adding comment:', error.message);
        }
    };
}
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
                postImg: postImgUrl,
                userName: auth.currentUser.displayName,
                userHandle: auth.currentUser.email.split('@')[0],
                profileImg: auth.currentUser.photoURL,
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

            fetchPosts(); // Refrescar publicaciones
        } catch (error) {
            console.error('Error al publicar:', error);
        }
    }
});

fetchPosts(); // Cargar publicaciones al iniciar


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

// Add event listeners to navigation buttons
document.getElementById('home-btn').addEventListener('click', () => showSection('home'));
document.getElementById('profile-btn').addEventListener('click', () => showSection('perfil'));

// Optional: Show the home section by default
showSection('home');