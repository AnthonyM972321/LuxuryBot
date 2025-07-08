// Firebase Configuration for LuxuryBot 2025
const firebaseConfig = {
    apiKey: "AIzaSyBizsO7yXnWRM5vee_bXOWCjsI5pjbzQeQ",
    authDomain: "luxurybot-2025.firebaseapp.com",
    projectId: "luxurybot-2025",
    storageBucket: "luxurybot-2025.firebasestorage.app",
    messagingSenderId: "230384704534",
    appId: "1:230384704534:web:f186d66c796f6551d32937"
};

// Initialize Firebase immediately when this script loads
try {
    // Check if Firebase SDK is loaded
    if (typeof firebase !== 'undefined') {
        // Initialize Firebase app
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase app initialized successfully');
        
        // Initialize and expose Firebase services globally
        window.db = firebase.firestore();
        window.auth = firebase.auth();
        
        console.log('✅ Firestore and Auth services ready');
        
        // Update Firebase status indicator if DOM is ready
        function updateFirebaseStatus() {
            const statusEl = document.getElementById('firebase-status');
            const statusTextEl = document.getElementById('firebase-status-text');
            
            if (statusEl && statusTextEl) {
                statusEl.classList.remove('disconnected');
                statusEl.classList.add('connected');
                statusTextEl.textContent = 'Connecté';
                console.log('✅ Firebase status updated in UI');
            }
        }
        
        // Update status when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateFirebaseStatus);
        } else {
            updateFirebaseStatus();
        }
        
        // Set flag to indicate Firebase is ready
        window.firebaseReady = true;
        
        // Dispatch custom event to notify that Firebase is ready
        window.dispatchEvent(new Event('firebaseReady'));
        
    } else {
        console.error('❌ Firebase SDK not loaded. Check your script tags.');
        window.firebaseReady = false;
    }
    
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    window.firebaseReady = false;
    
    // Update status to show error
    if (document.getElementById('firebase-status')) {
        const statusEl = document.getElementById('firebase-status');
        const statusTextEl = document.getElementById('firebase-status-text');
        
        if (statusEl && statusTextEl) {
            statusEl.classList.add('disconnected');
            statusTextEl.textContent = 'Erreur de connexion';
        }
    }
}

// Export config for debugging
window.firebaseConfig = firebaseConfig;

// Log Firebase state
console.log('Firebase Config loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    initialized: window.firebaseReady || false
});
