// Firebase Configuration for LuxuryBot Ultimate
const firebaseConfig = {
    apiKey: "AIzaSyBxTmaI-7PIIOQw-KuOLRTDGg3du13Rgio",
    authDomain: "luxurybot-75364.firebaseapp.com",
    projectId: "luxurybot-75364",
    storageBucket: "luxurybot-75364.firebasestorage.app",
    messagingSenderId: "281432080913",
    appId: "1:281432080913:web:fee98875d23d9754a4e7b0",
    measurementId: "G-JL47XJRGVN"
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
