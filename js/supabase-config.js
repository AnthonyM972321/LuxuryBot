// Supabase Configuration for LuxuryBot
// Remplacez les valeurs XXXXX par vos vraies valeurs

const SUPABASE_URL = 'https://aimmdxlgjfuknbcwugza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbW1keGxnamZ1a25iY3d1Z3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTk5MzQsImV4cCI6MjA2NzYzNTkzNH0.RoVT0zcXXG_YvdpaniAco2migyQfxrm_hAoKU8zF1nA';

// Initialize Supabase client
let supabase;
let supabaseAuth;
let supabaseDb;

// Check if Supabase SDK is loaded
if (typeof window.supabase !== 'undefined') {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized successfully');
    
    // Make auth and db available globally (compatibilité avec Firebase)
    supabaseAuth = supabase.auth;
    supabaseDb = supabase;
    
    // Compatibilité Firebase pour votre code existant
    window.auth = {
        signInWithEmailAndPassword: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return { user: data.user };
        },
        
        createUserWithEmailAndPassword: async (email, password) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) throw error;
            return { user: data.user };
        },
        
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        
        onAuthStateChanged: (callback) => {
            // Get initial session
            supabase.auth.getSession().then(({ data: { session } }) => {
                callback(session?.user || null);
            });
            
            // Listen for changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                callback(session?.user || null);
            });
            
            return () => subscription.unsubscribe();
        }
    };
    
    // Compatibilité Firestore basique
    window.db = {
        collection: (collectionName) => ({
            doc: (docId) => ({
                set: async (data) => {
                    const { error } = await supabase
                        .from(collectionName)
                        .upsert({ id: docId, ...data });
                    if (error) throw error;
                },
                get: async () => {
                    const { data, error } = await supabase
                        .from(collectionName)
                        .select('*')
                        .eq('id', docId)
                        .single();
                    if (error && error.code !== 'PGRST116') throw error;
                    return {
                        exists: !!data,
                        data: () => data
                    };
                },
                collection: (subcollection) => ({
                    get: async () => {
                        const { data, error } = await supabase
                            .from(`${collectionName}_${subcollection}`)
                            .select('*')
                            .eq(`${collectionName}_id`, docId);
                        if (error) throw error;
                        return {
                            forEach: (callback) => {
                                data.forEach(doc => callback({ id: doc.id, data: () => doc }));
                            }
                        };
                    },
                    add: async (data) => {
                        const { data: result, error } = await supabase
                            .from(`${collectionName}_${subcollection}`)
                            .insert([{ ...data, [`${collectionName}_id`]: docId }])
                            .select()
                            .single();
                        if (error) throw error;
                        return { id: result.id };
                    }
                })
            }),
            add: async (data) => {
                const { data: result, error } = await supabase
                    .from(collectionName)
                    .insert([data])
                    .select()
                    .single();
                if (error) throw error;
                return { id: result.id };
            }
        })
    };
    
    // Update UI status
    function updateStatus() {
        const statusEl = document.getElementById('firebase-status');
        const statusTextEl = document.getElementById('firebase-status-text');
        
        if (statusEl && statusTextEl) {
            statusEl.classList.remove('disconnected');
            statusEl.classList.add('connected');
            statusTextEl.textContent = 'Connecté (Supabase)';
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateStatus);
    } else {
        updateStatus();
    }
    
    // Set ready flag
    window.firebaseReady = true;
    window.dispatchEvent(new Event('firebaseReady'));
    
    console.log('✅ Supabase ready with Firebase compatibility');
    
} else {
    console.error('❌ Supabase SDK not loaded. Add the script tag to your HTML.');
}
