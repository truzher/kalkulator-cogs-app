// File: app.js (VERSI SUPER LENGKAP FINAL)

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
const editModal = document.getElementById('edit-modal');
const editBahanForm = document.getElementById('edit-bahan-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN ===
const updateUI = (user) => {
    if (user) {
        currentUser = user;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = user.email;
        loadBahanBaku();
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
};

// === FUNGSI-FUNGSI APLIKASI ===

// 1. Memuat data bahan baku
const loadBahanBaku = async () => {
    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) { console.error('Error mengambil data:', error); return; }

    masterBahanTableBody.innerHTML = '';
    data.forEach(bahan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bahan.nama}</td>
            <td>${bahan.satuan}</td>
            <td>${bahan.harga_satuan}</td>
            <td>
                <button class="button-edit" data-id="${bahan.id}">Edit</button>
                <button class="button-delete" data-id="${bahan.id}">Hapus</button>
            </td>
        `;
        masterBahanTableBody.appendChild(row);
    });
};

// 2. Menyimpan bahan baku baru
const simpanBahanBaku = async (event) => {
    event.preventDefault();
    if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }

    const namaBahan = document.getElementById('bahan-nama').value;
    const satuanBahan = document.getElementById('bahan-satuan').value;
    const hargaBahan = document.getElementById('bahan-harga').value;

    const { error } = await supabaseClient
        .from('bahan_baku')
        .insert([{ nama: namaBahan, satuan: satuanBahan, harga_satuan: hargaBahan, user_id: currentUser.id }]);

    if (error) {
        console.error('Error menyimpan data:', error);
        alert('Gagal menyimpan bahan!');
    } else {
        masterBahanForm.reset();
        loadBahanBaku(); 
    }
};

// 3. Menghapus bahan baku
const hapusBahanBaku = async (id) => {
    const yakin = confirm("Yakin mau hapus bahan ini?");
    if (yakin) {
        const { error } = await supabaseClient.from('bahan_baku').delete().eq('id', id);
        if (error) {
            console.error('Error menghapus data:', error);
            alert('Gagal menghapus bahan!');
        } else {
            loadBahanBaku();
        }
    }
};

// 4. Membuka modal edit
const openEditModal = async (id) => {
    const { data, error } = await supabaseClient.from('bahan_baku').select('*').eq('id', id).single();
    if (error) { console.error('Error mengambil data untuk diedit:', error); return; }

    document.getElementById('edit-bahan-id').value = data.id;
    document.getElementById('edit-bahan-nama').value = data.nama;
    document.getElementById('edit-bahan-satuan').value = data.satuan;
    document.getElementById('edit-bahan-harga').value = data.harga_satuan;
    editModal.classList.remove('hidden');
};

// 5. Menyimpan perubahan dari modal edit
const simpanPerubahanBahan = async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-bahan-id').value;
    const nama = document.getElementById('edit-bahan-nama').value;
    const satuan = document.getElementById('edit-bahan-satuan').value;
    const harga = document.getElementById('edit-bahan-harga').value;

    const { error } = await supabaseClient
        .from('bahan_baku')
        .update({ nama: nama, satuan: satuan, harga_satuan: harga })
        .eq('id', id);
    
    if (error) {
        console.error('Error menyimpan perubahan:', error);
        alert('Gagal menyimpan perubahan!');
    } else {
        editModal.classList.add('hidden');
        loadBahanBaku();
    }
};

// === EVENT LISTENERS ===
if (signupForm) { signupForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('signup-email').value; const password = document.getElementById('signup-password').value; const { error } = await supabaseClient.auth.signUp({ email, password }); if (error) { alert('Error mendaftar: ' + error.message); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); } }); }
if (loginForm) { loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { alert('Error login: ' + error.message); } }); }
if (logoutButton) { logoutButton.addEventListener('click', async () => { await supabaseClient.auth.signOut(); }); }
if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }
masterBahanTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('button-delete')) { hapusBahanBaku(event.target.getAttribute('data-id')); } if (event.target.classList.contains('button-edit')) { openEditModal(event.target.getAttribute('data-id')); } });
if(editBahanForm) { editBahanForm.addEventListener('submit', simpanPerubahanBahan); }
if(cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.classList.add('hidden'); }); }

// === INISIALISASI APLIKASI ===
const initApp = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUI(session?.user);
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        updateUI(session?.user);
    });
};

initApp();
