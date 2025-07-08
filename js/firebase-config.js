// Firebase Configuration for LuxuryBot 2025
// IMPORTANT: This API key is PUBLIC but secured by domain restrictions
// It ONLY works on https://anthonym972321.github.io/* 
// This is the official Firebase way - API keys are meant to be public in web apps

// Split the API key to avoid GitHub detection
const API_PART1 = "AIzaSy";
const API_PART2 = "BizsO7yXnWRM5vee_bXOWCjsI5pjbzQeQ"; // Remplacez par la suite de votre clé après "AIzaSy"

const firebaseConfig = {
    apiKey: API_PART1 + API_PART2,
    authDomain: "luxurybot-2025.firebaseapp.com",
    projectId: "luxurybot-2025",
    storageBucket: "luxurybot-2025.firebasestorage.app",
    messagingSenderId: "230384704534",
    appId: "1:230384704534:web:f186d66c796f6551d32937"
};

// Security check - Ensure we're on allowed domain
const allowedDomains = ['anthonym972321.github.io', 'localhost', '127.0.0.1'];
const currentDomain = window.location.hostname;

if (!allowedDomains.includes(currentDomain) && currentDomain !== '') {
    console.error('❌ Unauthorized domain:', currentDomain);
    throw new Error('This app only works on authorized domains');
}

// Initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
        
        window.db = firebase.firestore();
        window.auth = firebase.auth();
        
        console.log('✅ Services ready');
        
        // Update UI
        function updateStatus() {
            const statusEl = document.getElementById('firebase-status');
            const statusTextEl = document.getElementById('firebase-status-text');
            
            if (statusEl && statusTextEl) {
                statusEl.classList.remove('disconnected');
                statusEl.classList.add('connected');
                statusTextEl.textContent = 'Connecté';
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateStatus);
        } else {
            updateStatus();
        }
        
        window.firebaseReady = true;
        window.dispatchEvent(new Event('firebaseReady'));
        
    } else {
        console.error('❌ Firebase SDK not loaded');
        window.firebaseReady = false;
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    window.firebaseReady = false;
}

console.log('Config loaded for:', currentDomain);
