import {
    auth,
    db,
    doc,
    getDoc,
} from './firebase.js';

// Referencia al div con la clase 'admin'
const adminDiv = document.getElementById('admin-main-btn');

// Oculta el div 'admin' por defecto
adminDiv.style.display = 'none';

// Verifica el estado de autenticación del usuario
auth.onAuthStateChanged(async (user) => {  // Cambiamos a función async
  if (user) {
    // Si el usuario está autenticado, obtenemos su UID
    const userId = auth.currentUser.uid;

    try {
        // Referencia al documento del usuario en Firestore
        const userDocRef = doc(db, 'users', userId);
        
        // Usamos await para obtener el documento
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Verifica si el usuario tiene el rol de 'admin'
            if (userData.rol === 'admin') {
                // Muestra el div admin
                adminDiv.style.display = 'block';

                // Aquí puedes agregar la lógica para permitir la interacción
                // con el div admin si es necesario
            }
        } else {
            console.log('El documento del usuario no existe.');
        }
    } catch (error) {
        console.error('Error al obtener el documento del usuario:', error);
    }
  } else {
    console.log('El usuario no está autenticado.');
  }
});
