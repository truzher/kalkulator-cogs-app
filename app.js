// =================================================================
// KODE MASTER STABIL - 11 JULI 2025
// SEMUA FITUR YANG PERNAH DIBUAT TELAH DIGABUNGKAN DENGAN BENAR
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
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

    function populateEditForm(id) {
        const bahan = masterBahanList.find(b => b.id == id);
        if (!bahan) return;
        document.getElementById('edit-bahan-id').value = bahan.id;
        document.getElementById('edit-bahan-nama').value = bahan.nama;
        document.getElementById('edit-bahan-kategori').value = bahan.kategori;
        document.getElementById('edit-harga-beli-kemasan').value = bahan.harga_beli_kemasan;
        document.getElementById('edit-isi-kemasan').value = bahan.isi_kemasan;
        document.getElementById('edit-satuan-kemasan').value = bahan.satuan_kemasan;
        if(editModal) editModal.classList.remove('hidden');
    }

    async function handleHapusBahan(id) {
        if (confirm('Yakin mau hapus bahan ini?')) {
            const { error } = await _supabase.from('bahan_baku').delete().eq('id', id);
            if (error) { alert('Gagal hapus bahan: ' + error.message); } 
            else {
                alert('Bahan berhasil dihapus.');
                loadBahanBaku();
            }
        }
    }

    function renderPilihBahanList(list, sourceType) {
        const searchResults = document.getElementById('bahan-search-results');
        if (!searchResults) return;
        searchResults.innerHTML = '';
        if (list.length === 0) {
            searchResults.innerHTML = `<li>Tidak ada ${sourceType.replace(/_/g, ' ')} tersedia.</li>`;
        } else {
            list.forEach(item => {
                const li = document.createElement('li');
                let nama, harga, satuan, id;
                if (sourceType === 'bahan_baku') {
                    nama = item.nama;
                    harga = (item.harga_beli_kemasan && item.isi_kemasan > 0) ? (item.harga_beli_kemasan / item.isi_kemasan) : 0;
                    satuan = item.satuan_kemasan;
                    id = item.id;
                } else {
                    nama = item.nama_produk;
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

    function tambahBahanKeResep(bahanInfo) {
        const resepTableBody = document.getElementById('resep-table-body');
        if(!resepTableBody) return;
        const row = document.createElement('tr');
        row.dataset.bahanId = bahanInfo.bahanId; row.dataset.source = bahanInfo.source; row.dataset.harga = bahanInfo.harga;
        row.innerHTML = `
            <td>${bahanInfo.nama}</td>
            <td><input type="number" class="resep-jumlah" placeholder="0" min="0" step="any"></td>
            <td class="resep-biaya">Rp 0,00</td>
            <td><button class="resep-delete-btn">Hapus</button></td>
        `;
        resepTableBody.appendChild(row);
        document.getElementById('pilih-bahan-modal').classList.add('hidden');
        kalkulasiFinal();
    }

    function openPilihBahanModal() {
        const modal = document.getElementById('pilih-bahan-modal');
        const searchInput = document.getElementById('search-bahan-input');
        if (!modal || !searchInput) return;
        searchInput.value = '';
        document.querySelector('.bahan-source-btn[data-source="bahan_baku"]').classList.add('active');
        const tabSetengahJadi = document.querySelector('.bahan-source-btn[data-source="produk_setengah_jadi"]');
        if (tabSetengahJadi) tabSetengahJadi.classList.remove('active');
        renderPilihBahanList(masterBahanList, 'bahan_baku');
        modal.classList.remove('hidden');
    }

    function kalkulasiFinal() {
        const semuaBahan = document.querySelectorAll('#resep-table-body tr');
        let hppBahanBaku = 0;
        semuaBahan.forEach(row => {
            const biayaText = row.querySelector('.resep-biaya').textContent;
            const biayaAngka = parseFloat(biayaText.replace(/[^0-9,-]+/g, "").replace(",", "."));
            if (!isNaN(biayaAngka)) { hppBahanBaku += biayaAngka; }
        });
        const overheadCost = parseFloat(document.getElementById('overhead-cost').value) || 0;
        const overheadType = document.getElementById('overhead-type').value;
        const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
        const errorCostPercent = parseFloat(document.getElementById('error-cost-percent').value) || 0;
        const targetMarginPercent = parseFloat(document.getElementById('target-margin-percent').value) || 0;
        const hargaJualAktual = parseFloat(document.getElementById('harga-jual-aktual').value) || 0;
        let overheadNominal = overheadCost;
        if (overheadType === 'persen' && hppBahanBaku > 0) {
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

   async function handleSimpanProduk(e) {
    e.preventDefault();
    console.log("Tombol Simpan Produk diklik.");

    // --- Mengumpulkan data dasar & resep ---
    const resepRows = document.querySelectorAll('#resep-table-body tr');
    if (resepRows.length === 0) {
        alert('Resep tidak boleh kosong!');
        return;
    }
    const resepData = Array.from(resepRows).map(row => ({
        bahan_id: row.dataset.bahanId,
        nama_bahan: row.cells[0].textContent,
        jumlah: row.querySelector('.resep-jumlah').value,
        biaya: parseFloat(row.querySelector('.resep-biaya').textContent.replace(/[^0-9,-]+/g, "").replace(",", "."))
    }));

    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert("Sesi tidak valid, silakan login ulang.");
        return;
    }
    
    // --- Membangun objek data dasar ---
    let produkData = {
        user_id: user.id,
        nama_produk: document.getElementById('produk-nama').value,
        kategori_produk: document.getElementById('produk-kategori').value,
        resep: resepData,
        total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
        saran_harga_jual: parseFloat(document.getElementById('saran-harga-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
        profit: parseFloat(document.getElementById('profit-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
        profit_persen: parseFloat(document.getElementById('profit-percent-display').textContent.replace('%', ''))
    };

    if (!produkData.nama_produk) {
        alert('Nama produk harus diisi!');
        return;
    }

    // --- Logika Cerdas: Tentukan target tabel & tambahkan data spesifik ---
    const tipeProduk = document.getElementById('jenis-produk-input').value;
    let targetTable;

    if (tipeProduk === 'Produk Setengah Jadi') {
        targetTable = 'produk_setengah_jadi';
        // Hanya tambahkan kolom ini jika tipenya produk setengah jadi
        produkData.hasil_jadi_jumlah = parseFloat(document.getElementById('hasil-jadi-jumlah').value) || null;
        produkData.hasil_jadi_satuan = document.getElementById('hasil-jadi-satuan').value || null;
    } else {
        targetTable = 'produk_jadi';
    }

    console.log(`Mengirim data ke tabel: ${targetTable}`, produkData);
    const { data, error } = await _supabase.from(targetTable).insert([produkData]).select();

    if (error) {
        alert('Gagal menyimpan produk: ' + error.message);
        console.error('Error Supabase:', error);
    } else {
        alert(`Produk "${data[0].nama_produk}" berhasil disimpan!`);
        if (hppForm) hppForm.reset();
        document.getElementById('resep-table-body').innerHTML = '';
        kalkulasiFinal();
        if (targetTable === 'produk_setengah_jadi') {
            loadProdukSetengahJadi();
        }
    }
}

    // BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER
    function setupAppEventListeners() {
        if (masterBahanForm) {
            masterBahanForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newBahan = {
                    nama: document.getElementById('bahan-nama').value,
                    kategori: document.getElementById('bahan-kategori').value,
                    harga_beli_kemasan: document.getElementById('harga-beli-kemasan').value,
                    isi_kemasan: document.getElementById('isi-kemasan').value,
                    satuan_kemasan: document.getElementById('satuan-kemasan').value,
                };
                const { data: { user } } = await _supabase.auth.getUser();
                if(user) newBahan.user_id = user.id;
                const { error } = await _supabase.from('bahan_baku').insert([newBahan]);
                if (error) { alert('Gagal simpan bahan: ' + error.message); } 
                else {
                    alert('Bahan baru berhasil disimpan!');
                    masterBahanForm.reset();
                    loadBahanBaku();
                }
            });
        }
        if (editBahanForm) {
            editBahanForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-bahan-id').value;
                const updatedBahan = {
                    nama: document.getElementById('edit-bahan-nama').value,
                    kategori: document.getElementById('edit-bahan-kategori').value,
                    harga_beli_kemasan: document.getElementById('edit-harga-beli-kemasan').value,
                    isi_kemasan: document.getElementById('edit-isi-kemasan').value,
                    satuan_kemasan: document.getElementById('edit-satuan-kemasan').value,
                };
                const { error } = await _supabase.from('bahan_baku').update(updatedBahan).eq('id', id);
                if (error) { alert('Gagal update bahan: ' + error.message); } 
                else {
                    alert('Bahan berhasil diupdate!');
                    if(editModal) editModal.classList.add('hidden');
                    loadBahanBaku();
                }
            });
        }
        if (masterBahanTableBody) {
            masterBahanTableBody.addEventListener('click', (e) => {
                const targetRow = e.target.closest('tr');
                if (!targetRow || !targetRow.dataset.id) return;
                const id = targetRow.dataset.id;
                if (e.target.classList.contains('edit-btn')) { populateEditForm(id); }
                if (e.target.classList.contains('delete-btn')) { handleHapusBahan(id); }
            });
        }
        if (cancelEditBtn) { cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden')); }

        const navButtons = document.querySelectorAll('.nav-button');
        const pages = document.querySelectorAll('.page');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.page).classList.add('active');
            });
        });

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                loadBahanBaku(button.dataset.kategori);
            });
        });
        
        const addResepItemBtn = document.getElementById('add-resep-item-btn');
        if (addResepItemBtn) { addResepItemBtn.addEventListener('click', openPilihBahanModal); }
        
        const cancelPilihBahanBtn = document.getElementById('cancel-pilih-bahan-btn');
        if (cancelPilihBahanBtn) { cancelPilihBahanBtn.addEventListener('click', () => document.getElementById('pilih-bahan-modal').classList.add('hidden')); }

        const buatBahanBaruCepatBtn = document.getElementById('buat-bahan-baru-cepat-btn');
        if (buatBahanBaruCepatBtn) {
            buatBahanBaruCepatBtn.addEventListener('click', () => {
                document.getElementById('pilih-bahan-modal').classList.add('hidden');
                document.getElementById('tambah-bahan-cepat-modal').classList.remove('hidden');
            });
        }
        
        const cancelTambahCepatBtn = document.getElementById('cancel-tambah-cepat-btn');
        if (cancelTambahCepatBtn) { cancelTambahCepatBtn.addEventListener('click', () => document.getElementById('tambah-bahan-cepat-modal').classList.add('hidden')); }

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

        const searchInput = document.getElementById('search-bahan-input');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const currentSource = document.querySelector('.bahan-source-btn.active').dataset.source;
                const listToSearch = currentSource === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
                const nameProperty = currentSource === 'bahan_baku' ? 'nama' : 'nama_produk';
                const filteredList = listToSearch.filter(item => item[nameProperty] && item[nameProperty].toLowerCase().includes(searchTerm));
                renderPilihBahanList(filteredList, currentSource);
            });
        }

        const searchResultsContainer = document.getElementById('bahan-search-results');
        if(searchResultsContainer) {
            searchResultsContainer.addEventListener('click', (e) => {
                if(e.target && e.target.matches('li.search-result-item')) {
                    tambahBahanKeResep(e.target.dataset);
                }
            });
        }
        
        const resepTableBody = document.getElementById('resep-table-body');
        if(resepTableBody) {
            resepTableBody.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('resep-delete-btn')) {
                    e.target.closest('tr').remove();
                    kalkulasiFinal();
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
                    kalkulasiFinal();
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

        if (hppForm) {
            hppForm.addEventListener('submit', handleSimpanProduk);
        }
    }
    
    // BAGIAN 6: JALANKAN APLIKASI
    initAuth();
});
