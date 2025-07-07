// File: app.js (Update untuk menampilkan data)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsIm...'; // Ganti dengan Anon Key loe yang lengkap
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === DOM ELEMENTS ===
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
// ▼▼▼ DOM ELEMENT BARU ▼▼▼
const masterBahanTableBody = document.getElementById('master-bahan-table-body');


// === FUNGSI-FUNGSI APLIKASI ===

// BARU: Fungsi untuk mengambil data dari Supabase dan menampilkannya
const loadBahanBaku = async () => {
    // 1. Ambil data dari tabel 'bahan_baku'
    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .select('*')
        .order('created_at', { ascending: false }); // Urutkan dari yg terbaru

    if (error) {
        console.error('Error mengambil data bahan baku:', error);
        return;
    }

    // 2. Kosongkan isi tabel sebelum diisi data baru
    masterBahanTableBody.innerHTML = '';

    // 3. Loop data dan buat baris tabel untuk setiap bahan
    data.forEach(bahan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bahan.nama}</td>
            <td>${bahan.satuan}</td>
            <td>${bahan.harga_satuan}</td>
            <td>
                <button class="button-edit">Edit</button>
                <button class="button-delete">Hapus</button>
            </td>
        `;
        masterBahanTableBody.appendChild(row);
    });
};


// === FUNGSI AUTENTIKASI (Tetap sama) ===
signupForm.addEventListener('submit', async (event) => { /* ...kode tetap sama... */ });
loginForm.addEventListener('submit', async (event) => { /* ...kode tetap sama... */ });
logoutButton.addEventListener('click', async () => { /* ...kode tetap sama... */ });

// === CEK STATUS LOGIN PENGGUNA ===
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Pengguna sudah login
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = session.user.email;
        
        // ▼▼▼ PANGGIL FUNGSI UNTUK MEMUAT DATA SETELAH LOGIN ▼▼▼
        loadBahanBaku();
        
    } else {
        // Pengguna tidak login
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});

// Duplikasi kode fungsi auth yang tidak berubah
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert('Error saat mendaftar: ' + error.message);
    } else {
        alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
        signupForm.reset();
    }
});
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Error saat login: ' + error.message);
    } else {
        loginForm.reset();
    }
});
logoutButton.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert('Error saat logout: ' + error.message);
    }
});
