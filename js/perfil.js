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
    collection,
    where,
    getDocs,
} from './firebase.js';
import { displayUserProfile } from './app.js';
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

const fileInput = document.querySelector('.file-input');
const uploadButton = document.querySelector('.upload-btn');
let selectedFile; 

fileInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
});

uploadButton.addEventListener('click', () => {
    if (selectedFile) {
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
                displayUserProfile()
            });
        }).catch((error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al actualizar avatar!",
                footer: `${error.message}`
            });
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor selecciona una imagen!"
        });
    }
});

const fileInputHeader = document.querySelector('.file-input-header');
const uploadButtonHeader = document.querySelector('.upload-btn-header');
let selectedFileHeader; 

fileInputHeader.addEventListener('change', (event) => {
    selectedFileHeader = event.target.files[0];
});

uploadButtonHeader.addEventListener('click', () => {
    if (selectedFileHeader) {
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
                displayUserProfile()
            });
        }).catch((error) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al actualizar header!",
                footer: `${error.message}`
            });
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor selecciona una imagen!"
        });
    }
});