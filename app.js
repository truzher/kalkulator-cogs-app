// File: app.js (VERSI FINAL DENGAN PERBAIKAN & PEMBERSIHAN)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // Ganti dengan Anon Key loe yang lengkap
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

// === FUNGSI-FUNGSI APLIKASI ===

const loadBahanBaku = async () => {
    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error mengambil data bahan baku:', error);
        return;
    }

    masterBahanTableBody.innerHTML = '';
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

const simpanBahanBaku = async (event) => {
    event.preventDefault();
    const namaBahan = document.getElementById('bahan-nama').value;
    const satuanBahan = document.getElementById('bahan-satuan').value;
    const hargaBahan = document.getElementById('bahan-harga').value;

    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .insert([{ nama: namaBahan, satuan: satuanBahan, harga_satuan: hargaBahan }])
        .select(); // Minta data yang baru di-insert untuk dikembalikan

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
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = session.user.email;
        loadBahanBaku();
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});
