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
} from '../apis/firebase.js';
import { escapeHtml } from '../apis/escapeHtml.js';

// Maneja el formulario para agregar notificaciones
const notificacionesForm = document.getElementById('notificacionesForm');

notificacionesForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita que se recargue la página al enviar el formulario
    
    const postButton = document.getElementById('notificacion-button'); // El botón de envío del post
    postButton.disabled = true;
    
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        // Obtén los valores del formulario
        const mensaje = document.getElementById('mensaje').value;

        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            
            if (userData.admin === true) {
                // Agrega una nueva notificación a la colección 'NOTIFICACIONES'
                await addDoc(collection(db, 'notificaciones'), {
                mensaje: mensaje,
                timestamp: new Date(),
                userId: userId,
                });

                Swal.fire({
                    icon: "success",
                    title: "Notificación",
                    text: "Notificación agregada con éxito.",
                });

                // Limpia el formulario
                notificacionesForm.reset();
            } else {
                Swal.fire({
                  icon: "error",
                  title: "ERROR",
                  text: "No eres administrador para realizar esto.",
                });
            }
        } catch (error) {
            console.error('Error al agregar la notificación:', error);
            Swal.fire({
                icon: "error",
                title: "ERROR",
                text: "Error al agregar la notificación.",
                footer: error,
            });
        } finally {
            postButton.disabled = false;
        }
    } else {
        postButton.disabled = false;
    }
});
const notificacionesContainer = document.querySelector('.notificaciones-container');

// Función para mostrar las notificaciones
export const displayNotificaciones = async () => {
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        try {
            // Obtener el nombre de usuario
            const userDoc = await getDoc(doc(db, 'users', userId)); // Ajusta 'users' a tu colección de usuarios
            const userData = userDoc.data();

            // Consulta para obtener todas las notificaciones
            const q = query(collection(db, 'notificaciones'), orderBy('timestamp', 'desc'));

            // Escuchar los cambios en tiempo real
            onSnapshot(q, (snapshot) => {
                // Limpiar la lista de notificaciones antes de agregar las nuevas
                notificacionesContainer.innerHTML = '';
                
                // Recorrer todas las notificaciones
                snapshot.forEach((doc) => {
                    const notificacion = doc.data();

                    // Crear un elemento para la notificación
                    const notificacionElement = document.createElement('div');
                    notificacionElement.classList.add('tweet');
                    notificacionElement.innerHTML = `
                            <div class="tweet-post">
                                <div class="compose-profile-container retweet-style">
                                    <img class="compose-profile" src="${userData.avatarUrl || './images/avatar.png'}" draggable="false" alt="Imagen de perfil">
                                    <div class="tweet-profile-content-container">
                                        <div class="tweet-profile-title-container">
                                            <div class="tweet-profile-info">
                                                <div class="tweet-profile-title">${escapeHtml(userData.username || 'Anonymous')}</div>
                                                <div class="tweet-handle">@${escapeHtml(userData.userHandle || 'Anonymous')}</div>
                                            </div>
                                        </div>
                                        <div class="tweet-content">${escapeHtml(notificacion.mensaje)}</div>
                                    </div>
                                </div>

                                ${notificacion.postImg ? `<div class="img-placeholder"><img class="tweet-photo" src="${notificacion.postImg}" alt="Imagen del post"></div>` : ''}
                            </div>
                        `;
                    
                    // Agregar la notificación al contenedor
                    notificacionesContainer.appendChild(notificacionElement);
                });
            });

        } catch (error) {
            console.error('Error fetching notifications:', error.message);
        }
    }
};
