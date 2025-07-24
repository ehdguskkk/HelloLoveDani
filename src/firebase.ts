// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAxlck-sunnSzzzRTH6HzCk9l7Nctb0Z_g",
  authDomain: "hellolovedani.firebaseapp.com",
  projectId: "hellolovedani",
  storageBucket: "hellolovedani.appspot.com",
  messagingSenderId: "232281097976",
  appId: "1:232281007976:web:97c6d9bd53affce5b298dd"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore와 Auth 모듈 추출
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { db, auth, storage };