document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    // ... (tidak berubah) ...

    // === VARIABEL GLOBAL ===
    // ... (tidak berubah) ...

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
        // ... (logika simpan bahan baku) ...
        const kategori = document.getElementById(`bahan-kategori${formPrefix}`).value;
        const { data, error } = await supabaseClient.from('bahan_baku').insert([{ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan, user_id: currentUser.id }]).select();
        // ...
    };
    
    const openEditModal = async (id) => {
        // ... (logika buka modal edit bahan baku) ...
        document.getElementById('edit-bahan-kategori').value = data.kategori || 'Bahan Umum';
        // ...
    };

    const simpanPerubahanBahan = async (event) => {
        // ... (logika simpan perubahan bahan baku) ...
        const kategori = document.getElementById('edit-bahan-kategori').value;
        const { error } = await supabaseClient.from('bahan_baku').update({ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan }).eq('id', id);
        // ...
    };

    const loadProduk = async () => {
        const { data, error } = await supabaseClient.from('produk').select('*').order('created_at', { ascending: false });
        if (error) { console.error('Error mengambil data produk:', error); return; }
        
        // Simpan semua produk ke list masing-masing
        produkJadiList = data.filter(p => p.jenis_produk === 'Produk Jadi');
        produkSetengahJadiList = data.filter(p => p.jenis_produk === 'Produk Setengah Jadi');

        // Tampilkan SEMUA produk di tabel, dengan penanda
        produkTableBody.innerHTML = '';
        data.forEach(produk => {
            const row = document.createElement('tr');
            const tagBiang = produk.jenis_produk === 'Produk Setengah Jadi' ? '<small class="chip">Biang</small>' : '';
            row.innerHTML = `
                <td>${produk.nama_produk} ${tagBiang}</td>
                <td>${produk.kategori || '-'}</td>
                <td>${formatRupiah(produk.harga_jual_aktual)}</td>
                <td>
                    <button class="button-edit" data-id="${produk.id}">Edit</button>
                    <button class="button-delete" data-id="${produk.id}">Hapus</button>
                </td>
            `;
            produkTableBody.appendChild(row);
        });
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
    
    // ... (sisa kode) ...
});
