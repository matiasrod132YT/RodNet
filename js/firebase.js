// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, addDoc, deleteDoc, getDoc, updateDoc, getDocs, orderBy, query, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, where, documentId } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrnq6tmDhu9QE6EnjsECpM4xHHaVYNw2s",
  authDomain: "rodnet-122a8.firebaseapp.com",
  projectId: "rodnet-122a8",
  storageBucket: "rodnet-122a8.appspot.com",
  messagingSenderId: "497765010390",
  appId: "1:497765010390:web:4b0f14376dd587a3e4f277"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  setDoc, 
  doc, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  getStorage,
  ref,
  deleteDoc,
  uploadBytes,
  getDownloadURL,
  serverTimestamp,
  onSnapshot,
  where,
  documentId,
};