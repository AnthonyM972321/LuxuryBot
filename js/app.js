// LuxuryBot Ultimate - Application principale

// Global state
let state = {
    properties: [],
    guides: {},
    currentProperty: null,
    currentLanguage: 'fr',
    currentUser: null,
    map: null,
    markers: {},
    firebaseConnected: false,
    aiGeneratedCount: 0
};

// Wait for Firebase to be ready
window.addEventListener('firebaseReady', function() {
    console.log('📱 Firebase ready event received');
    initializeApp();
});

// Also check on page load in case Firebase is already ready
window.addEventListener('load', function() {
    console.log('📄 Page loaded');
    
    // If Firebase is already ready, initialize
    if (window.firebaseReady && window.auth && window.db) {
        console.log('✅ Firebase already ready, initializing app');
        initializeApp();
    } else {
        console.log('⏳ Waiting for Firebase...');
    }
});

// Initialize the application
function initializeApp() {
    console.log('🚀 Initializing LuxuryBot Ultimate...');
    
    // Check if already initialized
    if (window.appInitialized) {
        console.log('⚠️ App already initialized');
        return;
    }
    
    window.appInitialized = true;
    
    // Setup authentication state listener
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            console.log('🔐 Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                // User is signed in
                state.currentUser = user;
                showMainApp();
                loadUserData();
                updateUserProfile();
            } else {
                // User is signed out
                state.currentUser = null;
                showLoginPage();
            }
        });
    } else {
        console.error('❌ Auth not available');
        showLoginPage();
    }
    
    // Setup forms
    setupForms();
    
    // Load saved data
    loadFromLocalStorage();
    updateDashboard();
    initializeMap();
    
    // Check saved integrations
    checkSavedIntegrations();
    
    // Load theme preference
    if (localStorage.getItem('luxurybot_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
    
    console.log('✅ App initialization complete');
}

// Setup all forms
function setupForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Property form
    const propertyForm = document.getElementById('property-form');
    if (propertyForm) {
        propertyForm.addEventListener('submit', handlePropertySubmit);
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔑 Login attempt...');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!window.auth) {
        showToast('error', 'Erreur', 'Service d\'authentification non disponible');
        return;
    }
    
    try {
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login successful:', user.email);
        
        if (rememberMe) {
            localStorage.setItem('luxurybot_remember', 'true');
        }
        
        showToast('success', 'Connexion réussie', `Bienvenue ${user.email}`);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        let message = 'Erreur de connexion';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Utilisateur non trouvé';
                break;
            case 'auth/wrong-password':
                message = 'Mot de passe incorrect';
                break;
            case 'auth/invalid-email':
                message = 'Email invalide';
                break;
            case 'auth/network-request-failed':
                message = 'Erreur réseau - Vérifiez votre connexion';
                break;
            case 'auth/too-many-requests':
                message = 'Trop de tentatives - Réessayez plus tard';
                break;
        }
        
        showToast('error', 'Erreur', message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('📝 Register attempt...');
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!window.auth) {
        showToast('error', 'Erreur', 'Service d\'authentification non disponible');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
        return;
    }
    
    if (password.length < 6) {
        showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    try {
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ User created:', user.email);
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        // Create user document in Firestore
        if (window.db) {
            await window.db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('success', 'Compte créé', 'Votre compte a été créé avec succès');
        closeRegisterModal();
        
    } catch (error) {
        console.error('❌ Register error:', error);
        let message = 'Erreur lors de la création du compte';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Cet email est déjà utilisé';
                break;
            case 'auth/invalid-email':
                message = 'Email invalide';
                break;
            case 'auth/weak-password':
                message = 'Mot de passe trop faible';
                break;
            case 'auth/network-request-failed':
                message = 'Erreur réseau - Vérifiez votre connexion';
                break;
        }
        
        showToast('error', 'Erreur', message);
    }
}

function logout() {
    if (window.auth) {
        window.auth.signOut().then(() => {
            showToast('success', 'Déconnexion', 'À bientôt !');
            localStorage.removeItem('luxurybot_remember');
            state.currentUser = null;
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            showToast('error', 'Erreur', 'Impossible de se déconnecter');
        });
    }
}

// UI State Management
function showMainApp() {
    console.log('🏠 Showing main app...');
    const loginSection = document.getElementById('login');
    const dashboardSection = document.getElementById('dashboard');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const themeToggle = document.querySelector('.theme-toggle');
    const firebaseStatus = document.querySelector('.firebase-status');
    
    if (loginSection) loginSection.classList.remove('active');
    if (dashboardSection) dashboardSection.classList.add('active');
    if (nav) nav.style.display = 'block';
    if (header) header.style.display = 'block';
    if (themeToggle) themeToggle.style.display = 'flex';
    if (firebaseStatus) firebaseStatus.style.display = 'flex';
}

function showLoginPage() {
    console.log('🔐 Showing login page...');
    const loginSection = document.getElementById('login');
    if (loginSection) {
        loginSection.classList.add('active');
    }
    
    document.querySelectorAll('.section:not(#login)').forEach(section => {
        section.classList.remove('active');
    });
    
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const themeToggle = document.querySelector('.theme-toggle');
    const firebaseStatus = document.querySelector('.firebase-status');
    
    if (nav) nav.style.display = 'none';
    if (header) header.style.display = 'none';
    if (themeToggle) themeToggle.style.display = 'none';
    if (firebaseStatus) firebaseStatus.style.display = 'none';
}

function showRegister() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('register-form');
        if (form) form.reset();
    }
}

