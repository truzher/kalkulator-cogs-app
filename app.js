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

    // === DOM ELEMENTS ===
    // ... (semua elemen DOM lama) ...
    const bahanKategoriInput = document.getElementById('bahan-kategori');
    const bahanFilterContainer = document.getElementById('bahan-filter-container');

    // === FUNGSI-FUNGSI APLIKASI ===

    const loadBahanBaku = async (kategoriFilter = 'Semua') => {
        let query = supabaseClient.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') {
            query = query.eq('kategori', kategoriFilter);
        }
        const { data, error } = await query;

        if (error) { console.error('Error mengambil data bahan baku:', error); return; }
        
        if (kategoriFilter === 'Semua') {
            masterBahanList = data; // Hanya update list utama jika filter 'Semua'
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
        // ... (logika simpan bahan baku) ...
        const kategori = document.getElementById(`bahan-kategori${formPrefix}`).value;
        const { data, error } = await supabaseClient.from('bahan_baku').insert([{ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan, user_id: currentUser.id }]).select();
        // ...
    };
    
    const loadProduk = async () => {
        // ... (logika load produk) ...
        // Pisahkan produk jadi dan setengah jadi
        produkSetengahJadiList = data.filter(p => p.jenis_produk === 'Produk Setengah Jadi');
        // ...
    };
    
    // ... (semua fungsi lain yang sudah lengkap dari jawaban sebelumnya) ...

    // === EVENT LISTENERS ===
    const setupEventListeners = () => {
        // ... (semua event listener lama) ...

        // Listener baru untuk filter kategori bahan baku
        if (bahanFilterContainer) {
            bahanFilterContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-btn')) {
                    const kategori = event.target.dataset.kategori;
                    bahanFilterContainer.querySelector('.active').classList.remove('active');
                    event.target.classList.add('active');
                    loadBahanBaku(kategori);
                }
            });
        }
    };
    
    // === INISIALISASI APLIKASI ===
    const initApp = async () => {
        setupEventListeners();
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUI(session?.user);
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateUI(session?.user);
        });
    };

    initApp();
});
