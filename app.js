// =================================================================
// KODE FINAL - FITUR KALKULATOR RESEP & BIAYA DIAKTIFKAN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- (BAGIAN 1: KONEKSI & VARIABEL GLOBAL) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- JANGAN LUPA GANTI INI
    const { createClient } = window.supabase; // Sesuai saran Copilot, ini lebih aman
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];

    // --- (BAGIAN 2: SELEKSI ELEMEN DOM) ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // --- (BAGIAN 3: FUNGSI-FUNGSI OTENTIKASI & UI) ---
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
            loadBahanBaku();
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

    // --- (BAGIAN 4: LOGIKA APLIKASI) ---
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... (Tidak ada perubahan di sini) ... */ }
    function populateEditForm(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    async function handleHapusBahan(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    function renderPilihBahanList(bahanList) { /* ... (Tidak ada perubahan di sini) ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... (Tidak ada perubahan di sini) ... */ }
    function openPilihBahanModal() { /* ... (Tidak ada perubahan di sini) ... */ }

    // --- FUNGSI-FUNGSI BARU UNTUK KALKULASI ---
    function kalkulasiFinal() {
        // Step 1: Ambil HPP Bahan Baku dari total biaya resep
        const semuaBahan = document.querySelectorAll('#resep-table-body tr');
        let hppBahanBaku = 0;
        semuaBahan.forEach(row => {
            const biayaText = row.querySelector('.resep-biaya').textContent;
            const biayaAngka = parseFloat(biayaText.replace(/[^0-9,-]+/g, "").replace(",", "."));
            if (!isNaN(biayaAngka)) {
                hppBahanBaku += biayaAngka;
            }
        });

        // Step 2: Ambil semua nilai dari input form biaya
        const overheadCost = parseFloat(document.getElementById('overhead-cost').value) || 0;
        const overheadType = document.getElementById('overhead-type').value;
        const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
        const errorCostPercent = parseFloat(document.getElementById('error-cost-percent').value) || 0;
        const targetMarginPercent = parseFloat(document.getElementById('target-margin-percent').value) || 0;
        const hargaJualAktual = parseFloat(document.getElementById('harga