function showForgotPassword() {
    const email = document.getElementById('login-email').value;
    if (!email) {
        showToast('error', 'Erreur', 'Veuillez entrer votre email d\'abord');
        return;
    }
    
    if (window.auth) {
        window.auth.sendPasswordResetEmail(email).then(() => {
            showToast('success', 'Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe');
        }).catch((error) => {
            console.error('❌ Password reset error:', error);
            showToast('error', 'Erreur', 'Impossible d\'envoyer l\'email de réinitialisation');
        });
    }
}

// User Profile Management
async function updateProfile() {
    const user = state.currentUser;
    if (!user) return;
    
    const name = document.getElementById('user-name').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    try {
        // Update display name
        if (name && name !== user.displayName) {
            await user.updateProfile({ displayName: name });
            
            // Update in Firestore
            if (window.db) {
                await window.db.collection('users').doc(user.uid).update({
                    name: name
                });
            }
        }
        
        // Update password
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
                return;
            }
            if (newPassword.length < 6) {
                showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
                return;
            }
            await user.updatePassword(newPassword);
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }
        
        showToast('success', 'Profil mis à jour', 'Vos informations ont été sauvegardées');
        
    } catch (error) {
        console.error('❌ Update profile error:', error);
        showToast('error', 'Erreur', 'Impossible de mettre à jour le profil');
    }
}

function updateUserProfile() {
    const user = state.currentUser;
    if (user) {
        const nameInput = document.getElementById('user-name');
        const emailInput = document.getElementById('user-email');
        
        if (nameInput) nameInput.value = user.displayName || '';
        if (emailInput) emailInput.value = user.email || '';
    }
}

