import {
    db,
    collection,
    query,
    orderBy,
    getDocs,
} from './firebase.js';
const trendsList = document.querySelector('.trends-list');

// Función para actualizar la sección de tendencias
export const updateTrends = async () => {
    try {
        const postsQuery = query(collection(db, 'posts'), orderBy('likes', 'desc')); // Ordenar por likes en orden descendente
        const querySnapshot = await getDocs(postsQuery);
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Obtener los top 5 posts con más likes
        const topPosts = posts.slice(0, 5);

        trendsList.innerHTML = ''; // Limpiar la lista de tendencias
        topPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('trend-post');
            postElement.setAttribute('data-post-id', post.id);
            postElement.innerHTML = `
                <div class="trending-post">
                    <div class="trending-info">
                        <div class="trending-country-options-container">
                        <div class="trending-country">${post.text}</div>
                        </div>
                        <div class="trending-post-title">${post.text}</div>
                        <div class="trending-post-detail">

                        </div>
                        <div class="trending-post-number-tweets">${post.likes || 0} likes</div>
                    </div>
                </div>
            `;
            trendsList.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error updating trends:', error.message);
    }
};

// Agregar un event listener para redirigir al post original al hacer clic en Trends
trendsList.addEventListener('click', (event) => {
    const trendPost = event.target.closest('.trend-post');
    if (trendPost) {
        const postId = trendPost.getAttribute('data-post-id');
        scrollToPost(postId); // Llamar a la función que hace scroll al post original
    }
});

// Función para hacer scroll al post original en el feed
const scrollToPost = (postId) => {
    const postElement = document.querySelector(`.tweet-post[data-id="${postId}"]`);
    if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Hacer scroll suave al post
        postElement.classList.add('highlight'); // Puedes agregar una clase temporal para resaltarlo

        // Remover el highlight después de 2 segundos
        setTimeout(() => {
            postElement.classList.remove('highlight');
        }, 2000);
    } else {
        console.error('No se encontró el post original en el feed.');
    }
};