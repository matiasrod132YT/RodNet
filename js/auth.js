import {
  auth,
  db, 
  setDoc, 
  doc, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
 } from "./firebase.js"

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
        Swal.fire({
            icon: "error",
            title: "Error",
            text: `${error.message}`
        });
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

        // Save user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            userHandle: email.split('@')[0],
        });

        window.location.href = 'dashboard.html'; // Redirect to dashboard on successful registration
    } catch (error) {
        console.error('Registration Error:', error);
        alert(`Error: ${error.message}`);
    }
});