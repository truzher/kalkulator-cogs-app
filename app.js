// File: app.js (VERSI FINAL DENGAN FIX EKSPLISIT USER ID)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === VARIABEL GLOBAL UNTUK MENYIMPAN INFO USER ===
let currentUser = null;

// === DOM ELEMENTS ===
console.log("Mulai mengambil elemen DOM...");
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
const masterBahanForm = document.getElementById('master-bahan-form');
const masterBahanTableBody = document.getElementById('master-bahan-table-body');
console.log("Selesai mengambil elemen DOM.");

// --- CCTV #1: Cek apakah form login ditemukan ---
console.log("Mencari loginForm:", loginForm);


// === FUNGSI-FUNGSI APLIKASI ===
const loadBahanBaku = async () => { /* ...kode tetap sama... */ };
const simpanBahanBaku = async (event) => { /* ...kode tetap sama... */ };
const hapusBahanBaku = async (id) => { /* ...kode tetap sama... */ };
const openEditModal = async (id) => { /* ...kode tetap sama... */ };
const simpanPerubahanBahan = async (event) => { /* ...kode tetap sama... */ };


// === EVENT LISTENERS ===
if (loginForm) {
    // --- CCTV #2: Konfirmasi event listener akan dipasang ---
    console.log("loginForm ditemukan, memasang event listener untuk 'submit'...");
    loginForm.addEventListener('submit', async (event) => {
        // --- CCTV #3: Konfirmasi tombol login diklik ---
        console.log("Tombol Login DIKLIK! Form disubmit.");
        
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // --- CCTV #4: Konfirmasi akan mengirim data ke Supabase ---
        console.log("Mencoba login ke Supabase dengan email:", email);
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Error saat login: ' + error.message);
            console.error("Supabase login error:", error);
        } else {
            // Jika berhasil, onAuthStateChange akan handle sisanya
            console.log("Supabase login request berhasil (tanpa error). Menunggu state change...");
            loginForm.reset();
        }
    });
} else {
    console.error("ERROR FATAL: Element dengan id 'login-form' tidak ditemukan!");
}

// ... Sisa event listener lainnya (signup, logout, dll) tetap sama ...


// === CEK STATUS LOGIN PENGGUNA ===
supabaseClient.auth.onAuthStateChange((event, session) => {
    // ... kode di sini tetap sama ...
});
