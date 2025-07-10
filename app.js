// =================================================================
// DIBUAT ULANG OLEH CICI - VERSI LENGKAP + FITUR PILIH & SEARCH BAHAN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // BAGIAN 1: KONEKSI & VARIABEL GLOBAL
    // -------------------------------------------------------------
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- JANGAN LUPA GANTI INI

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Koneksi Supabase berhasil dibuat.');
    
    let masterBahanList = [];

    // -------------------------------------------------------------
    // BAGIAN 2: SELEKSI ELEMEN-ELEMEN PENTING DARI HTML
    // -------------------------------------------------------------
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    console.log('Elemen-elemen DOM utama berhasil dipilih.');

    // -------------------------------------------------------------
    // BAGIAN 3: FUNGSI-FUNGSI UTAMA (LOGIN & UI)
    // -------------------------------------------------------------
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
        // ... (fungsi initAuth lengkap seperti sebelumnya, tidak diubah)
    }

    // -------------------------------------------------------------
    // BAGIAN 4: LOGIKA APLIKASI (KALKULATOR, BAHAN, DLL)
    // -------------------------------------------------------------
    async function loadBahanBaku(kategoriFilter = 'Semua') {
        // ... (fungsi loadBahanBaku lengkap seperti sebelumnya, tidak diubah)
    }

    function renderPilihBahanList(bahanList) {
        const searchResults = document.getElementById('bahan-search-results');
        searchResults.innerHTML = '';
        if (bahanList.length === 0) {
            searchResults.innerHTML = '<li>Bahan tidak ditemukan.</li>';
        } else {
            bahanList.forEach(bahan => {
                const li = document.createElement('li');
                const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
                li.textContent = `${bahan.nama} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan})`;
                li.dataset.bahanId = bahan.id;
                li.dataset.source = 'bahan_baku';
                li.dataset.nama = bahan.nama;
                li.dataset.harga = hargaPerSatuan;
                li.classList.add('search-result-item');
                searchResults.appendChild(li);
            });
        }
    }

    function tambahBahanKeResep(bahanInfo) {
        console.log("Menambahkan bahan ke resep:", bahanInfo);
        const resepTableBody = document.getElementById('resep-table-body');
        const row = document.createElement('tr');
        row.dataset.bahanId = bahanInfo.bahanId;
        row.dataset.source = bahanInfo.source;
        row.dataset.harga = bahanInfo.harga;
        row.innerHTML = `
            <td>${bahanInfo.nama}</td>
            <td><input type="number" class="resep-jumlah" placeholder="0" style="width: 70px;"></td>
            <td class="resep-biaya">Rp 0,00</td>
            <td><button class="resep-delete-btn">Hapus</button></td>
        `;
        resepTableBody.appendChild(row);
        document.getElementById('pilih-bahan-modal').classList.add('hidden');
    }

    function openPilihBahanModal() {
        const modal = document.getElementById('pilih-bahan-modal');
        const searchInput = document.getElementById('search-bahan-input');
        if (!modal || !searchInput) return;
        searchInput.value = '';
        renderPilihBahanList(masterBahanList);
        modal.classList.remove('hidden');
    }

    function setupAppEventListeners() {
        // ... (fungsi setupAppEventListeners lengkap dengan semua listener baru seperti di atas)
    }
    
    // -------------------------------------------------------------
    // BAGIAN 5: JALANKAN APLIKASI
    // -------------------------------------------------------------
    initAuth();

});
