// =================================================================
// KODE MASTER v1.5 - 12 JULI 2025
// VERSI DEBUG UNTUK MELACAK EVENT LISTENER
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
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
    async function loadDataAwal() { /* ... (Tidak ada perubahan) ... */ }
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... (Tidak ada perubahan) ... */ }
    function renderBahanBakuTable() { /* ... (Tidak ada perubahan) ... */ }
    async function loadSemuaResep() { /* ... (Tidak ada perubahan) ... */ }
    function renderProdukTable(tipeFilter = 'PRODUK JADI') { /* ... (Tidak ada perubahan) ... */ }
    function populateEditForm(id) { /* ... (Tidak ada perubahan) ... */ }
    async function handleHapusBahan(id) { /* ... (Tidak ada perubahan) ... */ }
    async function handleHapusProduk(id, namaResep) { /* ... (Tidak ada perubahan) ... */ }
    async function loadProdukToKalkulator(resepId) { /* ... (Tidak ada perubahan) ... */ }
    function hitungHargaSatuan(item, sourceType) { /* ... (Tidak ada perubahan) ... */ }
    function renderPilihBahanList(sourceType) { /* ... (Tidak ada perubahan) ... */ }
    function tambahBahanKeResep(bahanInfo, jumlah) { /* ... (Tidak ada perubahan) ... */ }
    function openPilihBahanModal() { /* ... (Tidak ada perubahan) ... */ }
    function kalkulasiFinal() { /* ... (Tidak ada perubahan) ... */ }
    async function handleSimpanResep(e) { /* ... (Tidak ada perubahan) ... */ }
    function resetKalkulator() { /* ... (Tidak ada perubahan) ... */ }
    
    // BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER (VERSI DEBUG)
    function setupAppEventListeners() {
        console.log("--- Memulai Pemasangan Semua Event Listener ---");

        const masterBahanForm = document.getElementById('master-bahan-form');
        if (masterBahanForm) {
            console.log("✅ Memasang listener untuk: form Simpan Bahan");
            masterBahanForm.addEventListener('submit', async (e) => {
                // ... (logika simpan bahan)
            });
        } else { console.error("❌ Elemen #master-bahan-form TIDAK DITEMUKAN"); }

        const navButtons = document.querySelectorAll('.nav-button');
        if (navButtons.length > 0) {
            console.log("✅ Memasang listener untuk: Navigasi Utama");
            navButtons.forEach(button => {
                button.addEventListener('click', () => {
                    console.log(`DEBUG: Tombol Navigasi "${button.textContent}" diklik.`);
                    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                    button.classList.add('active');
                    document.getElementById(button.dataset.page).classList.add('active');
                    if(button.dataset.page === 'page-kalkulator'){
                        resetKalkulator();
                    }
                });
            });
        } else { console.error("❌ Elemen .nav-button TIDAK DITEMUKAN"); }

        const addResepItemBtn = document.getElementById('add-resep-item-btn');
        if (addResepItemBtn) {
            console.log("✅ Memasang listener untuk: tombol + Tambah Bahan");
            addResepItemBtn.addEventListener('click', openPilihBahanModal);
        } else { console.error("❌ Elemen #add-resep-item-btn TIDAK DITEMUKAN"); }
        
        // ... (dan seterusnya untuk semua listener lainnya) ...

        console.log("--- Semua Pemasangan Event Listener Selesai ---");
    }
    
    // BAGIAN 6: JALANKAN APLIKASI
    initAuth();
});
