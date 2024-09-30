import {
    auth,
    collection,
    db,
    doc,
    getDoc,
    where,
    getDocs,
    query,
    updateDoc,
} from './apis/firebase.js';

// Referencia al div con la clase 'admin'
const adminDiv = document.getElementById('admin-main-btn');

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
            if (userData.admin === true) {
              // Muestra el div admin
              adminDiv.style.display = 'block';
              // Habilita formularios o botones solo para administradores
              verificacionForm.style.display = 'flex';
              administradorForm.style.display = 'flex';
            } else {
                // Si el usuario no es admin, ocultar elementos que no deben ser visibles
                verificacionForm.style.display = 'none';
                administradorForm.style.display = 'none';
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

// Maneja el formulario para agregar verificacion
const verificacionForm = document.getElementById('verificacionForm');

verificacionForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que se recargue la página al enviar el formulario

    const postButton = document.getElementById('verificado-button'); // El botón de envío del post
    postButton.disabled = true;

    if (auth.currentUser) {
        // Obtén los valores del formulario
        const verificado = document.getElementById('username-verificado').value;

        try {
            // Agrégale rol verificado
            const usuariosRef = collection(db, 'users');
            const q = query(usuariosRef, where('userHandle', '==', verificado));
            const querySnapshot = await getDocs(q);

            const userDoc = querySnapshot.docs[0];
            const verificadoId = userDoc.id;
            const userData = userDoc.data();
            
            if (userData.admin === true) {
              if(querySnapshot.empty){
                Swal.fire({
                  icon: "error",
                  title: "Usuario no encontrado",
                  text: `No se encontró ningún usuario con el nombre: ${verificado}`,
                });
                return;
              }

              if(userData.verificado === true) {
                await updateDoc(doc(db, 'users', verificadoId), {
                  verificado: false,
                });
    
                Swal.fire({
                  icon: "success",
                  title: "Verificado",
                  text: `Se ha eliminado el verificado al usuario: ${verificado}`,
                })
    
                // Limpia el formulario
                verificacionForm.reset();
              } else if(userData.verificado === false) {
                await updateDoc(doc(db, 'users', verificadoId), {
                  verificado: true,
                });
    
                Swal.fire({
                  icon: "success",
                  title: "Verificado",
                  text: `Se ha agregado el verificado al usuario: ${verificado}`,
                })
    
                // Limpia el formulario
                verificacionForm.reset();
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "ERROR",
                text: "No eres administrador para realizar esto.",
              });
            }
        } catch (error) {
            console.error('Error al agregar el verificado:', error);
            Swal.fire({
                icon: "error",
                title: "ERROR",
                text: "Error al agregar el verificado.",
                footer: error.message,
            });
        } finally {
          postButton.disabled = false;
        }
    } else {
      postButton.disabled = false;
    }
});

// Maneja el formulario para agregar verificacion
const administradorForm = document.getElementById('administradorForm');

administradorForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que se recargue la página al enviar el formulario
    
    const postButton = document.getElementById('admin-button'); // El botón de envío del post
    postButton.disabled = true;

    if (auth.currentUser) {
        // Obtén los valores del formulario
        const administrador = document.getElementById('username-administrador').value;

        try {
            // Agrégale rol verificado
            const usuariosRef = collection(db, 'users');
            const q = query(usuariosRef, where('userHandle', '==', administrador));
            const querySnapshot = await getDocs(q);

            const userDoc = querySnapshot.docs[0];
            const verificadoId = userDoc.id;
            const userData = userDoc.data();
          
            if (userData.admin === true) {
                if(querySnapshot.empty){
                  Swal.fire({
                    icon: "error",
                    title: "Usuario no encontrado",
                    text: `No se encontró ningún usuario con el nombre: ${administrador}`,
                  });
                  return;
                }

                if(userData.admin === true) {
                  await updateDoc(doc(db, 'users', verificadoId), {
                    admin: false,
                  });
      
                  Swal.fire({
                    icon: "success",
                    title: "Administrador",
                    text: `Se ha eliminado de administrador al usuario: ${administrador}`,
                  })
      
                  // Limpia el formulario
                  administradorForm.reset();
                } else if(userData.admin === false) {
                  await updateDoc(doc(db, 'users', verificadoId), {
                    admin: true,
                  });
      
                  Swal.fire({
                    icon: "success",
                    title: "Administrador",
                    text: `Se ha agregado de administrador al usuario: ${administrador}`,
                  })
      
                  // Limpia el formulario
                  administradorForm.reset();
                }
            } else {
              Swal.fire({
                icon: "error",
                title: "ERROR",
                text: "No eres administrador para realizar esto.",
              });
            }
        } catch (error) {
            console.error('Error al agregar el verificado:', error);
            Swal.fire({
                icon: "error",
                title: "ERROR",
                text: "Error al agregar de administrador.",
                footer: error.message,
            });
        } finally {
          postButton.disabled = false;
        }
    } else {
      postButton.disabled = false;
    }
});