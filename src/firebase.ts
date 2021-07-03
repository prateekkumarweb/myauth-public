import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, useAuthEmulator } from "firebase/auth";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import firebaseConfig from "../firebase-config.json";
import { useStore } from "./store";

initializeApp(firebaseConfig);
getAnalytics();
const db = getFirestore();
if (import.meta.env.DEV) useFirestoreEmulator(db, "localhost", 8080);
const auth = getAuth();
if (import.meta.env.DEV) useAuthEmulator(auth, "http://localhost:9099");

console.log("Firebase loaded");

export async function setAuthObserver(): Promise<void> {
  const store = useStore();
  store.startLoading();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      store.signIn(user);
      await store.loadInitialData();
    } else {
      store.signOut();
    }
    console.log("Sign in state changed");
    store.stopLoading();
  });
}
