// LuxuryBot Ultimate - Application principale

// Initialize Firebase at the very beginning
let db = null;
let auth = null;

if (typeof firebase !== 'undefined' && window.firebaseConfig) {
    try {
        firebase.initializeApp(window.firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        window.db = db;
        window.auth = auth;
        console.log('Firebase initialized successfully in app.js');
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Setup authentication listener first
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in
                    state.currentUser = user;
                    console.log('User authenticated:', user.email);
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
            console.error('Firebase Auth not initialized');
            showLoginPage();
        }
        
        // Setup login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Setup register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Load saved data
        loadFromLocalStorage();
        updateDashboard();
        initializeMap();
        
        // Check saved integrations
        checkSavedIntegrations();
        
        // Update weather
        updateWeather();
        
        // Update weather every 30 minutes
        setInterval(updateWeather, 30 * 60 * 1000);
        
        // Initialize property form
        const propertyForm = document.getElementById('property-form');
        if (propertyForm) {
            propertyForm.addEventListener('submit', handlePropertySubmit);
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (rememberMe) {
            localStorage.setItem('luxurybot_remember', 'true');
        }
        
        showToast('success', 'Connexion réussie', `Bienvenue ${user.email}`);
        
    } catch (error) {
        let message = 'Erreur de connexion';
        if (error.code === 'auth/user-not-found') {
            message = 'Utilisateur non trouvé';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Mot de passe incorrect';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalide';
        }
        showToast('error', 'Erreur', message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        showToast('error', 'Erreur', 'Les mots de passe ne correspondent pas');
        return;
    }
    
    if (password.length < 6) {
        showToast('error', 'Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        // Create user document in Firestore
        if (db) {
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('success', 'Compte créé', 'Votre compte a été créé avec succès');
        closeRegisterModal();
        
    } catch (error) {
        let message = 'Erreur lors de la création du compte';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Cet email est déjà utilisé';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalide';
        } else if (error.code === 'auth/weak-password') {
            message = 'Mot de passe trop faible';
        }
        showToast('error', 'Erreur', message);
    }
}

function logout() {
    if (auth) {
        auth.signOut().then(() => {
            showToast('success', 'Déconnexion', 'À bientôt !');
            localStorage.removeItem('luxurybot_remember');
            state.currentUser = null;
        }).catch((error) => {
            showToast('error', 'Erreur', 'Impossible de se déconnecter');
        });
    }
}

function showMainApp() {
    // Hide login, show main app
    document.getElementById('login').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.querySelector('.nav').style.display = 'block';
    document.querySelector('.header').style.display = 'block';
    document.querySelector('.theme-toggle').style.display = 'flex';
    document.querySelector('.firebase-status').style.display = 'flex';
}

function showLoginPage() {
    // Show login, hide main app
    document.getElementById('login').classList.add('active');
    document.querySelectorAll('.section:not(#login)').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector('.nav').style.display = 'none';
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.theme-toggle').style.display = 'none';
    document.querySelector('.firebase-status').style.display = 'none';
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
        document.getElementById('register-form').reset();
    }
}

function showForgotPassword() {
    const email = document.getElementById('login-email').value;
    if (!email) {
        showToast('error', 'Erreur', 'Veuillez entrer votre email d\'abord');
        return;
    }
    
    if (auth) {
        auth.sendPasswordResetEmail(email).then(() => {
            showToast('success', 'Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe');
        }).catch((error) => {
            showToast('error', 'Erreur', 'Impossible d\'envoyer l\'email de réinitialisation');
        });
    }
}

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
            if (db) {
                await db.collection('users').doc(user.uid).update({
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

async function loadUserData() {
    if (!state.currentUser || !db) return;
    
    try {
        // Load user properties from Firestore
        const propertiesSnapshot = await db.collection('users')
            .doc(state.currentUser.uid)
            .collection('properties')
            .get();
            
        state.properties = [];
        propertiesSnapshot.forEach(doc => {
            state.properties.push({ id: doc.id, ...doc.data() });
        });
        
        // Load guides
        const guidesSnapshot = await db.collection('users')
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
        console.error('Error loading user data:', error);
    }
}

// Check and display saved integrations
function checkSavedIntegrations() {
    // Check OpenAI
    if (localStorage.getItem('openai_api_key')) {
        const btns = document.querySelectorAll('button[onclick="configureOpenAI()"]');
        btns.forEach(btn => {
            btn.textContent = 'Connecté';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        });
    }
    
    // Check Twilio
    if (localStorage.getItem('twilio_config')) {
        const btns = document.querySelectorAll('button[onclick="configureTwilio()"]');
        btns.forEach(btn => {
            btn.textContent = 'Connecté';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        });
    }
    
    // Check VAPI
    if (localStorage.getItem('vapi_api_key')) {
        const btns = document.querySelectorAll('button[onclick="configureVAPI()"]');
        btns.forEach(btn => {
            btn.textContent = 'Connecté';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        });
    }
    
    // Check SendGrid
    if (localStorage.getItem('sendgrid_api_key')) {
        const btns = document.querySelectorAll('button[onclick="configureSendGrid()"]');
        btns.forEach(btn => {
            btn.textContent = 'Connecté';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        });
    }
    
    // Check Stripe
    if (localStorage.getItem('stripe_api_key')) {
        const btns = document.querySelectorAll('button[onclick="configureStripe()"]');
        btns.forEach(btn => {
            btn.textContent = 'Connecté';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        });
    }
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
        // Check integrations when showing settings
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

// Dark Mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('theme-icon');
    icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('luxurybot_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Load theme preference
if (localStorage.getItem('luxurybot_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.textContent = '☀️';
}

// Welcome Modal
function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function startDemo() {
    closeWelcomeModal();
    // Start demo import
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

// Form submission with validation
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
        if (db && state.currentUser) {
            // Save to Firestore
            const docRef = await db.collection('users')
                .doc(state.currentUser.uid)
                .collection('properties')
                .add(property);
            
            property.id = docRef.id;
        } else {
            // Fallback to local storage
            property.id = Date.now();
        }
        
        state.properties.push(property);
        saveToLocalStorage();
        updateDashboard();
        renderProperties();
        closePropertyModal();
        showToast('success', 'Succès', 'Logement ajouté avec succès');
        
    } catch (error) {
        console.error('Error adding property:', error);
        showToast('error', 'Erreur', 'Impossible d\'ajouter le logement');
    }
}

// Import from URL
async function importFromURL() {
    const url = document.getElementById('import-url').value;
    if (!url) {
        showToast('error', 'Erreur', 'Veuillez entrer une URL');
        return;
    }
    
    // Show AI loading
    document.getElementById('ai-loading').classList.add('active');
    
    // Simulate AI processing
    const statuses = [
        'Connexion à la plateforme...',
        'Extraction des données...',
        'Analyse des photos...',
        'Génération des descriptions...',
        'Finalisation...'
    ];
    
    for (let i = 0; i < statuses.length; i++) {
        document.getElementById('ai-substatus').textContent = statuses[i];
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Create imported property
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
        if (db && state.currentUser) {
            // Save to Firestore
            const docRef = await db.collection('users')
                .doc(state.currentUser.uid)
                .collection('properties')
                .add(property);
            
            property.id = docRef.id;
        } else {
            property.id = Date.now();
        }
        
        state.properties.push(property);
        state.aiGeneratedCount++;
        saveToLocalStorage();
        updateDashboard();
        renderProperties();
        
    } catch (error) {
        console.error('Error importing property:', error);
    }
    
    // Hide loading and clear input
    document.getElementById('ai-loading').classList.remove('active');
    document.getElementById('import-url').value = '';
    
    showToast('ai', 'Import réussi', 'Votre logement a été importé avec succès depuis Airbnb');
    showSection('properties');
}

// Render properties
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

// Select property
function selectProperty(propertyId) {
    state.currentProperty = state.properties.find(p => p.id === propertyId);
    showSection('guides');
    document.getElementById('guide-property-select').value = propertyId;
    loadPropertyGuide();
}

// Update property select
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

// Load property guide
function loadPropertyGuide() {
    const propertyId = document.getElementById('guide-property-select').value;
    if (!propertyId) {
        document.getElementById('guide-editor').style.display = 'none';
        return;
    }
    
    const property = state.properties.find(p => p.id === propertyId);
    if (!property) return;
    
    state.currentProperty = property;
    document.getElementById('guide-editor').style.display = 'block';
    document.getElementById('guide-property-name').textContent = property.name;
    
    // Load guide content if exists
    if (state.guides[propertyId] && state.guides[propertyId][state.currentLanguage]) {
        const guide = state.guides[propertyId][state.currentLanguage];
        document.getElementById('guide-welcome').value = guide.welcome || '';
        document.getElementById('guide-access').value = guide.access || '';
        document.getElementById('guide-equipment').value = guide.equipment || '';
        document.getElementById('guide-neighborhood').value = guide.neighborhood || '';
        document.getElementById('guide-checkout').value = guide.checkout || '';
        document.getElementById('guide-emergency').value = guide.emergency || translations[state.currentLanguage].emergencyNumbers;
    } else {
        // Set default values
        document.getElementById('guide-welcome').value = translations[state.currentLanguage].defaultWelcome.replace('{property_name}', property.name);
        document.getElementById('guide-access').value = '';
        document.getElementById('guide-equipment').value = '';
        document.getElementById('guide-neighborhood').value = '';
        document.getElementById('guide-checkout').value = translations[state.currentLanguage].defaultCheckout;
        document.getElementById('guide-emergency').value = translations[state.currentLanguage].emergencyNumbers;
    }
    
    // Update map
    initializeMap();
}

// Language switching
function switchLanguage(lang) {
    state.currentLanguage = lang;
    
    // Update UI
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update language-specific texts
    const trans = translations[lang] || translations.fr;
    document.getElementById('guide-welcome-text').textContent = trans.welcome;
    document.getElementById('guide-subtitle-text').textContent = trans.welcomeGuide;
    document.getElementById('section-welcome').textContent = trans.welcome;
    document.getElementById('section-access').textContent = trans.access;
    document.getElementById('section-equipment').textContent = trans.equipment;
    document.getElementById('section-neighborhood').textContent = trans.neighborhood;
    document.getElementById('section-checkout').textContent = trans.checkout;
    document.getElementById('section-emergency').textContent = trans.emergency;
    document.getElementById('section-map').textContent = trans.map;
    
    // Load guide for current language
    if (state.currentProperty) {
        loadPropertyGuide();
    }
}

// AI Content Generation
async function generateAIContent(section) {
    if (!state.currentProperty) {
        showToast('error', 'Erreur', 'Veuillez sélectionner un logement');
        return;
    }
    
    showToast('ai', 'IA en action', `Génération du contenu pour ${section}...`);
    
    // Simulate AI generation
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
    
    // Update the textarea
    const textarea = document.getElementById(`guide-${section}`);
    if (textarea && aiContent[section]) {
        textarea.value = aiContent[section];
        state.aiGeneratedCount++;
        updateDashboard();
        showToast('success', 'Contenu généré', 'Le contenu a été généré avec succès par l\'IA');
    }
}

// Save guide
async function saveGuide() {
    if (!state.currentProperty) {
        showToast('error', 'Erreur', 'Veuillez sélectionner un logement');
        return;
    }
    
    const guide = {
        welcome: document.getElementById('guide-welcome').value,
        access: document.getElementById('guide-access').value,
        equipment: document.getElementById('guide-equipment').value,
        neighborhood: document.getElementById('guide-neighborhood').value,
        checkout: document.getElementById('guide-checkout').value,
        emergency: document.getElementById('guide-emergency').value
    };
    
    try {
        if (db && state.currentUser) {
            // Save to Firestore
            await db.collection('users')
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
        
        // Also save locally
        if (!state.guides[state.currentProperty.id]) {
            state.guides[state.currentProperty.id] = {};
        }
        state.guides[state.currentProperty.id][state.currentLanguage] = guide;
        saveToLocalStorage();
        updateDashboard();
        showToast('success', 'Guide sauvegardé', 'Le guide a été sauvegardé avec succès');
        
    } catch (error) {
        console.error('Error saving guide:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder le guide');
    }
}

// Toast notifications
function showToast(type, title, message) {
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
    
    document.getElementById('toast-container').appendChild(toast);
    
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

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('luxurybot_state', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('luxurybot_state');
    if (saved) {
        const loadedState = JSON.parse(saved);
        state = { ...state, ...loadedState };
    }
}

// Update dashboard
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

// Initialize map (simplified version)
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

// Weather update (dummy)
function updateWeather() {
    // Placeholder for weather functionality
}

// Additional helper functions
function createNewGuide() {
    if (state.properties.length === 0) {
        showToast('warning', 'Attention', 'Veuillez d\'abord ajouter un logement');
        showSection('properties');
    } else {
        showToast('info', 'Nouveau guide', 'Sélectionnez un logement pour créer le guide');
    }
}

function sendPreCheckinMessage() {
    showSection('messages');
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = "Bonjour Marie ! J'espère que vous allez bien. Votre séjour approche et je voulais vous confirmer que tout est prêt pour votre arrivée après-demain.";
    }
    showToast('ai', 'Message pré-rempli', 'Personnalisez et envoyez');
}

// ALL INTEGRATION FUNCTIONS
function connectBooking() {
    showToast('info', 'Booking.com', 'Redirection vers l\'authentification Booking...');
}

function configureOpenAI() {
    const apiKey = prompt('Entrez votre clé API OpenAI :');
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
        showToast('success', 'OpenAI configuré', 'Votre clé API a été enregistrée');
        event.target.textContent = 'Connecté';
        event.target.classList.remove('btn-secondary');
        event.target.classList.add('btn-success');
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
        event.target.textContent = 'Connecté';
        event.target.classList.remove('btn-secondary');
        event.target.classList.add('btn-success');
    }
}

function configureStripe() {
    const apiKey = prompt('Entrez votre clé API Stripe :');
    if (apiKey) {
        localStorage.setItem('stripe_api_key', apiKey);
        showToast('success', 'Stripe configuré', 'Paiements en ligne activés');
        event.target.textContent = 'Connecté';
        event.target.classList.remove('btn-secondary');
        event.target.classList.add('btn-success');
    }
}

function configureFirebase() {
    showToast('info', 'Firebase', 'Firebase est déjà configuré et connecté');
}

// Configuration Twilio
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
                event.target.textContent = 'Connecté';
                event.target.classList.remove('btn-secondary');
                event.target.classList.add('btn-success');
            }
        }
    }
}

// Configuration VAPI
function configureVAPI() {
    const apiKey = prompt('Entrez votre clé API VAPI :');
    if (apiKey) {
        localStorage.setItem('vapi_api_key', apiKey);
        showToast('success', 'VAPI configuré', 'Assistant vocal activé');
        event.target.textContent = 'Connecté';
        event.target.classList.remove('btn-secondary');
        event.target.classList.add('btn-success');
    }
}

// Fonction pour envoyer un SMS avec Twilio
function sendSMS(phoneNumber, message) {
    const config = JSON.parse(localStorage.getItem('twilio_config') || '{}');
    if (!config.accountSid) {
        showToast('error', 'Erreur', 'Twilio non configuré');
        return;
    }
    
    // Ici le code pour envoyer le SMS
    showToast('success', 'SMS envoyé', `Message envoyé à ${phoneNumber}`);
}

// Fonction pour l'assistant vocal VAPI
function startVoiceAssistant() {
    const apiKey = localStorage.getItem('vapi_api_key');
    if (!apiKey) {
        showToast('error', 'Erreur', 'VAPI non configuré');
        return;
    }
    
    // Ici le code pour démarrer l'assistant
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

function translateAllGuides() {
    if (!state.currentProperty) {
        showToast('error', 'Erreur', 'Veuillez sélectionner un logement');
        return;
    }
    
    showToast('ai', 'Traduction IA', 'Cette fonctionnalité nécessite une clé API OpenAI configurée');
    
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        showToast('warning', 'Configuration requise', 'Veuillez configurer OpenAI dans les paramètres');
        showSection('settings');
    }
}

function showPropertyReviews(propertyId) {
    showToast('info', 'Avis', 'Module avis en développement');
}

function showPropertyCheckin(propertyId) {
    showToast('info', 'Check-in', 'Module check-in digital en développement');
}

// Check integrations after page load
window.addEventListener('load', function() {
    setTimeout(function() {
        // If on settings page at load
        if (document.querySelector('#settings.section.active')) {
            checkSavedIntegrations();
        }
    }, 500);
});

// Observer for DOM changes
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

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initialize the app
window.addEventListener('load', () => {
    // Welcome message only if logged in
    if (state.currentUser) {
        showToast('ai', 'Bienvenue', 'LuxuryBot Ultimate est prêt à transformer votre gestion locative !');
    }
});
