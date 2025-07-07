// File: app.js (VERSI FINAL DENGAN STRUKTUR BARU)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === DOM ELEMENTS ===
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
const masterBahanForm = document.getElementById('master-bahan-form');
const masterBahanTableBody = document.getElementById('master-bahan-table-body');
const editModal = document.getElementById('edit-modal');
const editBahanForm = document.getElementById('edit-bahan-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN ===
const updateUI = (user) => {
    if (user) {
        // Pengguna login
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = user.email;
        loadBahanBaku();
    } else {
        // Pengguna tidak login
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
};

// === FUNGSI-FUNGSI APLIKASI ===
const loadBahanBaku = async () => { /* ... kode ini tidak berubah ... */ };
const simpanBahanBaku = async (event) => { /* ... kode ini tidak berubah ... */ };
const hapusBahanBaku = async (id) => { /* ... kode ini tidak berubah ... */ };
const openEditModal = async (id) => { /* ... kode ini tidak berubah ... */ };
const simpanPerubahanBahan = async (event) => { /* ... kode ini tidak berubah ... */ };

// === EVENT LISTENERS ===
if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            alert('Error mendaftar: ' + error.message);
        } else {
            alert('Pendaftaran berhasil! Cek email untuk verifikasi.');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Error login: ' + error.message);
        }
        // Tidak perlu apa-apa lagi di sini, onAuthStateChange akan handle
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
    });
}

if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }
masterBahanTableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-delete')) {
        hapusBahanBaku(event.target.getAttribute('data-id'));
    }
    if (event.target.classList.contains('button-edit')) {
        openEditModal(event.target.getAttribute('data-id'));
    }
});
if(editBahanForm) { editBahanForm.addEventListener('submit', simpanPerubahanBahan); }
if(cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.classList.add('hidden'); }); }


// === INISIALISASI APLIKASI ===
const initApp = async () => {
    // 1. Cek sesi saat ini secara proaktif
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUI(session?.user);

    // 2. Pasang pendengar untuk perubahan di masa depan (login/logout)
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        updateUI(session?.user);
    });
};

// Jalankan aplikasi
initApp();

// --- Duplikasi kode fungsi-fungsi yang tidak berubah ---
// (Loe bisa copy-paste dari file lama loe, atau Cici tuliskan lagi di sini)
/* ... (copy-paste fungsi loadBahanBaku, simpanBahanBaku, hapusBahanBaku, openEditModal, simpanPerubahanBahan dari file loe yang terakhir) ... */
