// =================================================================
// KODE MASTER v2.0 - 12 JULI 2025 - ARSITEKTUR BARU DENGAN TABEL 'RESEP'
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let semuaResepList = [];
    let isEditing = false;
    let editingResepId = null;

    // --- BAGIAN 2: SELEKSI ELEMEN DOM ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const hppForm = document.getElementById('hpp-form');
    const produkTableBody = document.getElementById('produk-table-body');
    const resetHppBtn = document.getElementById('reset-hpp-btn');
    
    // --- BAGIAN 3: FUNGSI OTENTIKASI & UI ---
    function setupUI(user) {
        if (user) {
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                if (!appContainer.dataset.listenersAttached) {
                    setupAppEventListeners();
                    appContainer.dataset.listenersAttached = 'true';
                }
            }
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            loadDataAwal();
        } else {
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            if (userEmailDisplay) userEmailDisplay.textContent = '';
        }
    }

    function initAuth() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const { error } = await _supabase.auth.signInWithPassword({ email, password });
                if (error) alert(`Login Gagal: ${error.message}`);
            });
        }
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await _supabase.auth.signUp({ email, password });
                if (error) { alert(`Daftar Gagal: ${error.message}`); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => await _supabase.auth.signOut());
        }
        _supabase.auth.onAuthStateChange((_event, session) => setupUI(session ? session.user : null));
    }

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    async function loadDataAwal() {
        await Promise.all([loadBahanBaku(), loadSemuaResep()]);
        renderProdukTable();
    }
    
    async function loadBahanBaku() {
        const { data, error } = await _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (error) { console.error("Gagal memuat bahan baku:", error.message); masterBahanList = []; return; }
        masterBahanList = data || [];
        renderBahanBakuTable();
    }
    
    function renderBahanBakuTable() {
        if (!masterBahanTableBody) return;
        masterBahanTableBody.innerHTML = '';
        if (masterBahanList.length === 0) {
            masterBahanTableBody.innerHTML = `<tr><td colspan="4">Tidak ada bahan baku.</td></tr>`;
            return;
        }
        masterBahanList.forEach(bahan => {
            const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan > 0) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.dataset.id = bahan.id;
            row.innerHTML = `<td>${bahan.nama || 'N/A'}</td><td>${bahan.kategori || 'N/A'}</td><td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td><td><button class="edit-btn">Edit</button> <button class="delete-btn">Hapus</button></td>`;
            masterBahanTableBody.appendChild(row);
        });
    }

    async function loadSemuaResep() {
        const { data, error } = await _supabase.from('resep').select('*').order('created_at', { ascending: false });
        if (error) { console.error("Gagal memuat resep:", error.message); semuaResepList = []; } 
        else { semuaResepList = data || []; }
    }

    function renderProdukTable() {
        if (!produkTableBody) return;
        const produkJadiList = semuaResepList.filter(r => r.tipe_resep === 'PRODUK JADI');
        produkTableBody.innerHTML = '';
        if (produkJadiList.length === 0) {
            produkTableBody.innerHTML = '<tr><td colspan="5">Belum ada produk jadi yang disimpan.</td></tr>';
            return;
        }
        produkJadiList.forEach(resep => {
            const row = document.createElement('tr');
            row.dataset.id = resep.id;
            row.dataset.nama = resep.nama_resep;
            row.innerHTML = `<td>${resep.nama_resep || 'N/A'}</td><td><span class="chip-kategori">Produk Jadi</span></td><td>${resep.kategori || 'N/A'}</td><td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(resep.harga_jual || 0)}</td><td><button class="button-edit">Lihat/Edit</button> <button class="button-delete">Hapus</button></td>`;
            produkTableBody.appendChild(row);
        });
    }

    // ... (sisa fungsi-fungsi lain yang relevan dan sudah disesuaikan)

    // --- BAGIAN 5: JALANKAN APLIKASI ---
    initAuth();
});
