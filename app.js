// File: app.js (Perbaikan Final Navigasi)

document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// FUNGSI UNTUK MENGATUR TAMPILAN (UI)
// INI BAGIAN YANG KEMARIN HILANG
// =================================================================

/**
 * Mengatur tampilan UI berdasarkan status login pengguna.
 * Menyembunyikan/menampilkan kontainer aplikasi atau kontainer login.
 * @param {object | null} user - Objek user dari Supabase, atau null jika logout.
 */
function setupUI(user) {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');

    if (user) {
        // Jika user ADA (sudah login)
        console.log("User terdeteksi:", user.email, "Menampilkan aplikasi.");
        authContainer.classList.add('hidden'); // Sembunyikan form login
        appContainer.classList.remove('hidden'); // Tampilkan aplikasi utama
        userEmailDisplay.textContent = user.email; // Tampilkan email user
    } else {
        // Jika user NULL (belum login / sudah logout)
        console.log("User tidak terdeteksi, menampilkan halaman login.");
        authContainer.classList.remove('hidden'); // Tampilkan form login
        appContainer.classList.add('hidden'); // Sembunyikan aplikasi utama
        userEmailDisplay.textContent = '';
    }
}
   
    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    let isEditingProduk = false;
    let editingProdukId = null;

    // === FUNGSI-FUNGSI DEKLARASI DI ATAS AGAR DIKENAL SEMUA ===
    
    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
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
    
        
            loadBahanBaku();
            loadProduk();
            
            if (!appContainer.dataset.listenersAttached) {
                setupAppEventListeners();
                appContainer.dataset.listenersAttached = 'true';
            }
    else {
            currentUser = null;
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
        }
    });
    
    const loadBahanBaku = async (kategoriFilter = 'Semua') => {
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) return;

        let query = _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
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

    const loadProduk = async () => {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;

        const { data, error } = await supabaseClient.from('produk').select('*, resep(*)').order('created_at', { ascending: false });
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

    // === FUNGSI UNTUK MEMASANG SEMUA EVENT LISTENER APLIKASI ===
    const setupAppEventListeners = () => {
        // DOM Elements yang hanya ada setelah login
        const logoutButton = document.getElementById('logout-button');
        const mainNav = document.querySelector('.main-nav');
        const pages = document.querySelectorAll('.page');
        const masterBahanForm = document.getElementById('master-bahan-form');
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        const bahanFilterContainer = document.getElementById('bahan-filter-container');
        const hppForm = document.getElementById('hpp-form');
        const addResepItemBtn = document.getElementById('add-resep-item-btn');
        const resepTableBody = document.getElementById('resep-table-body');
        const produkTableBody = document.getElementById('produk-table-body');
        const resetHppBtn = document.getElementById('reset-hpp-btn');
        const editModal = document.getElementById('edit-modal');
        const editBahanForm = document.getElementById('edit-bahan-form');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const pilihBahanModal = document.getElementById('pilih-bahan-modal');
        const searchBahanInput = document.getElementById('search-bahan-input');
        const bahanSearchResults = document.getElementById('bahan-search-results');
        const cancelPilihBahanBtn = document.getElementById('cancel-pilih-bahan-btn');
        const bahanSourceTabs = document.querySelector('.bahan-source-tabs');
        const buatBahanBaruCepatBtn = document.getElementById('buat-bahan-baru-cepat-btn');
        const tambahBahanCepatModal = document.getElementById('tambah-bahan-cepat-modal');
        const masterBahanCepatForm = document.getElementById('master-bahan-cepat-form');
        const cancelTambahCepatBtn = document.getElementById('cancel-tambah-cepat-btn');
        const jenisProdukInput = document.getElementById('jenis-produk-input');
        const calculationInputs = [
            document.getElementById('overhead-cost'), 
            document.getElementById('overhead-type'), 
            document.getElementById('labor-cost'), 
            document.getElementById('error-cost-percent'), 
            document.getElementById('target-margin-percent'), 
            document.getElementById('harga-jual-aktual')
        ];

        // --- Event Listeners ---
        if (logoutButton) logoutButton.addEventListener('click', async () => await supabaseClient.auth.signOut());
        if (masterBahanForm) masterBahanForm.addEventListener('submit', (e) => simpanBahanBaku(e, false));
        if (masterBahanCepatForm) masterBahanCepatForm.addEventListener('submit', (e) => simpanBahanBaku(e, true));
        if (editBahanForm) editBahanForm.addEventListener('submit', simpanPerubahanBahan);
        if (hppForm) hppForm.addEventListener('submit', simpanProduk);
        if (addResepItemBtn) addResepItemBtn.addEventListener('click', openPilihBahanModal);
        if (resetHppBtn) resetHppBtn.addEventListener('click', resetFormHpp);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));
        if (cancelPilihBahanBtn) cancelPilihBahanBtn.addEventListener('click', () => pilihBahanModal.classList.add('hidden'));
        if (buatBahanBaruCepatBtn) buatBahanBaruCepatBtn.addEventListener('click', () => tambahBahanCepatModal.classList.remove('hidden'));
        if (cancelTambahCepatBtn) cancelTambahCepatBtn.addEventListener('click', () => tambahBahanCepatModal.classList.add('hidden'));
        if (searchBahanInput) searchBahanInput.addEventListener('input', () => tampilkanHasilPencarian(searchBahanInput.value, document.querySelector('.bahan-source-btn.active').dataset.source));
        if (jenisProdukInput) jenisProdukInput.addEventListener('change', toggleKalkulatorMode);

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
        
        if (masterBahanTableBody) {
            masterBahanTableBody.addEventListener('click', (event) => {
                const target = event.target.closest('button');
                if (!target) return;
                const id = target.dataset.id;
                if (target.classList.contains('button-delete')) hapusBahanBaku(id);
                if (target.classList.contains('button-edit')) openEditModal(id);
            });
        }
        
        if (produkTableBody) {
            produkTableBody.addEventListener('click', (event) => {
                const target = event.target.closest('button');
                if (!target) return;
                const id = target.dataset.id;
                if (target.classList.contains('button-delete')) hapusProduk(id);
                if (target.classList.contains('button-edit')) editProduk(id);
            });
        }
        
        if (bahanSourceTabs) {
            bahanSourceTabs.addEventListener('click', (event) => {
                if (event.target.classList.contains('bahan-source-btn')) {
                    bahanSourceTabs.querySelectorAll('.bahan-source-btn').forEach(btn => btn.classList.remove('active'));
                    event.target.classList.add('active');
                    tampilkanHasilPencarian(searchBahanInput.value, event.target.dataset.source);
                }
            });
        }
        
        if (bahanSearchResults) {
            bahanSearchResults.addEventListener('click', (event) => {
                const targetLi = event.target.closest('li');
                if (targetLi && targetLi.dataset.id) {
                    const bahan = { id: targetLi.dataset.id, nama: targetLi.dataset.nama, source: targetLi.dataset.source };
                    addBahanFromModal(bahan);
                    pilihBahanModal.classList.add('hidden');
                }
            });
        }

        calculationInputs.forEach(element => {
            if (element) {
                element.addEventListener('input', updatePerhitunganTotal);
                element.addEventListener('change', updatePerhitunganTotal);
            }
        });
        
        if (resepTableBody) {
            resepTableBody.addEventListener('input', (event) => { if (event.target.classList.contains('jumlah-resep')) updatePerhitunganTotal(); });
            resepTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('hapus-resep-item')) { event.target.closest('tr').remove(); updatePerhitunganTotal(); } });
        }
        
        // ▼▼▼ INI DIA PERBAIKAN UNTUK NAVIGASI ▼▼▼
        if (mainNav) {
            mainNav.addEventListener('click', (event) => {
                if (event.target.classList.contains('nav-button')) {
                    const targetPageId = event.target.getAttribute('data-page');
                    const targetPage = document.getElementById(targetPageId);
                    
                    if (targetPage) {
                        pages.forEach(page => page.classList.remove('active'));
                        mainNav.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                        
                        targetPage.classList.add('active');
                        event.target.classList.add('active');
                        
                        if(targetPageId === 'page-kalkulator') resetFormHpp();
                    }
                }
            });
        }
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
             signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) { alert('Error mendaftar: ' + error.message); } 
                else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            setupUI(session?.user);
        });
    };

    // Jalankan aplikasi
    initAuth();
});
