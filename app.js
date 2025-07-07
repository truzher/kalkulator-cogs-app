// File: app.js (VERSI SUPER PERBAIKAN)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://supabase.com/dashboard/project/ubfbsmhyshosiihaewis/settings/api-keys'; // Pastikan ini sudah diganti
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // Pastikan ini sudah diganti

// PERBAIKAN UTAMA: Kita buat variabel baru bernama 'supabaseClient'
// 'supabase' (tanpa client) adalah nama library global dari CDN-nya
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// === DOM ELEMENTS ===
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');

// === FUNGSI AUTENTIKASI ===

// Signup
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Menggunakan 'supabaseClient'
    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert('Error saat mendaftar: ' + error.message);
    } else {
        alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
        signupForm.reset();
    }
});

// Login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Menggunakan 'supabaseClient'
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Error saat login: ' + error.message);
    } else {
        loginForm.reset();
    }
});

// Logout
logoutButton.addEventListener('click', async () => {
    // Menggunakan 'supabaseClient'
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert('Error saat logout: ' + error.message);
    }
});


// === CEK STATUS LOGIN PENGGUNA ===

// Menggunakan 'supabaseClient'
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        console.log('Pengguna login:', session.user.email);
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = session.user.email;
        
    } else {
        console.log('Pengguna tidak login.');
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});
