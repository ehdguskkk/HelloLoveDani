import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ⚠️ 아래 값들은 네 프로젝트 콘솔에서 발급된 값 그대로 사용
const firebaseConfig = {
  apiKey: "AIzaSyAxlck-sunnSzzzRTH6HzCk9l7Nctb0Z_g",
  authDomain: "hellolovedani.firebaseapp.com",
  projectId: "hellolovedani",
  storageBucket: "hellolovedani.firebasestorage.app",
  messagingSenderId: "232281007976",
  appId: "1:232281007976:web:97c6d9bd53affce5b298dd"
};

// Hot-reload 시 중복 초기화 방지
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore / Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ 명시적으로 같은 버킷을 지정(안전)
export const storage = getStorage(app, 'gs://hellolovedani.firebasestorage.app');