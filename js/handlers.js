import {
    auth,
    db,
    doc,
    collection,
    addDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    deleteDoc
} from './firebase.js';
import { fetchPosts } from './paginas/text.js';
import { displayLikedTweets } from './paginas/liked.js';
import { displayReTweets } from './paginas/retweet.js';

// Function to handle the like logic
export const handleLike = async (postId) => {
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
            displayLikedTweets();
        } else {
            console.log('Post does not exist!');
        }
    } catch (error) {
        console.error('Error updating likes:', error.message);
    }
};

// Function to handle the comment logic
export const handleComment = async (postId, commentText) => {
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

// Function to handle retweet logic
export const handleRetweet = async (postId) => {
    try {
        const userId = auth.currentUser.uid;
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const currentRetweets = postData.retweets || 0;
            const retweetsBy = postData.retweetsBy || [];

            if (retweetsBy.includes(userId)) {
                console.log('You have already retweeted this post!');
                return; // Exit the function if the user has already retweeted
            }

            // User has not retweeted the post, so add the retweet
            await updateDoc(postRef, {
                retweets: currentRetweets + 1,
                retweetsBy: arrayUnion(userId), // Add user ID to retweetsBy
            });

            // Create a new post for the retweet
            await addDoc(collection(db, 'posts'), {
                text: `Retweeted: ${postData.text}`, // Add "Retweeted" prefix to the text
                userId: userId,
                postImg: postData.postImg, // Optional: Include the image if there is one
                timestamp: serverTimestamp(),
                isRetweet: true,
                retweets: 0,
            });

            // Re-fetch the posts to update the UI
            fetchPosts();
            displayReTweets();
        } else {
            console.log('Post does not exist!');
        }
    } catch (error) {
        console.error('Error updating retweets:', error.message);
    }
};

// Función para eliminar el post de Firebase
export const deletePost = async (postId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);
        
        // Asegúrate de que el post existe y de que el usuario actual es el creador
        if (postSnapshot.exists() && postSnapshot.data().userId === auth.currentUser.uid) {
            Swal.fire({
                icon: "warning",
                title: "¿Estás seguro de que deseas eliminar este post?",
                showDenyButton: true,
                confirmButtonText: "Si",
                denyButtonText: `No`
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    deleteDoc(postRef);
                    Swal.fire("Post eliminado con éxito.");
                    fetchPosts();
                    displayReTweets();
                } else if (result.isDenied) {
                    return
                }
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No tienes permiso para eliminar este post.",
                footer: 'Posiblemente no eres el creador de este post'
            });
        }
    } catch (error) {
        console.error('Error al eliminar el post:', error.message);
    }
};