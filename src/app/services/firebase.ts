import { initializeApp, getApps, getApp } from "firebase/app";
//////////////////////////////////////////////////////PB======================================
//////////////////////////////////////////////////////PB======================================
//////////////////////////////////////////////////////PB======================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMHfkZmXUpTVecnadXzbzD_XrkMlTEpRc",
  authDomain: "employee-directory-ee86f.firebaseapp.com",
  projectId: "employee-directory-ee86f",
  storageBucket: "employee-directory-ee86f.firebasestorage.app",
  messagingSenderId: "691218096027",
  appId: "1:691218096027:web:12d28fd3341748454dcb3e",
  measurementId: "G-46CE2KJHSM",
};
//////////////////////////////////////////////////////PB======================================
//////////////////////////////////////////////////////PB======================================
//////////////////////////////////////////////////////PB======================================

// test account
// const firebaseConfig = {
//   apiKey: "AIzaSyAQtD5DfKEtu4kn80wAhOf_swKEy6ZWvNw",
//   authDomain: "pb-telephone-directory.firebaseapp.com",
//   projectId: "pb-telephone-directory",
//   storageBucket: "pb-telephone-directory.firebasestorage.app",
//   messagingSenderId: "554046369315",
//   appId: "1:554046369315:web:c10be8b4815210cb368b96",
//   measurementId: "G-0SJKMQVPRZ",
// };

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
