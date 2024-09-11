import {
    auth,
    db,
    addDoc,
    collection,
    query,
    getDoc,
    doc,
    orderBy,
    onSnapshot
} from '../firebase.js';

// Maneja el formulario para agregar notificaciones
const notificacionesForm = document.getElementById('notificacionesForm');

notificacionesForm.addEventListener('submit', async (e) => {
  e.preventDefault();  // Evita que se recargue la página al enviar el formulario

  // Obtén los valores del formulario
  const titulo = document.getElementById('titulo').value;
  const mensaje = document.getElementById('mensaje').value;

  try {
    // Agrega una nueva notificación a la colección 'NOTIFICACIONES'
    await addDoc(collection(db, 'notificaciones'), {
      titulo: titulo,
      mensaje: mensaje,
      timestamp: new Date()
    });

    Swal.fire({
        icon: "success",
        title: "Notificación",
        text: "Notificación agregada con éxito.",
    });

    // Limpia el formulario
    notificacionesForm.reset();
  } catch (error) {
    console.error('Error al agregar la notificación:', error);
    Swal.fire({
        icon: "error",
        title: "ERROR",
        text: "Error al agregar la notificación.",
        footer: error,
    });
  }
});

// Función para cargar notificaciones en tiempo real
const cargarNotificaciones = () => {
    const listaNotificaciones = document.getElementById('listaNotificaciones');
    
    // Crear una consulta ordenada por timestamp
    const q = query(collection(db, 'notificaciones'), orderBy('timestamp', 'desc'));

    // Escuchar los cambios en tiempo real
    onSnapshot(q, (snapshot) => {
      // Limpiar la lista de notificaciones antes de agregar las nuevas
      listaNotificaciones.innerHTML = '';

      // Iterar sobre los documentos en la colección 'notificaciones'
      snapshot.forEach((doc) => {
        const notificacion = doc.data();
        
        // Crear un elemento de lista para cada notificación
        const li = document.createElement('li');
        li.innerHTML = `<strong>${notificacion.titulo}</strong>: ${notificacion.mensaje}`;
        
        // Agregar el elemento de lista al ul
        listaNotificaciones.appendChild(li);
      });
    });
}

const notificacionesContainer = document.querySelector('.notificaciones-container');

// Función para mostrar los tweets que el usuario ha dado like
export const displayNotificaciones = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        try {
            // Obtener el nombre de usuario
            const userDoc = await getDoc(doc(db, 'users', userId)); // Ajusta 'users' a tu colección de usuarios

            // Consulta para obtener todos los tweets que el usuario ha dado like
            const q = query(collection(db, 'notificaciones'), orderBy('timestamp', 'desc'));

            // Escuchar los cambios en tiempo real
            onSnapshot(q, (snapshot) => {
                // Limpiar la lista de notificaciones antes de agregar las nuevas
                notificacionesContainer.innerHTML = '';
        
                // Iterar sobre los documentos en la colección 'notificaciones'
                snapshot.forEach((doc) => {
                    const notificacion = doc.data();
                    
                    // Crear un elemento de lista para cada notificación
                    const tweetElement = document.createElement('div');
                    tweetElement.classList.add('tweet');
                    tweetElement.innerHTML = `<strong>${notificacion.titulo}</strong>: ${notificacion.mensaje}`;
                    tweetElement.innerHTML = `
                            <div class="tweet-post">
                                <div class="compose-profile-container retweet-style">
                                    <div class="tweet-profile-content-container">
                                        <div class="tweet-profile-title-container">
                                            <div class="tweet-profile-info">
                                                <div class="tweet-profile-title">${notificacion.titulo}</div>
                                                <div class="tweet-handle"> · ${new Date(notificacion.timestamp.seconds * 1000).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                        <div class="tweet-content">${notificacion.mensaje}</div>
                                    </div>
                                </div>

                                ${notificacion.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${notificacion.postImg}" alt="Imagen del post"></div>` : ''}
                            </div>
                        `;
                    
                    // Agregar el elemento de lista al ul
                    notificacionesContainer.appendChild(tweetElement);
                });
            });


        } catch (error) {
            console.error('Error fetching liked tweets:', error.message);
        }
    }
};