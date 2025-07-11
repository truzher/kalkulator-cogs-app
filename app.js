// =================================================================
// KODE MASTER v2.0 - 12 JULI 2025
// ARSITEKTUR BARU DENGAN SATU TABEL 'RESEP'
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let semuaResepList = []; // Satu tempat untuk semua resep
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
    
    async function loadBahanBaku(kategoriFilter = 'Semua') {
        if (!masterBahanTableBody) return;
        let query = _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') { query = query.eq('kategori', kategoriFilter); }
        const { data, error } = await query;
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
            row.innerHTML = `
                <td>${bahan.nama || 'N/A'}</td>
                <td>${bahan.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td>
                <td><button class="edit-btn">Edit</button> <button class="delete-btn">Hapus</button></td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    }

    async function loadSemuaResep() {
        const { data, error } = await _supabase.from('resep').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Gagal memuat resep:", error.message);
            semuaResepList = [];
        } else {
            semuaResepList = data || [];
        }
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
            row.innerHTML = `
                <td>${resep.nama_resep || 'N/A'}</td>
                <td><span class="chip-kategori">Produk Jadi</span></td>
                <td>${resep.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(resep.harga_jual || 0)}</td>
                <td><button class="button-edit">Lihat/Edit</button> <button class="button-delete">Hapus</button></td>
            `;
            produkTableBody.appendChild(row);
        });
    }

    function populateEditForm(id) { /* ... fungsi ini tidak berubah ... */ }
    async function handleHapusBahan(id) { /* ... fungsi ini tidak berubah ... */ }
    async function handleHapusProduk(id, namaResep) {
        if (confirm(`Yakin mau hapus resep "${namaResep}"?`)) {
            const { error } = await _supabase.from('resep').delete().eq('id', id);
            if (error) { alert('Gagal hapus resep: ' + error.message); } 
            else {
                alert('Resep berhasil dihapus.');
                loadDataAwal();
            }
        }
    }
    
    async function loadProdukToKalkulator(resepId) {
        const { data: resep, error } = await _supabase.from('resep').select('*').eq('id', resepId).single();
        if (error || !resep) { alert('Gagal mengambil detail resep!'); return; }
        
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.nav-button[data-page="page-kalkulator"]').classList.add('active');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('page-kalkulator').classList.add('active');
        
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        jenisProdukInput.value = resep.tipe_resep;
        jenisProdukInput.disabled = true;
        jenisProdukInput.dispatchEvent(new Event('change'));

        document.getElementById('produk-nama').value = resep.nama_resep;
        document.getElementById('produk-kategori').value = resep.kategori;
        document.getElementById('harga-jual-aktual').value = resep.harga_jual;
        
        const resepTableBody = document.getElementById('resep-table-body');
        resepTableBody.innerHTML = '';
        if(resep.resep_json) {
            resep.resep_json.forEach(item => {
                const hargaSatuan = (item.biaya && item.jumlah > 0) ? item.biaya / item.jumlah : 0;
                const bahanInfo = { nama: item.nama_bahan, bahanId: item.bahan_id, harga: hargaSatuan, source: item.source };
                tambahBahanKeResep(bahanInfo, item.jumlah);
            });
        }
        isEditing = true;
        editingResepId = resepId;
        document.querySelector('#hpp-form button[type="submit"]').textContent = 'Update Resep';
        kalkulasiFinal();
    }

    function renderPilihBahanList(list, sourceType) {
        const searchResults = document.getElementById('bahan-search-results');
        if (!searchResults) return;
        searchResults.innerHTML = '';
        if (list.length === 0) { searchResults.innerHTML = `<li>Tidak ada ${sourceType.replace(/_/g, ' ')} tersedia.</li>`; } 
        else {
            list.forEach(item => {
                const li = document.createElement('li');
                let nama, harga, satuan, id;
                if (sourceType === 'bahan_baku') {
                    nama = item.nama;
                    harga = (item.harga_beli_kemasan && item.isi_kemasan > 0) ? (item.harga_beli_kemasan / item.isi_kemasan) : 0;
                    satuan = item.satuan_kemasan;
                    id = item.id;
                } else { // 'bahan_olahan'
                    nama = item.nama_resep;
                    harga = (item.total_hpp && item.hasil_jadi_jumlah > 0) ? item.total_hpp / item.hasil_jadi_jumlah : 0;
                    satuan = item.hasil_jadi_satuan;
                    id = item.id;
                }
                li.textContent = `${nama} (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(harga)} / ${satuan || ''})`;
                li.dataset.bahanId = id; li.dataset.source = sourceType; li.dataset.nama = nama; li.dataset.harga = harga;
                li.classList.add('search-result-item');
                searchResults.appendChild(li);
            });
        }
    }

    function tambahBahanKeResep(bahanInfo, jumlah) { /* ... fungsi ini tidak berubah ... */ }
    function openPilihBahanModal() { /* ... fungsi ini tidak berubah ... */ }
    function kalkulasiFinal() { /* ... fungsi ini tidak berubah ... */ }

    async function handleSimpanProduk(e) {
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
            nama_resep: document.getElementById('produk-nama').value,
            tipe_resep: document.getElementById('jenis-produk-input').value,
            kategori: document.getElementById('produk-kategori').value,
            resep_json: resepJsonData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            harga_jual: parseFloat(document.getElementById('harga-jual-aktual').value) || 0,
        };
        if (!resepData.nama_resep) { alert('Nama resep harus diisi!'); return; }
        
        if (resepData.tipe_resep === 'BAHAN OLAHAN') {
            resepData.hasil_jadi_jumlah = parseFloat(document.getElementById('hasil-jadi-jumlah').value) || null;
            resepData.hasil_jadi_satuan = document.getElementById('hasil-jadi-satuan').value || null;
        }
        
        let error;
        if (isEditing && editingResepId) {
            ({ error } = await _supabase.from('resep').update(resepData).eq('id', editingResepId));
        } else {
            ({ error } = await _supabase.from('resep').insert([resepData]));
        }

        if (error) { alert(`Gagal: ${error.message}`); } 
        else {
            alert(`Resep "${resepData.nama_resep}" berhasil diproses!`);
            resetKalkulator();
            loadDataAwal();
        }
    }

    function resetKalkulator() { /* ... fungsi ini tidak berubah ... */ }
    
    // BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER
    function setupAppEventListeners() {
        // ... (semua listener disesuaikan dengan logika baru)
    }
    
    // BAGIAN 6: JALANKAN APLIKASI
    initAuth();
});
