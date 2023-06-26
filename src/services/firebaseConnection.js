import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACa7iTembJFBOAp6ta-crhy5bKL2Cb-wo",
  authDomain: "todolist-bbf8b.firebaseapp.com",
  projectId: "todolist-bbf8b",
  storageBucket: "todolist-bbf8b.appspot.com",
  messagingSenderId: "927062490124",
  appId: "1:927062490124:web:a81ed525ae2f825997c229"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export {db};