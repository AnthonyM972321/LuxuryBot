// Firebase Configuration for LuxuryBot Ultimate
const firebaseConfig = {
    apiKey: "AIzaSyCGnf1iKCfGN_tmtBgTUvTABXqyzawDQvs",
    authDomain: "luxurybot-75364.firebaseapp.com",
    projectId: "luxurybot-75364",
    storageBucket: "luxurybot-75364.firebasestorage.app",
    messagingSenderId: "281432088913",
    appId: "1:281432088913:web:9116b14583ead81ba4e7b8",
    measurementId: "G-K9MB3P58E5"
};

// Initialize Firebase only if the SDK is loaded
if (typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase app
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore database
        const db = firebase.firestore();
        
        // Initialize Authentication
        const auth = firebase.auth();
        
        // Make database and auth globally accessible
        window.db = db;
        window.auth = auth;
        
        // Log success
        console.log('Firebase initialized successfully');
        
        // Update Firebase status indicator after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateFirebaseStatus);
        } else {
            updateFirebaseStatus();
        }
        
        function updateFirebaseStatus() {
            const statusEl = document.getElementById('firebase-status');
            const statusTextEl = document.getElementById('firebase-status-text');
            
            if (statusEl && statusTextEl) {
                statusEl.classList.remove('disconnected');
                statusEl.classList.add('connected');
                statusTextEl.textContent = 'Connecté';
                
                // Optional: Show success notification
                if (typeof showToast === 'function') {
                    setTimeout(() => {
                        showToast('success', 'Firebase', 'Base de données connectée');
                    }, 1000);
                }
            }
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
        
        // Update status to show error
        const statusEl = document.getElementById('firebase-status');
        const statusTextEl = document.getElementById('firebase-status-text');
        
        if (statusEl && statusTextEl) {
            statusEl.classList.add('disconnected');
            statusTextEl.textContent = 'Erreur de connexion';
        }
    }
} else {
    console.warn('Firebase SDK not loaded. Please check your script tags.');
}
