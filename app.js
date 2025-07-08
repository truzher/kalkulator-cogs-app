document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    // ... (tidak berubah) ...

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let produkSetengahJadiList = []; // BARU: untuk menyimpan produk biang

    // === DOM ELEMENTS ===
    // ... (semua elemen lama) ...
    const jenisProdukInput = document.getElementById('jenis-produk-input');
    const pilihBahanModal = document.getElementById('pilih-bahan-modal');
    const searchBahanInput = document.getElementById('search-bahan-input');
    const bahanSearchResults = document.getElementById('bahan-search-results');
    const cancelPilihBahanBtn = document.getElementById('cancel-pilih-bahan-btn');
    const buatBahanBaruCepatBtn = document.getElementById('buat-bahan-baru-cepat-btn');
    const tambahBahanCepatModal = document.getElementById('tambah-bahan-cepat-modal');
    const masterBahanCepatForm = document.getElementById('master-bahan-cepat-form');
    const cancelTambahCepatBtn = document.getElementById('cancel-tambah-cepat-btn');

    // === FUNGSI-FUNGSI APLIKASI ===

    // ... (fungsi-fungsi lama seperti loadBahanBaku, simpanBahanBaku, dll) ...

    // FUNGSI BARU: Memuat daftar produk dan memisahkannya
    const loadProduk = async () => {
        const { data, error } = await supabaseClient.from('produk').select('*').order('created_at', { ascending: false });
        if (error) { console.error('Error mengambil data produk:', error); return; }

        // Pisahkan antara produk jadi dan setengah jadi
        const produkJadi = data.filter(p => p.jenis_produk === 'Produk Jadi');
        produkSetengahJadiList = data.filter(p => p.jenis_produk === 'Produk Setengah Jadi');

        // Tampilkan produk jadi di tabelnya
        produkTableBody.innerHTML = '';
        produkJadi.forEach(produk => {
            // ... (logika menampilkan produk jadi) ...
        });
    };
    
    // FUNGSI BARU: Membuka modal pencarian bahan
    const openPilihBahanModal = () => {
        tampilkanHasilPencarian(); // Tampilkan semua bahan mentah by default
        pilihBahanModal.classList.remove('hidden');
        searchBahanInput.focus();
    };

    // FUNGSI BARU: Menampilkan hasil pencarian di modal
    const tampilkanHasilPencarian = (query = '') => {
        bahanSearchResults.innerHTML = '';
        const source = document.querySelector('.bahan-source-btn.active').dataset.source;
        const listToSearch = source === 'bahan_baku' ? masterBahanList : produkSetengahJadiList;

        const filteredList = listToSearch.filter(item => 
            item.nama.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredList.length === 0) {
            bahanSearchResults.innerHTML = '<li>Bahan tidak ditemukan.</li>';
            return;
        }

        filteredList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.nama;
            li.dataset.id = item.id;
            li.dataset.source = source; // Tandai sumbernya
            bahanSearchResults.appendChild(li);
        });
    };

    // === EVENT LISTENERS ===
    
    // Listener untuk tombol "+ Tambah Bahan" yang sekarang membuka modal
    if (addResepItemBtn) {
        addResepItemBtn.addEventListener('click', openPilihBahanModal);
    }

    // Listener untuk input pencarian di modal
    if (searchBahanInput) {
        searchBahanInput.addEventListener('input', () => {
            tampilkanHasilPencarian(searchBahanInput.value);
        });
    }

    // Listener untuk memilih bahan dari hasil pencarian
    if (bahanSearchResults) {
        bahanSearchResults.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI' && event.target.dataset.id) {
                const bahanId = event.target.dataset.id;
                const source = event.target.dataset.source;
                tambahBahanKeResep(bahanId, '', source); // Tambahkan source
                pilihBahanModal.classList.add('hidden');
            }
        });
    }
    
    // ... (tambahkan semua event listener lain yang relevan) ...

    // === INISIALISASI APLIKASI ===
    // ... (tidak berubah) ...
});
