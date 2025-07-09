document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    let isEditingProduk = false;
    let editingProdukId = null;

    // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN & EVENT LISTENER ===
    const setupUI = (user) => {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (user) {
            currentUser = user;
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                const userEmailDisplay = document.getElementById('user-email-display');
                if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            }
            
            loadBahanBaku();
            loadProduk();
            
            if (!appContainer.dataset.listenersAttached) {
                setupAppEventListeners();
                appContainer.dataset.listenersAttached = 'true';
            }
        } else {
            currentUser = null;
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
        }
    };

    // === FUNGSI-FUNGSI APLIKASI ===
    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
    };

    const loadBahanBaku = async (kategoriFilter = 'Semua') => {
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) return;

        let query = supabaseClient.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') {
            query = query.eq('kategori', kategoriFilter);
        }
        const { data, error } = await query;

        if (error) { console.error('Error mengambil data bahan baku:', error); return; }
        
        if (kategoriFilter === 'Semua') {
            masterBahanList = data;
        }

        masterBahanTableBody.innerHTML = '';
        data.forEach(bahan => {
            const hargaPerSatuanDasar = (bahan.isi_kemasan > 0) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama}</td>
                <td><span class="chip-kategori">${bahan.kategori || 'Lainnya'}</span></td>
                <td>${formatRupiah(hargaPerSatuanDasar)} / ${bahan.satuan_kemasan}</td>
                <td>
                    <button class="button-edit" data-id="${bahan.id}">Edit</button>
                    <button class="button-delete" data-id="${bahan.id}">Hapus</button>
                </td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    };
    
    const simpanBahanBaku = async (event, isCepat = false) => {
        event.preventDefault();
        if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }
        
        const formPrefix = isCepat ? '-cepat' : '';
        const formElement = isCepat ? document.getElementById('master-bahan-cepat-form') : document.getElementById('master-bahan-form');

        const nama = document.getElementById(`bahan-nama${formPrefix}`).value;
        const kategori = document.getElementById(`bahan-kategori${formPrefix}`).value;
        const harga_beli_kemasan = document.getElementById(`harga-beli-kemasan${formPrefix}`).value;
        const isi_kemasan = document.getElementById(`isi-kemasan${formPrefix}`).value;
        const satuan_kemasan = document.getElementById(`satuan-kemasan${formPrefix}`).value;
        
        const { data, error } = await supabaseClient.from('bahan_baku').insert([{ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan, user_id: currentUser.id }]).select();
        
        if (error) { 
            console.error('Error menyimpan bahan baku:', error); 
            alert('Gagal menyimpan bahan!'); 
        } else { 
            formElement.reset(); 
            await loadBahanBaku();
            if (isCepat) {
                document.getElementById('tambah-bahan-cepat-modal').classList.add('hidden');
                tampilkanHasilPencarian(nama, 'bahan_baku');
            }
        }
    };

    const hapusBahanBaku = async (id) => {
        if (confirm("Yakin mau hapus bahan ini?")) {
            const { error } = await supabaseClient.from('bahan_baku').delete().eq('id', id);
            if (error) { console.error('Error menghapus bahan baku:', error); alert('Gagal menghapus bahan!'); } 
            else { loadBahanBaku(); }
        }
    };

    const openEditModal = async (id) => {
        const editModal = document.getElementById('edit-modal');
        const { data, error } = await supabaseClient.from('bahan_baku').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data untuk diedit:', error); return; }
        document.getElementById('edit-bahan-id').value = data.id;
        document.getElementById('edit-bahan-nama').value = data.nama;
        document.getElementById('edit-bahan-kategori').value = data.kategori || 'Bahan Umum';
        document.getElementById('edit-harga-beli-kemasan').value = data.harga_beli_kemasan;
        document.getElementById('edit-isi-kemasan').value = data.isi_kemasan;
        document.getElementById('edit-satuan-kemasan').value = data.satuan_kemasan;
        editModal.classList.remove('hidden');
    };

    const simpanPerubahanBahan = async (event) => {
        event.preventDefault();
        const editModal = document.getElementById('edit-modal');
        const id = document.getElementById('edit-bahan-id').value;
        const nama = document.getElementById('edit-bahan-nama').value;
        const kategori = document.getElementById('edit-bahan-kategori').value;
        const harga_beli_kemasan = document.getElementById('edit-harga-beli-kemasan').value;
        const isi_kemasan = document.getElementById('edit-isi-kemasan').value;
        const satuan_kemasan = document.getElementById('edit-satuan-kemasan').value;
        const { error } = await supabaseClient.from('bahan_baku').update({ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan }).eq('id', id);
        if (error) { console.error('Error menyimpan perubahan:', error); alert('Gagal menyimpan perubahan!'); } 
        else { editModal.classList.add('hidden'); loadBahanBaku(); }
    };
    
    // === FUNGSI-FUNGSI KALKULATOR ===

    const addBahanFromModal = (bahan) => {
        const resepTableBody = document.getElementById('resep-table-body');
        const row = document.createElement('tr');
        row.dataset.bahanId = bahan.id;
        row.dataset.source = bahan.source;
        row.innerHTML = `
            <td>${bahan.nama}</td>
            <td><input type="number" class="jumlah-resep" placeholder="0" min="0"></td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
        updatePerhitunganTotal();
    };

    const updatePerhitunganTotal = () => {
        const resepTableBody = document.getElementById('resep-table-body');
        const totalCogsDisplay = document.getElementById('total-cogs-display');
        const saranHargaDisplay = document.getElementById('saran-harga-display');
        const profitDisplay = document.getElementById('profit-display');
        const profitPercentDisplay = document.getElementById('profit-percent-display');
        const hargaJualAktualInput = document.getElementById('harga-jual-aktual');
        const overheadCostInput = document.getElementById('overhead-cost');
        const overheadTypeInput = document.getElementById('overhead-type');
        const laborCostInput = document.getElementById('labor-cost');
        const errorCostPercentInput = document.getElementById('error-cost-percent');
        const targetMarginPercentInput = document.getElementById('target-margin-percent');

        let totalBiayaBahan = 0;
        resepTableBody.querySelectorAll('tr').forEach(row => {
            const jumlahInput = row.querySelector('.jumlah-resep');
            const biayaDisplay = row.querySelector('.biaya-resep-display');
            const bahanId = row.dataset.bahanId;
            const source = row.dataset.source;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            
            const listToSearch = source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
            const bahanTerpilih = listToSearch.find(b => b.id === bahanId);

            if (bahanTerpilih) {
                let hargaPerSatuan = 0;
                if(source === 'bahan_baku'){
                    if(bahanTerpilih.isi_kemasan > 0) hargaPerSatuan = bahanTerpilih.harga_beli_kemasan / bahanTerpilih.isi_kemasan;
                } else {
                    const hppBahanBiang = hitungHppProduk(bahanTerpilih);
                    if(bahanTerpilih.hasil_jadi_jumlah > 0) {
                        hargaPerSatuan = hppBahanBiang / bahanTerpilih.hasil_jadi_jumlah;
                    }
                }

                const biayaBahan = jumlah * hargaPerSatuan;
                biayaDisplay.textContent = formatRupiah(biayaBahan);
                totalBiayaBahan += biayaBahan;
            } else {
                biayaDisplay.textContent = 'Rp 0,00';
            }
        });
        
        const overheadValue = parseFloat(overheadCostInput.value) || 0;
        const overheadType = overheadTypeInput.value;
        let overheadCost = 0;
        if (overheadType === 'persen') {
            overheadCost = totalBiayaBahan * (overheadValue / 100);
        } else {
            overheadCost = overheadValue;
        }

        const labor = parseFloat(laborCostInput.value) || 0;
        const biayaProduksi = totalBiayaBahan + overheadCost + labor;
        const errorPercent = parseFloat(errorCostPercentInput.value) || 0;
        const errorCost = biayaProduksi * (errorPercent / 100);
        const totalCogs = biayaProduksi + errorCost;
        totalCogsDisplay.textContent = formatRupiah(totalCogs);
        
        const marginPercent = parseFloat(targetMarginPercentInput.value) || 0;
        let saranHarga = 0;
        if (marginPercent < 100 && marginPercent >= 0) {
            saranHarga = totalCogs / (1 - (marginPercent / 100));
        } else if (totalCogs > 0) {
            saranHarga = totalCogs;
        }
        saranHargaDisplay.textContent = formatRupiah(saranHarga);
        
        const hargaJualAktual = parseFloat(hargaJualAktualInput.value) || 0;
        if (hargaJualAktual === 0 && saranHarga > 0) {
            hargaJualAktualInput.value = Math.ceil(saranHarga / 1000) * 1000;
        }
        
        const profit = hargaJualAktual - totalCogs;
        const profitPercent = hargaJualAktual > 0 ? (profit / hargaJualAktual) * 100 : 0;
        profitDisplay.textContent = formatRupiah(profit);
        profitPercentDisplay.textContent = profitPercent.toFixed(2);
    };

    const simpanProduk = async (event) => {
        event.preventDefault();
        if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }
        
        const produkNamaInput = document.getElementById('produk-nama');
        const resepTableBody = document.getElementById('resep-table-body');
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        const produkKategoriInput = document.getElementById('produk-kategori');
        const hasilJadiJumlahInput = document.getElementById('hasil-jadi-jumlah');
        const hasilJadiSatuanInput = document.getElementById('hasil-jadi-satuan');
        const overheadCostInput = document.getElementById('overhead-cost');
        const overheadTypeInput = document.getElementById('overhead-type');
        const laborCostInput = document.getElementById('labor-cost');
        const errorCostPercentInput = document.getElementById('error-cost-percent');
        const targetMarginPercentInput = document.getElementById('target-margin-percent');
        const hargaJualAktualInput = document.getElementById('harga-jual-aktual');

        const namaProduk = produkNamaInput.value;
        if (!namaProduk) { alert('Nama produk tidak boleh kosong!'); return; }
        
        const resepItems = [];
        resepTableBody.querySelectorAll('tr').forEach(row => {
            const bahanId = row.dataset.bahanId;
            const jumlah = parseFloat(row.querySelector('.jumlah-resep').value) || 0;
            if (bahanId && jumlah > 0) {
                resepItems.push({ bahan_id: bahanId, jumlah: jumlah, source: row.dataset.source });
            }
        });
        if (resepItems.length === 0) { alert('Resep tidak boleh kosong!'); return; }

        const produkData = {
            nama_produk: namaProduk,
            resep: resepItems,
            jenis_produk: jenisProdukInput.value,
            kategori: produkKategoriInput.value,
            hasil_jadi_jumlah: parseFloat(hasilJadiJumlahInput.value) || 0,
            hasil_jadi_satuan: hasilJadiSatuanInput.value,
            overhead_cost: parseFloat(overheadCostInput.value) || 0,
            overhead_cost_type: overheadTypeInput.value,
            labor_cost: parseFloat(laborCostInput.value) || 0,
            error_cost_percent: parseFloat(errorCostPercentInput.value) || 0,
            target_margin_percent: parseFloat(targetMarginPercentInput.value) || 0,
            harga_jual_aktual: parseFloat(hargaJualAktualInput.value) || 0,
            user_id: currentUser.id
        };

        let error;
        if (isEditingProduk && editingProdukId) {
            const { error: updateError } = await supabaseClient.from('produk').update(produkData).eq('id', editingProdukId);
            error = updateError;
        } else {
            const { error: insertError } = await supabaseClient.from('produk').insert([produkData]);
            error = insertError;
        }
        if (error) {
            console.error('Error menyimpan produk:', error);
            alert('Gagal menyimpan produk!');
        } else {
            alert(`Produk berhasil ${isEditingProduk ? 'diperbarui' : 'disimpan'}!`);
            resetFormHpp();
            await loadProduk();
        }
    };

    const loadProduk = async () => {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;

        const { data, error } = await supabaseClient.from('produk').select('*').order('created_at', { ascending: false });
        if (error) { console.error('Error mengambil data produk:', error); return; }
        
        produkJadiList = data.filter(p => p.jenis_produk === 'Produk Jadi');
        produkSetengahJadiList = data.filter(p => p.jenis_produk === 'Produk Setengah Jadi');

        produkTableBody.innerHTML = '';
        data.forEach(produk => {
            const row = document.createElement('tr');
            const tagBiang = produk.jenis_produk === 'Produk Setengah Jadi' ? '<small class="chip">Biang</small>' : '';
            row.innerHTML = `
                <td>${produk.nama_produk} ${tagBiang}</td>
                <td>${produk.kategori || '-'}</td>
                <td>${produk.jenis_produk === 'Produk Jadi' ? formatRupiah(produk.harga_jual_aktual) : '-'}</td>
                <td>
                    <button class="button-edit" data-id="${produk.id}">Edit</button>
                    <button class="button-delete" data-id="${produk.id}">Hapus</button>
                </td>
            `;
            produkTableBody.appendChild(row);
        });
    };

    const hapusProduk = async (id) => {
        if (confirm("Yakin mau hapus produk ini beserta resepnya?")) {
            const { error } = await supabaseClient.from('produk').delete().eq('id', id);
            if (error) { console.error('Error menghapus produk:', error); alert('Gagal menghapus produk!'); } 
            else { loadProduk(); }
        }
    };

    const editProduk = async (id) => {
        const { data: produk, error } = await supabaseClient.from('produk').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data produk:', error); return; }
        
        isEditingProduk = true;
        editingProdukId = id;
        
        const produkNamaInput = document.getElementById('produk-nama');
        const produkKategoriInput = document.getElementById('produk-kategori');
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        const hasilJadiJumlahInput = document.getElementById('hasil-jadi-jumlah');
        const hasilJadiSatuanInput = document.getElementById('hasil-jadi-satuan');
        const overheadCostInput = document.getElementById('overhead-cost');
        const overheadTypeInput = document.getElementById('overhead-type');
        const laborCostInput = document.getElementById('labor-cost');
        const errorCostPercentInput = document.getElementById('error-cost-percent');
        const targetMarginPercentInput = document.getElementById('target-margin-percent');
        const hargaJualAktualInput = document.getElementById('harga-jual-aktual');
        const resepTableBody = document.getElementById('resep-table-body');

        produkNamaInput.value = produk.nama_produk;
        produkKategoriInput.value = produk.kategori || 'Minuman';
        jenisProdukInput.value = produk.jenis_produk || 'Produk Jadi';
        hasilJadiJumlahInput.value = produk.hasil_jadi_jumlah || '';
        hasilJadiSatuanInput.value = produk.hasil_jadi_satuan || '';
        overheadCostInput.value = produk.overhead_cost || 0;
        overheadTypeInput.value = produk.overhead_cost_type || 'nominal';
        laborCostInput.value = produk.labor_cost || 0;
        errorCostPercentInput.value = produk.error_cost_percent || 0;
        targetMarginPercentInput.value = produk.target_margin_percent || 0;
        hargaJualAktualInput.value = produk.harga_jual_aktual || 0;
        
        resepTableBody.innerHTML = '';
        if (produk.resep) {
            produk.resep.forEach(item => {
                const listToSearch = item.source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
                const bahan = listToSearch.find(b => b.id === item.bahan_id);
                if (bahan) {
                    addBahanFromModal(bahan, item.jumlah);
                }
            });
        }
        
        updatePerhitunganTotal();
        toggleKalkulatorMode();
        
        document.querySelector('.main-nav [data-page="page-kalkulator"]').click();
        document.getElementById('kalkulator-container').scrollIntoView({ behavior: 'smooth' });
    };

    const resetFormHpp = () => {
        isEditingProduk = false;
        editingProdukId = null;
        document.getElementById('hpp-form').reset();
        document.getElementById('resep-table-body').innerHTML = '';
        toggleKalkulatorMode();
        updatePerhitunganTotal();
    };

    const toggleKalkulatorMode = () => {
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        const hasilJadiContainer = document.getElementById('hasil-jadi-container');
        const hargaJualContainer = document.getElementById('harga-jual-container');
        const saranHargaWrapper = document.getElementById('saran-harga-wrapper');

        const tipe = jenisProdukInput.value;
        if (tipe === 'Produk Setengah Jadi') {
            hasilJadiContainer.classList.remove('hidden');
            hargaJualContainer.classList.add('hidden');
            saranHargaWrapper.classList.add('hidden');
        } else {
            hasilJadiContainer.classList.add('hidden');
            hargaJualContainer.classList.remove('hidden');
            saranHargaWrapper.classList.remove('hidden');
        }
    };

    const openPilihBahanModal = () => {
        const pilihBahanModal = document.getElementById('pilih-bahan-modal');
        const searchBahanInput = document.getElementById('search-bahan-input');
        tampilkanHasilPencarian();
        pilihBahanModal.classList.remove('hidden');
        searchBahanInput.value = '';
        searchBahanInput.focus();
    };

    const tampilkanHasilPencarian = (query = '', source = 'bahan_baku') => {
        const bahanSearchResults = document.getElementById('bahan-search-results');
        bahanSearchResults.innerHTML = '';
        const listToSearch = source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
        const filteredList = listToSearch.filter(item => {
            const itemName = item.nama || item.nama_produk;
            return itemName && itemName.toLowerCase().includes(query.toLowerCase());
        });
        if (filteredList.length === 0) {
            bahanSearchResults.innerHTML = '<li>Bahan tidak ditemukan.</li>';
            return;
        }
        filteredList.forEach(item => {
            const li = document.createElement('li');
            const itemName = item.nama || item.nama_produk;
            const itemSatuan = item.satuan_kemasan || item.hasil_jadi_satuan;
            li.dataset.id = item.id;
            li.dataset.source = source;
            li.dataset.nama = itemName;
            let hargaPerSatuanDasar = 0;
            if(source === 'bahan_baku'){
                if(item.isi_kemasan > 0) hargaPerSatuanDasar = item.harga_beli_kemasan / item.isi_kemasan;
            } else {
                const hppBahanBiang = hitungHppProduk(item);
                if(item.hasil_jadi_jumlah > 0) hargaPerSatuanDasar = hppBahanBiang / item.hasil_jadi_jumlah;
            }
            const tagBiang = source === 'produk_setengah_jadi' ? '<small class="chip">Biang</small>' : '';
            li.innerHTML = `<div><span>${itemName}</span>${tagBiang}</div><small>${formatRupiah(hargaPerSatuanDasar)} / ${itemSatuan}</small>`;
            bahanSearchResults.appendChild(li);
        });
    };

    const hitungHppProduk = (produk) => {
        if (!produk || !produk.resep) return 0;
        return produk.resep.reduce((total, item) => {
            const listToSearch = item.source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;
            const bahan = listToSearch.find(b => b.id === item.bahan_id);
            if (!bahan) return total;

            let hargaPerSatuan = 0;
            if (item.source === 'bahan_baku') {
                if (bahan.isi_kemasan > 0) hargaPerSatuan = bahan.harga_beli_kemasan / bahan.isi_kemasan;
            } else {
                const hppBahanBiang = hitungHppProduk(bahan);
                if (bahan.hasil_jadi_jumlah > 0) hargaPerSatuan = hppBahanBiang / bahan.hasil_jadi_jumlah;
            }
            return total + (item.jumlah * hargaPerSatuan);
        }, 0);
    };


    // === EVENT LISTENERS ===
    const setupEventListeners = () => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { alert('Error login: ' + error.message); } });
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) signupForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('signup-email').value; const password = document.getElementById('signup-password').value; const { error } = await supabaseClient.auth.signUp({ email, password }); if (error) { alert('Error mendaftar: ' + error.message); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); } });
        
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', async () => { await supabaseClient.auth.signOut(); });
        
        const masterBahanForm = document.getElementById('master-bahan-form');
        if (masterBahanForm) masterBahanForm.addEventListener('submit', (e) => simpanBahanBaku(e, false));
        
        const masterBahanCepatForm = document.getElementById('master-bahan-cepat-form');
        if (masterBahanCepatForm) masterBahanCepatForm.addEventListener('submit', (e) => simpanBahanBaku(e, true));
        
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (masterBahanTableBody) masterBahanTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('button-delete')) { hapusBahanBaku(event.target.getAttribute('data-id')); } if (event.target.classList.contains('button-edit')) { openEditModal(event.target.getAttribute('data-id')); } });
        
        const editBahanForm = document.getElementById('edit-bahan-form');
        if (editBahanForm) editBahanForm.addEventListener('submit', simpanPerubahanBahan);
        
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => { document.getElementById('edit-modal').classList.add('hidden'); });
        
        const addResepItemBtn = document.getElementById('add-resep-item-btn');
        if (addResepItemBtn) addResepItemBtn.addEventListener('click', openPilihBahanModal);
        
        const hppForm = document.getElementById('hpp-form');
        if (hppForm) hppForm.addEventListener('submit', simpanProduk);
        
        const produkTableBody = document.getElementById('produk-table-body');
        if (produkTableBody) produkTableBody.addEventListener('click', (event) => { const target = event.target; const id = target.getAttribute('data-id'); if (target.classList.contains('button-delete')) { hapusProduk(id); } if (target.classList.contains('button-edit')) { editProduk(id); } });
        
        const resetHppBtn = document.getElementById('reset-hpp-btn');
        if (resetHppBtn) resetHppBtn.addEventListener('click', resetFormHpp);
        
        const cancelPilihBahanBtn = document.getElementById('cancel-pilih-bahan-btn');
        if (cancelPilihBahanBtn) cancelPilihBahanBtn.addEventListener('click', () => document.getElementById('pilih-bahan-modal').classList.add('hidden'));
        
        const buatBahanBaruCepatBtn = document.getElementById('buat-bahan-baru-cepat-btn');
        if (buatBahanBaruCepatBtn) buatBahanBaruCepatBtn.addEventListener('click', () => document.getElementById('tambah-bahan-cepat-modal').classList.remove('hidden'));
        
        const cancelTambahCepatBtn = document.getElementById('cancel-tambah-cepat-btn');
        if (cancelTambahCepatBtn) cancelTambahCepatBtn.addEventListener('click', () => document.getElementById('tambah-bahan-cepat-modal').classList.add('hidden'));
        
        const searchBahanInput = document.getElementById('search-bahan-input');
        if (searchBahanInput) searchBahanInput.addEventListener('input', () => tampilkanHasilPencarian(searchBahanInput.value, document.querySelector('.bahan-source-btn.active').dataset.source));
        
        const bahanSourceTabs = document.querySelector('.bahan-source-tabs');
        if (bahanSourceTabs) bahanSourceTabs.addEventListener('click', (event) => { if (event.target.classList.contains('bahan-source-btn')) { bahanSourceTabs.querySelectorAll('.bahan-source-btn').forEach(btn => btn.classList.remove('active')); event.target.classList.add('active'); tampilkanHasilPencarian(searchBahanInput.value, event.target.dataset.source); } });
        
        const bahanSearchResults = document.getElementById('bahan-search-results');
        if (bahanSearchResults) bahanSearchResults.addEventListener('click', (event) => { const targetLi = event.target.closest('li'); if (targetLi && targetLi.dataset.id) { const bahan = { id: targetLi.dataset.id, nama: targetLi.dataset.nama, source: targetLi.dataset.source, }; addBahanFromModal(bahan); document.getElementById('pilih-bahan-modal').classList.add('hidden'); } });
        
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        if (jenisProdukInput) jenisProdukInput.addEventListener('change', toggleKalkulatorMode);

        const calculationInputs = [overheadCostInput, overheadTypeInput, laborCostInput, errorCostPercentInput, targetMarginPercentInput, hargaJualAktualInput];
        calculationInputs.forEach(element => { if (element) { element.addEventListener('input', updatePerhitunganTotal); element.addEventListener('change', updatePerhitunganTotal); } });
        
        const resepTableBody = document.getElementById('resep-table-body');
        if (resepTableBody) {
            resepTableBody.addEventListener('input', (event) => { if (event.target.classList.contains('jumlah-resep')) { updatePerhitunganTotal(); } });
            resepTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('hapus-resep-item')) { event.target.closest('tr').remove(); updatePerhitunganTotal(); } });
        }
        
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.addEventListener('click', (event) => {
                if (event.target.classList.contains('nav-button')) {
                    const pages = document.querySelectorAll('.page');
                    const targetPageId = event.target.getAttribute('data-page');
                    pages.forEach(page => page.classList.remove('active'));
                    mainNav.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                    document.getElementById(targetPageId).classList.add('active');
                    event.target.classList.add('active');
                    if(targetPageId === 'page-kalkulator') resetFormHpp();
                }
            });
        }
    };
    
    // === INISIALISASI APLIKASI ===
    const initApp = async () => {
        // Pasang listener untuk form auth dulu
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) { alert('Error login: ' + error.message); }
            });
        }
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
             signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) { alert('Error mendaftar: ' + error.message); } 
                else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }

        // Cek sesi dan pasang listener perubahan state
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            setupUI(session?.user);
        });
    };

    // Jalankan aplikasi
    initApp();
});
