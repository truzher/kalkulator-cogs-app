// File: app.js (VERSI FINAL DENGAN FIX EKSPLISIT USER ID)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === VARIABEL GLOBAL ===
let currentUser = null;

// === DOM ELEMENTS ===
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
const masterBahanForm = document.getElementById('master-bahan-form');
const masterBahanTableBody = document.getElementById('master-bahan-table-body');

// --- Mengambil elemen tombol secara langsung ---
const signupButton = document.querySelector('#signup-form button[type="submit"]');
const loginButton = document.querySelector('#login-form button[type="submit"]');


// === FUNGSI-FUNGSI APLIKASI (Tidak ada perubahan di sini) ===
const loadBahanBaku = async () => { /* ... */ };
const simpanBahanBaku = async (event) => { /* ... */ };
// ... dan fungsi lainnya ...


// === EVENT LISTENERS ===

// ▼▼▼ PERUBAHAN UTAMA ADA DI SINI ▼▼▼
// Listener untuk tombol SIGNUP
if (signupButton) {
    console.log("Tombol 'Daftar' ditemukan, memasang event listener 'click'...");
    signupButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Tetap diperlukan untuk mencegah reload
        console.log("Tombol DAFTAR diklik!");
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        console.log("Mencoba mendaftar ke Supabase dengan email:", email);
        const { data, error } = await supabaseClient.auth.signUp({ email, password });

        if (error) {
            alert('Error saat mendaftar: ' + error.message);
            console.error("Supabase signup error:", error);
        } else {
            alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
        }
    });
} else {
    console.error("ERROR FATAL: Tombol 'Daftar' tidak ditemukan!");
}

// Listener untuk tombol LOGIN
if (loginButton) {
    console.log("Tombol 'Login' ditemukan, memasang event listener 'click'...");
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Tetap diperlukan untuk mencegah reload
        console.log("Tombol LOGIN diklik!");

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        console.log("Mencoba login ke Supabase dengan email:", email);
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Error saat login: ' + error.message);
        } else {
            console.log("Supabase login request berhasil. Menunggu state change...");
        }
    });
} else {
    console.error("ERROR FATAL: Tombol 'Login' tidak ditemukan!");
}

// ... Sisa event listener lainnya ...


// === CEK STATUS LOGIN PENGGUNA ===
supabaseClient.auth.onAuthStateChange((event, session) => {
    // ... kode di sini tetap sama ...
});
