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

    // Fungsi ini akan dipanggil oleh setupUI
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

    // Fungsi utama untuk mengatur tampilan
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
