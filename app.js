// =================================================================
// KODE FINAL - DENGAN TAMPILAN DAFTAR PRODUK
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let produkSetengahJadiList = [];

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
        await loadBahanBaku();
        await loadProdukSetengahJadi();
        await loadProdukJadi();
    }
    
    async function loadBahanBaku(kategoriFilter = 'Semua') {
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

    async function loadProdukSetengahJadi() {
        const { data, error } = await _supabase.from('produk_setengah_jadi').select('*');
        if (error) { console.error("Gagal memuat produk setengah jadi:", error.message); produkSetengahJadiList = []; } 
        else { produkSetengahJadiList = data; }
    }

    async function loadProdukJadi() {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;
        const { data, error } = await _supabase.from('produk_jadi').select('*').order('created_at', { ascending: false });
        if (error) { console.error("Gagal memuat produk jadi:", error.message); return; }
        produkTableBody.innerHTML = '';
        if (data.length === 0) {
            produkTableBody.innerHTML = '<tr><td colspan="5">Belum ada produk yang disimpan.</td></tr>';
            return;
        }
        data.forEach(produk => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produk.nama_produk || 'N/A'}</td>
                <td><span class="chip-kategori">Produk Jadi</span></td>
                <td>${produk.kategori_produk || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.saran_harga_jual || 0)}</td>
                <td>
                    <button class="button-edit">Lihat/Edit</button>
                    <button class="button-delete">Hapus</button>
                </td>
            `;
            produkTableBody.appendChild(row);
        });
    }

    function populateEditForm(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    async function handleHapusBahan(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    function renderPilihBahanList(list, sourceType) { /* ... (Tidak ada perubahan di sini) ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... (Tidak ada perubahan di sini) ... */ }
    function openPilihBahanModal() { /* ... (Tidak ada perubahan di sini) ... */ }
    function kalkulasiFinal() { /* ... (Tidak ada perubahan di sini) ... */ }
    
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
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) { alert("Sesi tidak valid, silakan login ulang."); return; }
        let produkData = {
            user_id: user.id,
            nama_produk: document.getElementById('produk-nama').value,
            kategori_produk: document.getElementById('produk-kategori').value,
            resep: resepData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            saran_harga_jual: parseFloat(document.getElementById('saran-harga-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit: parseFloat(document.getElementById('profit-display').textContent.replace(/[^0-g,-]+/g, "").replace(",", ".")),
            profit_persen: parseFloat(document.getElementById('profit-percent-display').textContent.replace('%', '')),
        };
        if (!produkData.nama_produk) { alert('Nama produk harus diisi!'); return; }
        if (tipeProduk === 'Produk Setengah Jadi') {
            produkData.hasil_jadi_jumlah = parseFloat(document.getElementById('hasil-jadi-jumlah').value) || null;
            produkData.hasil_jadi_satuan = document.getElementById('hasil-jadi-satuan').value || null;
        }
        const { data, error } = await _supabase.from(targetTable).insert([produkData]).select();
        if (error) { alert(`Gagal menyimpan produk: ${error.message}`); } 
        else {
            alert(`Produk "${data[0].nama_produk}" berhasil disimpan!`);
            if(hppForm) hppForm.reset();
            document.getElementById('resep-table-body').innerHTML = '';
            kalkulasiFinal();
            if (targetTable === 'produk_setengah_jadi') { await loadProdukSetengahJadi(); }
            await loadProdukJadi();
        }
    }

    // --- (BAGIAN 5 & 6) ---
    function setupAppEventListeners() { /* ... (Tidak ada perubahan di sini) ... */ }
    initAuth();
});
