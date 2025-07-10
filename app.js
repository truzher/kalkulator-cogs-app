
document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- JANGAN LUPA GANTI INI
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];

    // --- (Seleksi Elemen DOM) ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- (Fungsi Otentikasi & UI) ---
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
    
    // --- (Fungsi Logika Aplikasi) ---
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... fungsi ini tidak berubah ... */ }
    function populateEditForm(id) { /* ... fungsi ini tidak berubah ... */ }
    async function handleHapusBahan(id) { /* ... fungsi ini tidak berubah ... */ }
    function renderPilihBahanList(bahanList) { /* ... fungsi ini tidak berubah ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... fungsi ini tidak berubah ... */ }
    function openPilihBahanModal() { /* ... fungsi ini tidak berubah ... */ }

    function kalkulasiFinal() {
        const hppBahanBakuText = document.getElementById('total-cogs-display').textContent;
        const hppBahanBaku = parseFloat(hppBahanBakuText.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;

        const overheadCost = parseFloat(document.getElementById('overhead-cost').value) || 0;
        const overheadType = document.getElementById('overhead-type').value;
        const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
        const errorCostPercent = parseFloat(document.getElementById('error-cost-percent').value) || 0;
        const targetMarginPercent = parseFloat(document.getElementById('target-margin-percent').value) || 0;
        const hargaJualAktual = parseFloat(document.getElementById('harga-jual-aktual').value) || 0;

        let overheadNominal = overheadCost;
        if (overheadType === 'persen') {
            overheadNominal = hppBahanBaku * (overheadCost / 100);
        }
        
        const hppSebelumError = hppBahanBaku + overheadNominal + laborCost;
        const errorCostNominal = hppSebelumError * (errorCostPercent / 100);
        const totalHPP = hppSebelumError + errorCostNominal;

        let saranHargaJual = 0;
        if (targetMarginPercent < 100 && targetMarginPercent >= 0) {
            saranHargaJual = totalHPP / (1 - (targetMarginPercent / 100));
        }

        let profitNominal = 0;
        let profitPercent = 0;
        if (hargaJualAktual > 0) {
            profitNominal = hargaJualAktual - totalHPP;
            profitPercent = (profitNominal / hargaJualAktual) * 100;
        }

        const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
        
        document.getElementById('total-cogs-display').textContent = formatRupiah(totalHPP);
        document.getElementById('saran-harga-display').textContent = formatRupiah(saranHargaJual);
        document.getElementById('profit-display').textContent = formatRupiah(profitNominal);
        document.getElementById('profit-percent-display').textContent = `${profitPercent.toFixed(2)}%`;
    }

    function hitungTotalHppBahan() {
        const semuaBahan = document.querySelectorAll('#resep-table-body tr');
        let totalHppBahan = 0;
        semuaBahan.forEach(row => {
            const biayaText = row.querySelector('.resep-biaya').textContent;
            const biayaAngka = parseFloat(biayaText.replace(/[^0-9,-]+/g, "").replace(",", "."));
            if (!isNaN(biayaAngka)) {
                totalHppBahan += biayaAngka;
            }
        });
        document.getElementById('total-cogs-display').textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalHppBahan);
        kalkulasiFinal(); 
    }

    // --- (Pemasangan Event Listener) ---
    function setupAppEventListeners() {
        // ... (semua listener lama) ...

        const resepTableBody = document.getElementById('resep-table-body');
        if(resepTableBody) {
            resepTableBody.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('resep-delete-btn')) {
                    e.target.closest('tr').remove();
                    hitungTotalHppBahan();
                }
            });
            resepTableBody.addEventListener('input', (e) => {
                if (e.target && e.target.classList.contains('resep-jumlah')) {
                    const row = e.target.closest('tr');
                    const hargaPerSatuan = parseFloat(row.dataset.harga);
                    const jumlah = parseFloat(e.target.value);
                    const biayaCell = row.querySelector('.resep-biaya');
                    if (!isNaN(hargaPerSatuan) && !isNaN(jumlah) && jumlah >= 0) {
                        const totalBiaya = hargaPerSatuan * jumlah;
                        biayaCell.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalBiaya);
                    } else {
                        biayaCell.textContent = 'Rp 0,00';
                    }
                    hitungTotalHppBahan();
                }
            });
        }

        const kalkulasiInputs = ['overhead-cost', 'overhead-type', 'labor-cost', 'error-cost-percent', 'target-margin-percent', 'harga-jual-aktual'];
        kalkulasiInputs.forEach(id => {
            const element = document.getElementById(id);
            if(element) {
                element.addEventListener('input', kalkulasiFinal);
            }
        });
    }

    // --- (Jalankan Aplikasi) ---
    initAuth();
});
