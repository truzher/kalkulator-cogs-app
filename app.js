// =================================================================
// KODE MASTER v3.7 - 13 JULI 2025
// PENAMBAHAN FITUR DAFTAR BELANJA & PERBAIKAN LAINNYA
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
    
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... */ }
    function renderBahanBakuTable() { /* ... */ }
    async function loadSemuaResep() { /* ... */ }
    function renderProdukTable(tipeFilter = 'PRODUK JADI') { /* ... */ }
    function populateEditForm(id) { /* ... */ }
    async function handleHapusBahan(id) { /* ... */ }
    async function handleHapusProduk(id, namaResep) { /* ... */ }
    async function loadResepToKalkulator(resepId) { /* ... */ }
    function hitungHargaSatuan(item, sourceType) { /* ... */ }
    function renderPilihBahanList(sourceType) { /* ... */ }
    function tambahBahanKeResep(bahanInfo, jumlah) { /* ... */ }
    function openPilihBahanModal() { /* ... */ }
    function kalkulasiFinal() { /* ... */ }
    function resetKalkulator() { /* ... */ }
    
    async function handleSimpanResep(e) {
        e.preventDefault();
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) { alert("Sesi tidak valid."); return; }
        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) { alert('Resep tidak boleh kosong!'); return; }
        const resepJsonData = Array.from(resepRows).map(row => ({
            bahan_id: row.dataset.bahanId, nama_bahan: row.cells[0].textContent, jumlah: row.querySelector('.resep-jumlah').value,
            biaya: parseFloat(row.querySelector('.resep-biaya').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            source: row.dataset.source
        }));
        let resepData = {
            user_id: user.id,
            nama_resep: document.getElementById('resep-nama').value,
            tipe_resep: document.getElementById('jenis-resep-input').value,
            kategori: document.getElementById('resep-kategori').value,
            resep_json: resepJsonData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            harga_jual: parseFloat(document.getElementById('harga-jual-aktual').value) || null,
        };
        if (!resepData.nama_resep) { alert('Nama resep harus diisi!'); return; }
        if (resepData.tipe_resep === 'BAHAN OLAHAN') {
            resepData.hasil_jadi_jumlah = parseFloat(document.getElementById('hasil-jadi-jumlah').value) || null;
            resepData.hasil_jadi_satuan = document.getElementById('hasil-jadi-satuan').value || null;
        }
        
        if (isEditing && editingResepId) {
            const { error } = await _supabase.from('resep').update(resepData).eq('id', editingResepId);
            if (error) {
                alert('Gagal mengupdate resep: ' + error.message);
            } else {
                alert(`Resep "${resepData.nama_resep}" berhasil diupdate!`);
                resetKalkulator();
                loadDataAwal();
            }
        } else {
            const { data, error } = await _supabase.from('resep').insert([resepData]).select();
            if (error) {
                alert(`Gagal menyimpan resep: ${error.message}`);
            } else {
                alert(`Resep "${data[0].nama_resep}" berhasil disimpan!`);
                resetKalkulator();
                loadDataAwal();
            }
        }
    }

    async function handleBuatDaftarBelanja() {
        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) {
            alert('Tidak ada bahan di resep untuk dibuat daftar belanja.');
            return;
        }
        const namaResep = document.getElementById('resep-nama').value || 'Tanpa Nama';
        const namaDaftarBelanja = `Belanjaan untuk ${namaResep}`;
        const itemBelanja = Array.from(resepRows)
            .filter(row => row.dataset.source === 'bahan_baku')
            .map(row => {
                const jumlah = row.querySelector('.resep-jumlah').value;
                const bahanMaster = masterBahanList.find(b => b.id == row.dataset.bahanId);
                const satuan = bahanMaster ? bahanMaster.satuan_kemasan : '';
                return `${row.cells[0].textContent} (${jumlah} ${satuan})`;
            });
        if (itemBelanja.length === 0) {
            alert('Resep ini tidak mengandung bahan baku mentah untuk dibuat daftar belanja.');
            return;
        }
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) { alert("Sesi tidak valid."); return; }
        const { error } = await _supabase.from('daftar_belanja').insert([{
            user_id: user.id,
            nama_daftar: namaDaftarBelanja,
            item_belanja: itemBelanja
        }]);
        if (error) {
            alert('Gagal menyimpan daftar belanja: ' + error.message);
        } else {
            alert(`Daftar belanja "${namaDaftarBelanja}" berhasil disimpan! (Fitur untuk melihat daftar akan dibuat selanjutnya)`);
        }
    }
    
    // BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER
    function setupAppEventListeners() {
        // ... (semua listener lama yang sudah benar) ...
        
        if (hppForm) {
            hppForm.addEventListener('submit', handleSimpanResep);
        }

        const buatDaftarBelanjaBtn = document.getElementById('buat-daftar-belanja-btn');
        if (buatDaftarBelanjaBtn) {
            buatDaftarBelanjaBtn.addEventListener('click', handleBuatDaftarBelanja);
        }
    }
    
    // --- BAGIAN 6: JALANKAN APLIKASI ---
    initAuth();
});
