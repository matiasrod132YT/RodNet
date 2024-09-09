// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, setDoc, doc, collection, addDoc, getDoc, updateDoc, getDocs, orderBy, query, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDu-_SZrQsvlbBpwgSGhn8CGtLqTux66Fc",
  authDomain: "rodnet-e803a.firebaseapp.com",
  projectId: "rodnet-e803a",
  storageBucket: "rodnet-e803a.appspot.com",
  messagingSenderId: "326317511521",
  appId: "1:326317511521:web:fb39f45fea2900cc33ab20",
  measurementId: "G-MJ52Z4Y0T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  getFirestore,
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
  uploadBytes,
  getDownloadURL,
  serverTimestamp,
  onSnapshot,
  where,
};