// Data Management
async function loadUserData() {
    if (!state.currentUser || !window.db) return;
    
    try {
        // Load user properties from Firestore
        const propertiesSnapshot = await window.db.collection('users')
            .doc(state.currentUser.uid)
            .collection('properties')
            .get();
            
        state.properties = [];
        propertiesSnapshot.forEach(doc => {
            state.properties.push({ id: doc.id, ...doc.data() });
        });
        
        // Load guides
        const guidesSnapshot = await window.db.collection('users')
            .doc(state.currentUser.uid)
            .collection('guides')
            .get();
            
        state.guides = {};
        guidesSnapshot.forEach(doc => {
            const data = doc.data();
            if (!state.guides[data.propertyId]) {
                state.guides[data.propertyId] = {};
            }
            state.guides[data.propertyId][data.language] = data.content;
        });
        
        updateDashboard();
        renderProperties();
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
}

// Check saved integrations
function checkSavedIntegrations() {
    const integrations = [
        { key: 'openai_api_key', button: 'configureOpenAI' },
        { key: 'twilio_config', button: 'configureTwilio' },
        { key: 'vapi_api_key', button: 'configureVAPI' },
        { key: 'sendgrid_api_key', button: 'configureSendGrid' },
        { key: 'stripe_api_key', button: 'configureStripe' }
    ];
    
    integrations.forEach(integration => {
        if (localStorage.getItem(integration.key)) {
            const btns = document.querySelectorAll(`button[onclick="${integration.button}()"]`);
            btns.forEach(btn => {
                btn.textContent = 'Connecté';
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-success');
            });
        }
    });
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.includes(getSectionName(sectionId))) {
            item.classList.add('active');
        }
    });
    
    // Special handling for sections
    if (sectionId === 'guides') {
        updatePropertySelect();
    } else if (sectionId === 'settings') {
        setTimeout(checkSavedIntegrations, 100);
    }
}

