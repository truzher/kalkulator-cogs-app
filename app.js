// File: app.js (VERSI SUPER DEBUGGING)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === VARIABEL GLOBAL ===
let currentUser = null;

// === DOM ELEMENTS ===
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
const masterBahanForm = document.getElementById('master-bahan-form');
const masterBahanTableBody = document.getElementById('master-bahan-table-body');

// === FUNGSI-FUNGSI APLIKASI (Tetap sama) ===
const loadBahanBaku = async () => { /* ...kode tetap sama... */ };
const simpanBahanBaku = async (event) => { /* ...kode tetap sama... */ };
// ... dan fungsi lainnya ...

// === EVENT LISTENERS (Tetap sama) ===
if (loginForm) { loginForm.addEventListener('submit', async (event) => { /* ...kode tetap sama... */ }); }
if (signupForm) { signupForm.addEventListener('submit', async (event) => { /* ...kode tetap sama... */ }); }
// ... dan sisanya ...

// === CEK STATUS LOGIN PENGGUNA (BAGIAN YANG DI-UPDATE) ===
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("--- FUNGSI onAuthStateChange TERPANGGIL! ---");
    console.log("Event:", event);
    console.log("Session:", session);

    if (session) {
        console.log("STEP 1: Sesi DITEMUKAN. Pengguna sudah login.");
        currentUser = session.user;
        
        try {
            console.log("STEP 2: Mencoba menyembunyikan authContainer...");
            authContainer.classList.add('hidden');
            
            console.log("STEP 3: Mencoba menampilkan appContainer...");
            appContainer.classList.remove('hidden');
            
            console.log("STEP 4: Mencoba menampilkan email pengguna...");
            userEmailDisplay.textContent = currentUser.email;
            
            console.log("STEP 5: Mencoba memuat data bahan baku...");
            loadBahanBaku();
            console.log("STEP 6: Selesai memuat data bahan baku (tanpa error).");
        } catch (e) {
            console.error("!!! ERROR TERJADI DI DALAM onAuthStateChange !!!", e);
        }

    } else {
        console.log("Sesi TIDAK ditemukan. Pengguna logout atau belum login.");
        try {
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        } catch(e) {
            console.error("!!! ERROR saat menampilkan halaman auth !!!", e);
        }
    }
});
