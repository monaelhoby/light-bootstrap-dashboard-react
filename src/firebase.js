import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";


const app = firebase.initializeApp({
  apiKey: "AIzaSyAd1vMyPwIQUhUmvyBR6Bo2YHfsZ5Dc4hU",
  authDomain: "mo-licence-app.firebaseapp.com",
  projectId: "mo-licence-app",
  storageBucket: "mo-licence-app.appspot.com",
  messagingSenderId: "166079571586",
  appId: "1:166079571586:web:31f88ec5482339d28d369b",
  measurementId: "G-LG5LQEPQTM",
});

export const auth = app.auth();
export const db = app.firestore();
export const functions = app.functions();
export const storage = firebase.storage()

export default app;