function getSectionName(sectionId) {
    const names = {
        'dashboard': 'Tableau de bord',
        'properties': 'Mes Logements',
        'guides': 'Guides',
        'messages': 'Messages',
        'analytics': 'Analytiques',
        'ai-config': 'Config IA',
        'settings': 'Paramètres'
    };
    return names[sectionId] || '';
}

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
    localStorage.setItem('luxurybot_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Modal Management
function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function startDemo() {
    closeWelcomeModal();
    const importInput = document.getElementById('import-url');
    if (importInput) {
        importInput.value = 'https://www.airbnb.fr/rooms/12345678';
        importFromURL();
    }
}

// Property Management
function openPropertyModal() {
    const modal = document.getElementById('property-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closePropertyModal() {
    const modal = document.getElementById('property-modal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('property-form');
        if (form) form.reset();
    }
}

function showImportModal() {
    showToast('ai', 'Import Airbnb', 'Collez l\'URL de votre annonce dans la barre d\'import du tableau de bord');
    showSection('dashboard');
    const importInput = document.getElementById('import-url');
    if (importInput) {
        importInput.focus();
    }
}

async function handlePropertySubmit(e) {
    e.preventDefault();
    
    const property = {
        name: document.getElementById('property-name')?.value || 'Sans nom',
        type: document.getElementById('property-type')?.value || 'apartment',
        address: document.getElementById('property-address')?.value || 'Non spécifié',
        bedrooms: parseInt(document.getElementById('property-bedrooms')?.value || 1),
        bathrooms: parseInt(document.getElementById('property-bathrooms')?.value || 1),
        capacity: parseInt(document.getElementById('property-capacity')?.value || 2),
        status: 'available',
        createdAt: new Date().toISOString()
    };
    
    try {
        if (window.db && state.currentUser) {
            const docRef = await window.db.collection('users')
                .doc(state.currentUser.uid)
                .collection('properties')
                .add(property);
            
            property.id = docRef.id;
        } else {
            property.id = Date.now().toString();
        }
        
        state.properties.push(property);
        saveToLocalStorage();
        updateDashboard();
        renderProperties();
        closePropertyModal();
        showToast('success', 'Succès', 'Logement ajouté avec succès');
        
    } catch (error) {
        console.error('❌ Error adding property:', error);
        showToast('error', 'Erreur', 'Impossible d\'ajouter le logement');
    }
}

async function importFromURL() {
    const url = document.getElementById('import-url').value;
    if (!url) {
        showToast('error', 'Erreur', 'Veuillez entrer une URL');
        return;
    }
    
    const loadingEl = document.getElementById('ai-loading');
    if (loadingEl) loadingEl.classList.add('active');
    
    const statuses = [
        'Connexion à la plateforme...',
        'Extraction des données...',
        'Analyse des photos...',
        'Génération des descriptions...',
        'Finalisation...'
    ];
    
    for (let i = 0; i < statuses.length; i++) {
        const substatusEl = document.getElementById('ai-substatus');
        if (substatusEl) substatusEl.textContent = statuses[i];
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const property = {
        name: 'Appartement Vue Mer - Côte d\'Azur',
        type: 'apartment',
        address: 'Nice, France',
        bedrooms: 2,
        bathrooms: 1,
        capacity: 4,
        status: 'available',
        imported: true,
        platform: 'Airbnb',
        createdAt: new Date().toISOString()
    };
    
    try {
        if (window.db && state.currentUser) {
            const docRef = await window.db.collection('users')
                .doc(state.currentUser.uid)
                .collection('properties')
                .add(property);
            
            property.id = docRef.id;
        } else {
            property.id = Date.now().toString();
        }
        
        state.properties.push(property);
        state.aiGeneratedCount++;
        saveToLocalStorage();
        updateDashboard();
        renderProperties();
        
    } catch (error) {
        console.error('❌ Error importing property:', error);
    }
    
    if (loadingEl) loadingEl.classList.remove('active');
    document.getElementById('import-url').value = '';
    
    showToast('ai', 'Import réussi', 'Votre logement a été importé avec succès depuis Airbnb');
    showSection('properties');
}

function renderProperties() {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;
    
    if (state.properties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏠</div>
                <div class="empty-state-title">Aucun logement configuré</div>
                <div class="empty-state-message">
                    Importez depuis Airbnb ou créez manuellement
                </div>
                <button class="btn btn-ai" onclick="showImportModal()">
                    🎯 Importer depuis Airbnb
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = state.properties.map(property => `
        <div class="property-card" onclick="selectProperty('${property.id}')">
            <div class="property-image">
                ${property.imported ? '<div class="property-badges"><span class="property-badge">Importé</span></div>' : ''}
                🏠
            </div>
            <div class="property-content">
                <div class="property-header">
                    <div>
                        <div class="property-title">${property.name}</div>
                        <div class="property-type">${property.type}</div>
                    </div>
                    <div class="property-status status-${property.status}">
                        ${property.status === 'available' ? 'Disponible' : 'Occupé'}
                    </div>
                </div>
                <div class="property-details">
                    <div class="property-detail">
                        <div class="property-detail-value">${property.bedrooms}</div>
                        <div class="property-detail-label">Chambres</div>
                    </div>
                    <div class="property-detail">
                        <div class="property-detail-value">${property.bathrooms}</div>
                        <div class="property-detail-label">SdB</div>
                    </div>
                    <div class="property-detail">
                        <div class="property-detail-value">${property.capacity}</div>
                        <div class="property-detail-label">Personnes</div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); showPropertyReviews('${property.id}')">⭐ Avis</button>
                    <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); showPropertyCheckin('${property.id}')">✅ Check-in</button>
                    <span class="sync-indicator synced">☁️ Synchronisé</span>
                </div>
            </div>
        </div>
    `).join('');
}

function selectProperty(propertyId) {
    state.currentProperty = state.properties.find(p => p.id === propertyId);
    showSection('guides');
    const select = document.getElementById('guide-property-select');
    if (select) select.value = propertyId;
    loadPropertyGuide();
}

function updatePropertySelect() {
    const select = document.getElementById('guide-property-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choisissez un logement --</option>';
    
    state.properties.forEach(property => {
        const option = document.createElement('option');
        option.value = property.id;
        option.textContent = property.name;
        select.appendChild(option);
    });
}

// Guide Management
function loadPropertyGuide() {
    const select = document.getElementById('guide-property-select');
    const propertyId = select ? select.value : null;
    
    if (!propertyId) {
        const editor = document.getElementById('guide-editor');
        if (editor) editor.style.display = 'none';
        return;
    }
    
    const property = state.properties.find(p => p.id === propertyId);
    if (!property) return;
    
    state.currentProperty = property;
    const editor = document.getElementById('guide-editor');
    if (editor) editor.style.display = 'block';
    
    const propertyNameEl = document.getElementById('guide-property-name');
    if (propertyNameEl) propertyNameEl.textContent = property.name;
    
    // Load guide content if exists
    if (state.guides[propertyId] && state.guides[propertyId][state.currentLanguage]) {
        const guide = state.guides[propertyId][state.currentLanguage];
        setGuideField('guide-welcome', guide.welcome);
        setGuideField('guide-access', guide.access);
        setGuideField('guide-equipment', guide.equipment);
        setGuideField('guide-neighborhood', guide.neighborhood);
        setGuideField('guide-checkout', guide.checkout);
        setGuideField('guide-emergency', guide.emergency);
    } else {
        // Set default values
        const trans = window.translations && window.translations[state.currentLanguage] ? 
            window.translations[state.currentLanguage] : 
            { defaultWelcome: '', defaultCheckout: '', emergencyNumbers: '' };
            
        setGuideField('guide-welcome', trans.defaultWelcome?.replace('{property_name}', property.name) || '');
        setGuideField('guide-access', '');
        setGuideField('guide-equipment', '');
        setGuideField('guide-neighborhood', '');
        setGuideField('guide-checkout', trans.defaultCheckout || '');
        setGuideField('guide-emergency', trans.emergencyNumbers || '');
    }
    
    initializeMap();
}

function setGuideField(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value || '';
}

function switchLanguage(lang) {
    state.currentLanguage = lang;
    
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update language-specific texts
    if (window.translations && window.translations[lang]) {
        const trans = window.translations[lang];
        updateElementText('guide-welcome-text', trans.welcome);
        updateElementText('guide-subtitle-text', trans.welcomeGuide);
        updateElementText('section-welcome', trans.welcome);
        updateElementText('section-access', trans.access);
        updateElementText('section-equipment', trans.equipment);
        updateElementText('section-neighborhood', trans.neighborhood);
        updateElementText('section-checkout', trans.checkout);
        updateElementText('section-emergency', trans.emergency);
        updateElementText('section-map', trans.map);
    }
    
    if (state.currentProperty) {
        loadPropertyGuide();
    }
}

function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
}

async function generateAIContent(section) {
    if (!state.currentProperty) {
        showToast('error', 'Erreur', 'Veuillez sélectionner un logement');
        return;
    }
    
    showToast('ai', 'IA en action', `Génération du contenu pour ${section}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiContent = {
        welcome: `Bienvenue dans notre magnifique ${state.currentProperty.type} "${state.currentProperty.name}" ! 

Nous sommes ravis de vous accueillir et avons tout préparé pour que votre séjour soit inoubliable. Ce guide contient toutes les informations nécessaires pour profiter pleinement de votre séjour.

N'hésitez pas à nous contacter si vous avez besoin de quoi que ce soit. Nous sommes là pour vous aider !`,
        
        access: `📍 Adresse : ${state.currentProperty.address}

🔑 Récupération des clés :
- Une boîte à clés sécurisée est située à gauche de la porte d'entrée
- Code : [sera envoyé 24h avant votre arrivée]
- Les clés sont à l'intérieur dans une pochette bleue

🚗 Parking :
- Place de parking privée disponible
- Numéro de place : A12
- Accès par badge inclus avec les clés

🚪 Accès au bâtiment :
- Code porte : [sera envoyé avec le code de la boîte à clés]
- Appartement au 3ème étage
- Ascenseur disponible`,
        
        equipment: `🛏️ Chambres (${state.currentProperty.bedrooms}) :
- Literie haut de gamme
- Oreillers supplémentaires dans les placards
- Couvertures dans l'armoire

🚿 Salle de bain (${state.currentProperty.bathrooms}) :
- Serviettes fournies
- Sèche-cheveux
- Gel douche et shampoing
- Papier toilette

🍳 Cuisine équipée :
- Réfrigérateur/congélateur
- Four et micro-ondes
- Lave-vaisselle
- Machine à café Nespresso
- Bouilloire et grille-pain
- Ustensiles complets

📶 WiFi :
- Réseau : ${state.currentProperty.name}_WiFi
- Mot de passe : [voir carte sur le frigo]

🧺 Autres équipements :
- Lave-linge
- Fer et planche à repasser
- Aspirateur
- Climatisation`,
        
        neighborhood: `🏖️ Plages à proximité :
- Plage de la Promenade : 5 min à pied
- Plage privée "Blue Beach" : 10 min

🛒 Commerces :
- Supermarché Carrefour : 2 min à pied
- Boulangerie "Au Bon Pain" : face à l'immeuble
- Pharmacie : 3 min à pied

🍽️ Restaurants recommandés :
- "La Petite Maison" - Cuisine méditerranéenne (5 min)
- "Chez Antoine" - Spécialités niçoises (7 min)
- "Sushi Zen" - Japonais (10 min)

🚇 Transports :
- Arrêt de bus : 2 min (lignes 12, 23, 52)
- Station de tram : 8 min
- Gare SNCF : 15 min en bus

🏛️ À visiter :
- Vieux Nice : 15 min à pied
- Promenade des Anglais : 5 min
- Musée d'Art Moderne : 20 min
- Château de Nice : 25 min`,
        
        checkout: `📅 Heure de départ : 11h00

✅ Check-list avant de partir :
☐ Retirer tous vos effets personnels
☐ Vérifier les placards et tiroirs
☐ Nettoyer la vaisselle utilisée
☐ Jeter les poubelles (conteneurs dans la cour)
☐ Fermer toutes les fenêtres
☐ Éteindre tous les appareils électriques
☐ Régler le chauffage/clim sur 20°C
☐ Remettre les clés dans la boîte

🗑️ Tri des déchets :
- Bac jaune : recyclables
- Bac vert : ordures ménagères
- Bac bleu : verre

💝 Merci de :
- Laisser le logement dans l'état où vous l'avez trouvé
- Signaler tout problème ou casse
- Laisser un avis sur la plateforme

Nous espérons que vous avez passé un excellent séjour !`
    };
    
    const textarea = document.getElementById(`guide-${section}`);
    if (textarea && aiContent[section]) {
        textarea.value = aiContent[section];
        state.aiGeneratedCount++;
        updateDashboard();
        showToast('success', 'Contenu généré', 'Le contenu a été généré avec succès par l\'IA');
    }
}

async function saveGuide() {
    if (!state.currentProperty) {
        showToast('error', 'Erreur', 'Veuillez sélectionner un logement');
        return;
    }
    
    const guide = {
        welcome: document.getElementById('guide-welcome')?.value || '',
        access: document.getElementById('guide-access')?.value || '',
        equipment: document.getElementById('guide-equipment')?.value || '',
        neighborhood: document.getElementById('guide-neighborhood')?.value || '',
        checkout: document.getElementById('guide-checkout')?.value || '',
        emergency: document.getElementById('guide-emergency')?.value || ''
    };
    
    try {
        if (window.db && state.currentUser) {
            await window.db.collection('users')
                .doc(state.currentUser.uid)
                .collection('guides')
                .doc(`${state.currentProperty.id}_${state.currentLanguage}`)
                .set({
                    propertyId: state.currentProperty.id,
                    language: state.currentLanguage,
                    content: guide,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
        
        if (!state.guides[state.currentProperty.id]) {
            state.guides[state.currentProperty.id] = {};
        }
        state.guides[state.currentProperty.id][state.currentLanguage] = guide;
        saveToLocalStorage();
        updateDashboard();
        showToast('success', 'Guide sauvegardé', 'Le guide a été sauvegardé avec succès');
        
    } catch (error) {
        console.error('❌ Error saving guide:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder le guide');
    }
}

// Toast Notifications
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${getToastIcon(type)}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        ai: '🤖'
    };
    return icons[type] || 'ℹ️';
}

// Local Storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('luxurybot_state', JSON.stringify(state));
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('luxurybot_state');
        if (saved) {
            const loadedState = JSON.parse(saved);
            state = { ...state, ...loadedState };
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
    }
}

// Dashboard Updates
function updateDashboard() {
    const elements = {
        'total-properties': state.properties.length,
        'total-guides': Object.keys(state.guides).length,
        'ai-generated': state.aiGeneratedCount,
        'upcoming-checkins': 3
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Map Initialization
function initializeMap() {
    const mapEl = document.getElementById('property-map');
    if (mapEl) {
        mapEl.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: #e2e8f0;">
                <div style="text-align: center;">
                    <span style="font-size: 3rem;">🗺️</span>
                    <p style="margin-top: 1rem; color: #718096;">Carte interactive</p>
                </div>
            </div>
        `;
    }
}

// Helper Functions
function createNewGuide() {
    if (state.properties.length === 0) {
        showToast('warning', 'Attention', 'Veuillez d\'abord ajouter un logement');
        showSection('properties');
    } else {
        showToast('info', 'Nouveau guide', 'Sélectionnez un logement pour créer le guide');
    }
}

// Integration Functions
function connectBooking() {
    showToast('info', 'Booking.com', 'Redirection vers l\'authentification Booking...');
}

function configureOpenAI() {
    const apiKey = prompt('Entrez votre clé API OpenAI :');
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
        showToast('success', 'OpenAI configuré', 'Votre clé API a été enregistrée');
        if (event && event.target) {
            event.target.textContent = 'Connecté';
            event.target.classList.remove('btn-secondary');
            event.target.classList.add('btn-success');
        }
    }
}

function configureN8N() {
    showToast('info', 'n8n', 'Configuration des workflows d\'automatisation...');
}

function configureSendGrid() {
    const apiKey = prompt('Entrez votre clé API SendGrid :');
    if (apiKey) {
        localStorage.setItem('sendgrid_api_key', apiKey);
        showToast('success', 'SendGrid configuré', 'Envoi d\'emails activé');
        if (event && event.target) {
            event.target.textContent = 'Connecté';
            event.target.classList.remove('btn-secondary');
            event.target.classList.add('btn-success');
        }
    }
}

function configureStripe() {
    const apiKey = prompt('Entrez votre clé API Stripe :');
    if (apiKey) {
        localStorage.setItem('stripe_api_key', apiKey);
        showToast('success', 'Stripe configuré', 'Paiements en ligne activés');
        if (event && event.target) {
            event.target.textContent = 'Connecté';
            event.target.classList.remove('btn-secondary');
            event.target.classList.add('btn-success');
        }
    }
}

function configureFirebase() {
    showToast('info', 'Firebase', 'Firebase est déjà configuré et connecté');
}

function configureTwilio() {
    const accountSid = prompt('Entrez votre Account SID Twilio :');
    if (accountSid) {
        const authToken = prompt('Entrez votre Auth Token Twilio :');
        if (authToken) {
            const phoneNumber = prompt('Entrez votre numéro Twilio (format: +33...) :');
            if (phoneNumber) {
                localStorage.setItem('twilio_config', JSON.stringify({
                    accountSid,
                    authToken,
                    phoneNumber
                }));
                showToast('success', 'Twilio configuré', 'SMS et appels activés');
                if (event && event.target) {
                    event.target.textContent = 'Connecté';
                    event.target.classList.remove('btn-secondary');
                    event.target.classList.add('btn-success');
                }
            }
        }
    }
}

function configureVAPI() {
    const apiKey = prompt('Entrez votre clé API VAPI :');
    if (apiKey) {
        localStorage.setItem('vapi_api_key', apiKey);
        showToast('success', 'VAPI configuré', 'Assistant vocal activé');
        if (event && event.target) {
            event.target.textContent = 'Connecté';
            event.target.classList.remove('btn-secondary');
            event.target.classList.add('btn-success');
        }
    }
}

// Additional Functions
function sendSMS(phoneNumber, message) {
    const config = JSON.parse(localStorage.getItem('twilio_config') || '{}');
    if (!config.accountSid) {
        showToast('error', 'Erreur', 'Twilio non configuré');
        return;
    }
    showToast('success', 'SMS envoyé', `Message envoyé à ${phoneNumber}`);
}

function startVoiceAssistant() {
    const apiKey = localStorage.getItem('vapi_api_key');
    if (!apiKey) {
        showToast('error', 'Erreur', 'VAPI non configuré');
        return;
    }
    showToast('ai', 'Assistant vocal', 'Assistant prêt à répondre aux appels');
}

function previewGuide() {
    showToast('info', 'Aperçu', 'Fonctionnalité en développement');
}

function shareGuide() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?property=${state.currentProperty?.id}&lang=${state.currentLanguage}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Guide ${state.currentProperty?.name}`,
            text: 'Voici le guide d\'accueil pour votre séjour',
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl);
        showToast('success', 'Lien copié', 'Le lien a été copié dans le presse-papier');
    }
}

function exportPDF() {
    showToast('info', 'Export PDF', 'Installation de jsPDF requise pour cette fonctionnalité');
}

function showPropertyReviews(propertyId) {
    showToast('info', 'Avis', 'Module avis en développement');
}

function showPropertyCheckin(propertyId) {
    showToast('info', 'Check-in', 'Module check-in digital en développement');
}

// DOM Content Loaded check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(checkSavedIntegrations, 500);
    });
} else {
    setTimeout(checkSavedIntegrations, 500);
}

// Observer for dynamic content
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            const settingsSection = document.querySelector('#settings.section.active');
            if (settingsSection) {
                checkSavedIntegrations();
            }
        }
    });
});

