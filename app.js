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

// Implementasi lengkap dari fungsi yang diringkas di atas untuk kemudahan copy-paste
document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'KUNCI_ANON_PROYEK_LOE';

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let masterBahanList = [];

    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');

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
                if (error) { alert(`Daftar Gagal: ${error.message}`); } 
                else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => await _supabase.auth.signOut());
        }
        _supabase.auth.onAuthStateChange((_event, session) => {
            const user = session ? session.user : null;
            setupUI(user);
        });
    }

    async function loadBahanBaku(kategoriFilter = 'Semua') {
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) return;
        let query = _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') { query = query.eq('kategori', kategoriFilter); }
        const { data, error } = await query;
        if (error) { console.error("Gagal memuat bahan baku:", error.message); return; }
        masterBahanList = data;
        masterBahanTableBody.innerHTML = '';
        if (data.length === 0) {
            masterBahanTableBody.innerHTML = `<tr><td colspan="4">Tidak ada bahan baku.</td></tr>`;
            return;
        }
        data.forEach(bahan => {
            const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama || 'N/A'}</td>
                <td>${bahan.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td>
                <td><button class="edit-btn" data-id="${bahan.id}">Edit</button> <button class="delete-btn" data-id="${bahan.id}">Hapus</button></td>
            `;
            masterBahanTableBody.appendChild(row);
        });
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
        const navButtons = document.querySelectorAll('.nav-button');
        const pages = document.querySelectorAll('.page');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const addResepItemBtn = document.getElementById('add-resep-item-btn');
        const cancelPilihBahanBtn = document.getElementById('cancel-pilih-bahan-btn');
        const buatBahanBaruCepatBtn = document.getElementById('buat-bahan-baru-cepat-btn');
        const cancelTambahCepatBtn = document.getElementById('cancel-tambah-cepat-btn');
        const bahanSourceTabs = document.querySelectorAll('.bahan-source-btn');
        const searchInput = document.getElementById('search-bahan-input');
        const searchResultsContainer = document.getElementById('bahan-search-results');

        navButtons.forEach(button => button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.page).classList.add('active');
        }));

        filterButtons.forEach(button => button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadBahanBaku(button.dataset.kategori);
        }));
        
        if (addResepItemBtn) addResepItemBtn.addEventListener('click', openPilihBahanModal);
        if (cancelPilihBahanBtn) cancelPilihBahanBtn.addEventListener('click', () => document.getElementById('pilih-bahan-modal').classList.add('hidden'));
        if (buatBahanBaruCepatBtn) buatBahanBaruCepatBtn.addEventListener('click', () => {
            document.getElementById('pilih-bahan-modal').classList.add('hidden');
            document.getElementById('tambah-bahan-cepat-modal').classList.remove('hidden');
        });
        if (cancelTambahCepatBtn) cancelTambahCepatBtn.addEventListener('click', () => document.getElementById('tambah-bahan-cepat-modal').classList.add('hidden'));

        bahanSourceTabs.forEach(tab => tab.addEventListener('click', () => {
            bahanSourceTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const source = tab.dataset.source;
            if (source === 'bahan_baku') {
                renderPilihBahanList(masterBahanList);
            } else {
                document.getElementById('bahan-search-results').innerHTML = '<li>Fitur Produk Setengah Jadi sedang dalam pengembangan.</li>';
            }
        }));

        if(searchInput) searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredBahan = masterBahanList.filter(b => b.nama.toLowerCase().includes(searchTerm));
            renderPilihBahanList(filteredBahan);

        });

        if(searchResultsContainer) searchResultsContainer.addEventListener('click', (e) => {
            if(e.target && e.target.matches('li.search-result-item')) {
                tambahBahanKeResep(e.target.dataset);
            }
        });
    }

    initAuth();
});
