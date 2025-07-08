// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGnf1iKCfGN_tmtBgTUvTABXqyzawDQvs",
    authDomain: "luxurybot-75364.firebaseapp.com",
    projectId: "luxurybot-75364",
    storageBucket: "luxurybot-75364.firebasestorage.app",
    messagingSenderId: "281432088913",
    appId: "1:281432088913:web:9116b14583ead81ba4e7b8",
    measurementId: "G-K9MB3P58E5"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firestore
    const db = firebase.firestore();
    
    // Initialize Auth
    const auth = firebase.auth();
    
    console.log('Firebase initialized successfully');
    
    // Update Firebase status indicator
    const statusEl = document.getElementById('firebase-status');
    const statusTextEl = document.getElementById('firebase-status-text');
    if (statusEl && statusTextEl) {
        statusEl.classList.remove('disconnected');
        statusEl.classList.add('connected');
        statusTextEl.textContent = 'Connecté';
    }
}
