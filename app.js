// File: app.js (VERSI FINAL DENGAN FIX EKSPLISIT USER ID)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'PASTE_KUNCI_ANON_LOE_YANG_BENAR_DI_SINI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === VARIABEL GLOBAL UNTUK MENYIMPAN INFO USER ===
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

// === FUNGSI-FUNGSI APLIKASI ===

const loadBahanBaku = async () => {
    // ... (kode ini tetap sama, tidak perlu diubah)
    const { data, error } = await supabaseClient.from('bahan_baku').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error mengambil data bahan baku:', error); return; }
    masterBahanTableBody.innerHTML = '';
    data.forEach(bahan => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${bahan.nama}</td><td>${bahan.satuan}</td><td>${bahan.harga_satuan}</td><td><button class="button-edit">Edit</button> <button class="button-delete">Hapus</button></td>`;
        masterBahanTableBody.appendChild(row);
    });
};

const simpanBahanBaku = async (event) => {
    event.preventDefault();

    // Pastikan currentUser tidak null
    if (!currentUser) {
        alert('Sesi tidak ditemukan, silakan login ulang.');
        return;
    }

    const namaBahan = document.getElementById('bahan-nama').value;
    const satuanBahan = document.getElementById('bahan-satuan').value;
    const hargaBahan = document.getElementById('bahan-harga').value;

    // ▼▼▼ PERUBAHAN UTAMA ADA DI SINI ▼▼▼
    // Kita sertakan user_id secara eksplisit saat mengirim data
    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .insert([{ 
            nama: namaBahan, 
            satuan: satuanBahan, 
            harga_satuan: hargaBahan,
            user_id: currentUser.id // <-- "Menunjukkan ID Card" kita
        }])
        .select();

    if (error) {
        console.error('Error menyimpan bahan baku:', error);
        alert('Gagal menyimpan bahan! Cek console untuk detail error.');
    } else {
        console.log('Bahan baku berhasil disimpan:', data);
        masterBahanForm.reset();
        loadBahanBaku(); 
    }
};


// === EVENT LISTENERS ===
if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }
if (signupForm) { signupForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('signup-email').value; const password = document.getElementById('signup-password').value; const { data, error } = await supabaseClient.auth.signUp({ email, password }); if (error) { alert('Error saat mendaftar: ' + error.message); } else { alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.'); signupForm.reset(); } }); }
if (loginForm) { loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { alert('Error saat login: ' + error.message); } else { loginForm.reset(); } }); }
if (logoutButton) { logoutButton.addEventListener('click', async () => { const { error } = await supabaseClient.auth.signOut(); if (error) { alert('Error saat logout: ' + error.message); } }); }


// === CEK STATUS LOGIN PENGGUNA ===
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // ▼▼▼ PERUBAHAN UTAMA ADA DI SINI ▼▼▼
        // Simpan informasi pengguna ke variabel global saat login
        currentUser = session.user;
        
        console.log('Pengguna login:', currentUser.email);
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = currentUser.email;
        loadBahanBaku();
    } else {
        // Hapus informasi pengguna saat logout
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});