if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Global functions needed by HTML
window.toggleTheme = toggleTheme;
window.logout = logout;
window.showSection = showSection;
window.openPropertyModal = openPropertyModal;
window.closePropertyModal = closePropertyModal;
window.showImportModal = showImportModal;
window.importFromURL = importFromURL;
window.createNewGuide = createNewGuide;
window.loadPropertyGuide = loadPropertyGuide;
window.switchLanguage = switchLanguage;
window.generateAIContent = generateAIContent;
window.saveGuide = saveGuide;
window.previewGuide = previewGuide;
window.shareGuide = shareGuide;
window.exportPDF = exportPDF;
window.closeWelcomeModal = closeWelcomeModal;
window.startDemo = startDemo;
window.showRegister = showRegister;
window.closeRegisterModal = closeRegisterModal;
window.showForgotPassword = showForgotPassword;
window.updateProfile = updateProfile;
window.connectBooking = connectBooking;
window.configureOpenAI = configureOpenAI;
window.configureN8N = configureN8N;
window.configureSendGrid = configureSendGrid;
window.configureStripe = configureStripe;
window.configureFirebase = configureFirebase;
window.configureTwilio = configureTwilio;
window.configureVAPI = configureVAPI;
window.selectProperty = selectProperty;
window.showPropertyReviews = showPropertyReviews;
window.showPropertyCheckin = showPropertyCheckin;

// Log app loading
console.log('🏁 LuxuryBot Ultimate app.js loaded - waiting for Firebase...');
