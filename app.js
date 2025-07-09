// File: app.js (VERSI FINAL DENGAN PERBAIKAN URUTAN FUNGSI)

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

    // === DEKLARASI SEMUA FUNGSI DI SINI (DITARUH DI ATAS) ===
    
    // Fungsi untuk memformat angka menjadi Rupiah
    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
    };

    // Fungsi untuk menghitung HPP sebuah produk (bisa rekursif)
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

    // Fungsi untuk menampilkan daftar bahan di modal pencarian
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
            li.innerHTML = `<div><span>${itemName}</span>${tagBiang}</div><small>${formatRupiah(hargaPerSatuanDasar)} / ${itemSatuan || 'unit'}</small>`;
            bahanSearchResults.appendChild(li);
        });
    };

    // Fungsi untuk menampilkan atau menyembunyikan form berdasarkan tipe produk
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
    
    // Fungsi untuk menghitung ulang semua nilai di kalkulator
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

    // Fungsi untuk mereset form HPP
    const resetFormHpp = () => {
        isEditingProduk = false;
        editingProdukId = null;
        document.getElementById('hpp-form').reset();
        document.getElementById('resep-table-body').innerHTML = '';
        toggleKalkulatorMode();
        updatePerhitunganTotal();
    };
    
    // Fungsi untuk memuat data produk
    const loadProduk = async () => {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;

        // PERBAIKAN: Ganti select query agar tidak error
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

    // Fungsi untuk memuat bahan baku
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

    // Fungsi utama untuk mengatur tampilan berdasarkan status login
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

    // Fungsi untuk memasang semua event listener APLIKASI (setelah login)
    const setupAppEventListeners = () => {
        // Taruh SEMUA getElementById dan addEventListener untuk aplikasi di sini
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', async () => await supabaseClient.auth.signOut());

        const masterBahanForm = document.getElementById('master-bahan-form');
        if (masterBahanForm) masterBahanForm.addEventListener('submit', (e) => simpanBahanBaku(e, false));
        
        const bahanFilterContainer = document.getElementById('bahan-filter-container');
        if (bahanFilterContainer) {
            bahanFilterContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-btn')) {
                    const kategori = event.target.dataset.kategori;
                    document.querySelector('#bahan-filter-container .active').classList.remove('active');
                    event.target.classList.add('active');
                    loadBahanBaku(kategori);
                }
            });
        }
        
        // ... (dan seterusnya untuk semua event listener lainnya)
    };


    // === INISIALISASI & AUTHENTIKASI AWAL ===
    const initAuth = () => {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) alert('Error login: ' + error.message);
            });
        }

        if (signupForm) {
             signupForm.addEventListener('submit
