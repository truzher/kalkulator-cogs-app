// =================================================================
// KODE MASTER STABIL - SEMUA FITUR DASAR BERJALAN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];

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

    function initAuth() { /* ... fungsi ini tidak berubah ... */ }
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... fungsi ini tidak berubah ... */ }
    function populateEditForm(id) { /* ... fungsi ini tidak berubah ... */ }
    async function handleHapusBahan(id) { /* ... fungsi ini tidak berubah ... */ }
    function renderPilihBahanList(bahanList) { /* ... fungsi ini tidak berubah ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... fungsi ini tidak berubah ... */ }
    function openPilihBahanModal() { /* ... fungsi ini tidak berubah ... */ }
    function kalkulasiFinal() { /* ... fungsi ini tidak berubah ... */ }

    function setupAppEventListeners() {
        // SEMUA LISTENER YANG SUDAH TERBUKTI JALAN ADA DI SINI
        // Listener CRUD Master Bahan
        if (masterBahanForm) { /* ... */ }
        if (editBahanForm) { /* ... */ }
        if (masterBahanTableBody) { /* ... */ }
        if (cancelEditBtn) { /* ... */ }
        // Listener Navigasi & Filter
        const navButtons = document.querySelectorAll('.nav-button'); /* ... */
        const filterButtons = document.querySelectorAll('.filter-btn'); /* ... */
        // Listener Kalkulator & Modal
        const addResepItemBtn = document.getElementById('add-resep-item-btn'); /* ... */
        const resepTableBody = document.getElementById('resep-table-body'); /* ... */
        const kalkulasiInputs = ['overhead-cost', 'overhead-type', 'labor-cost', /* ... */];
        // Listener Simpan Produk
        if (hppForm) {
            hppForm.addEventListener('submit', (e) => {
                alert("Fitur 'Simpan Produk' akan segera kita aktifkan setelah ini!");
                e.preventDefault();
            });
        }
    }

    initAuth();
});
