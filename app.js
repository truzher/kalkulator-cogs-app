document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let produkSetengahJadiList = [];

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
    
    async function loadDataAwal() {
        await loadBahanBaku();
        await loadProdukSetengahJadi();
    }

    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... fungsi ini tidak berubah ... */ }
    async function loadProdukSetengahJadi() {
        console.log("Memuat produk setengah jadi...");
        const { data, error } = await _supabase.from('produk_setengah_jadi').select('*');
        if (error) {
            console.error("Gagal memuat produk setengah jadi:", error.message);
            produkSetengahJadiList = [];
        } else {
            produkSetengahJadiList = data;
            console.log("Produk setengah jadi berhasil dimuat:", produkSetengahJadiList);
        }
    }
    function populateEditForm(id) { /* ... fungsi ini tidak berubah ... */ }
    async function handleHapusBahan(id) { /* ... fungsi ini tidak berubah ... */ }
    
    function renderPilihBahanList(list, sourceType) {
        const searchResults = document.getElementById('bahan-search-results');
        if (!searchResults) return;
        searchResults.innerHTML = '';
        if (list.length === 0) {
            searchResults.innerHTML = `<li>Tidak ada ${sourceType.replace('_', ' ')} tersedia.</li>`;
        } else {
            list.forEach(item => {
                const li = document.createElement('li');
                let nama, harga, satuan, id;
                if (sourceType === 'bahan_baku') {
                    nama = item.nama;
                    harga = (item.harga_beli_kemasan && item.isi_kemasan) ? (item.harga_beli_kemasan / item.isi_kemasan) : 0;
                    satuan = item.satuan_kemasan;
                    id = item.id;
                } else { // produk_setengah_jadi
                    nama = item.nama_produk;
                    harga = (item.total_hpp && item.hasil_jadi_jumlah > 0) ? item.total_hpp / item.hasil_jadi_jumlah : 0;
                    satuan = item.hasil_jadi_satuan;
                    id = item.id;
                }
                li.textContent = `${nama} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(harga)} / ${satuan})`;
                li.dataset.bahanId = id; li.dataset.source = sourceType; li.dataset.nama = nama; li.dataset.harga = harga;
                li.classList.add('search-result-item');
                searchResults.appendChild(li);
            });
        }
    }

    function tambahBahanKeResep(bahanInfo) { /* ... fungsi ini tidak berubah ... */ }
    function openPilihBahanModal() {
        const modal = document.getElementById('pilih-bahan-modal');
        const searchInput = document.getElementById('search-bahan-input');
        if (!modal || !searchInput) return;
        searchInput.value = '';
        // Default ke tab bahan baku saat dibuka
        document.querySelector('.bahan-source-btn[data-source="bahan_baku"]').classList.add('active');
        document.querySelector('.bahan-source-btn[data-source="produk_setengah_jadi"]').classList.remove('active');
        renderPilihBahanList(masterBahanList, 'bahan_baku');
        modal.classList.remove('hidden');
    }

    function kalkulasiFinal() { /* ... fungsi ini tidak berubah ... */ }

    async function handleSimpanProduk(e) {
        e.preventDefault();
        const tipeProduk = document.getElementById('jenis-produk-input').value;
        const targetTable = (tipeProduk === 'Produk Jadi') ? 'produk_jadi' : 'produk_setengah_jadi';
        
        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) { alert('Resep tidak boleh kosong!'); return; }
        const resepData = Array.from(resepRows).map(row => ({
            bahan_id: row.dataset.bahanId, nama_bahan: row.cells[0].textContent, jumlah: row.querySelector('.resep-jumlah').value,
            biaya: parseFloat(row.querySelector('.resep-biaya').textContent.replace(/[^0-9,-]+/g, "").replace(",", "."))
        }));

        const produkData = {
            user_id: (await _supabase.auth.getUser()).data.user.id,
            nama_produk: document.getElementById('produk-nama').value,
            kategori_produk: document.getElementById('produk-kategori').value,
            resep: resepData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            saran_harga_jual: parseFloat(document.getElementById('saran-harga-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit: parseFloat(document.getElementById('profit-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit_persen: parseFloat(document.getElementById('profit-percent-display').textContent.replace('%', '')),
            hasil_jadi_jumlah: document.getElementById('hasil-jadi-jumlah').value || null,
            hasil_jadi_satuan: document.getElementById('hasil-jadi-satuan').value || null,
        };

        if (!produkData.nama_produk) { alert('Nama produk harus diisi!'); return; }

        const { data, error } = await _supabase.from(targetTable).insert([produkData]).select();
        if (error) {
            alert(`Gagal menyimpan produk: ${error.message}`);
        } else {
            alert(`Produk "${data[0].nama_produk}" berhasil disimpan di tabel ${targetTable}!`);
            if(hppForm) hppForm.reset();
            document.getElementById('resep-table-body').innerHTML = '';
            kalkulasiFinal();
            if (targetTable === 'produk_setengah_jadi') {
                loadProdukSetengahJadi();
            }
        }
    }

    function setupAppEventListeners() {
        // ... (Listener CRUD Master Bahan tidak berubah) ...
        // ... (Listener Navigasi & Filter Halaman tidak berubah) ...
        
        const bahanSourceTabs = document.querySelectorAll('.bahan-source-btn');
        bahanSourceTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                bahanSourceTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const source = tab.dataset.source;
                const listToRender = source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
                renderPilihBahanList(listToRender, source);
            });
        });
        
        // ... (Semua listener lainnya tidak berubah) ...

        if (hppForm) { hppForm.addEventListener('submit', handleSimpanProduk); }
    }
    
    initAuth();
});
