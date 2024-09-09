import { 
    auth,
    db,
    setDoc,
    doc,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from './firebase.js';

// Toggle between Login and Register forms
document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
});

// Login
document.getElementById('login-button')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html'; // Redirect to dashboard on successful login
    } catch (error) {
        console.error('Login Error:', error);
        alert(`Error: ${error.message}`);
    }
});

// Register
document.getElementById('register-button')?.addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Usuario registrado:", user.uid);

        // Guardar información del usuario en Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email
        });
        console.log("Documento creado en Firestore para el usuario:", user.uid);

        window.location.href = 'dashboard.html'; // Redirigir al dashboard en caso de éxito
    } catch (error) {
        console.error('Error en el registro:', error);
        alert(`Error: ${error.message}`);
    }
});


auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});