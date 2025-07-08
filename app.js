document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let isEditingProduk = false;
    let editingProdukId = null;

    // === DOM ELEMENTS ===
    // ... (semua DOM element lama) ...
    const overheadTypeInput = document.getElementById('overhead-type'); // Input baru

    // === FUNGSI UTAMA & FUNGSI LAINNYA (Tidak Berubah) ===
    const updateUI = (user) => { /* ... */ };
    const formatRupiah = (angka) => { /* ... */ };
    const loadBahanBaku = async () => { /* ... */ };
    const simpanBahanBaku = async (event) => { /* ... */ };
    const hapusBahanBaku = async (id) => { /* ... */ };
    const openEditModal = async (id) => { /* ... */ };
    const simpanPerubahanBahan = async (event) => { /* ... */ };
    const loadProduk = async () => { /* ... */ };
    const hapusProduk = async (id) => { /* ... */ };
    const resetFormHpp = () => { /* ... */ };
    
    // --- FUNGSI KALKULATOR HPP ---
    const tambahBahanKeResep = (bahanId = '', jumlah = '') => {
        const row = document.createElement('tr');
        let options = '<option value="">-- Pilih Bahan --</option>';
        masterBahanList.forEach(bahan => {
            const isSelected = bahan.id === bahanId ? 'selected' : '';
            options += `<option value="${bahan.id}">${bahan.nama}</option>`;
        });
        // PERBAIKAN: value="" dihapus dan diganti placeholder
        row.innerHTML = `
            <td><select class="bahan-resep-dropdown">${options}</select></td>
            <td><input type="number" class="jumlah-resep" placeholder="0" value="${jumlah}" min="0"></td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
    };

    // FUNGSI PERHITUNGAN YANG DI-UPGRADE
    const updatePerhitunganTotal = () => {
        let totalBiayaBahan = 0;
        resepTableBody.querySelectorAll('tr').forEach(row => {
            // ... (logika hitung biaya bahan tidak berubah) ...
        });

        // ▼▼▼ LOGIKA BARU UNTUK OVERHEAD ▼▼▼
        const overheadValue = parseFloat(overheadCostInput.value) || 0;
        const overheadType = overheadTypeInput.value;
        let overheadCost = 0;
        if (overheadType === 'persen') {
            overheadCost = totalBiayaBahan * (overheadValue / 100);
        } else {
            overheadCost = overheadValue;
        }
        // ▲▲▲ AKHIR LOGIKA BARU ▲▲▲

        const labor = parseFloat(laborCostInput.value) || 0;
        const biayaProduksi = totalBiayaBahan + overheadCost + labor;
        const errorPercent = parseFloat(errorCostPercentInput.value) || 0;
        const errorCost = biayaProduksi * (errorPercent / 100);
        const totalCogs = biayaProduksi + errorCost;
        totalCogsDisplay.textContent = formatRupiah(totalCogs);
        
        // ... (sisa logika perhitungan harga jual & profit tidak berubah) ...
    };

    // FUNGSI SIMPAN PRODUK YANG DI-UPGRADE
    const simpanProduk = async (event) => {
        event.preventDefault();
        // ... (validasi tidak berubah) ...

        const produkData = {
            nama_produk: produkNamaInput.value,
            resep: resepItems,
            kategori: produkKategoriInput.value,
            overhead_cost: parseFloat(overheadCostInput.value) || 0,
            overhead_cost_type: overheadTypeInput.value, // Simpan tipe overhead
            labor_cost: parseFloat(laborCostInput.value) || 0,
            error_cost_percent: parseFloat(errorCostPercentInput.value) || 0,
            target_margin_percent: parseFloat(targetMarginPercentInput.value) || 0,
            harga_jual_aktual: parseFloat(hargaJualAktualInput.value) || 0,
            user_id: currentUser.id
        };

        // ... (logika insert/update tidak berubah) ...
    };

    // FUNGSI EDIT PRODUK YANG DI-UPGRADE
    const editProduk = async (id) => {
        const { data: produk, error } = await supabaseClient.from('produk').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data produk:', error); return; }
        
        // ... (logika mengisi input lain tidak berubah) ...
        overheadCostInput.value = produk.overhead_cost || 0;
        overheadTypeInput.value = produk.overhead_cost_type || 'nominal'; // Load tipe overhead
        
        // ... (sisa logika edit tidak berubah) ...
    };

    // === EVENT LISTENERS (DENGAN PENAMBAHAN) ===
    const setupEventListeners = () => {
        // ... (semua event listener lama) ...
        
        // Tambahkan listener untuk dropdown tipe overhead
        const calculationInputs = [overheadCostInput, overheadTypeInput, laborCostInput, errorCostPercentInput, targetMarginPercentInput, hargaJualAktualInput];
        calculationInputs.forEach(element => {
            if (element) {
                element.addEventListener('input', updatePerhitunganTotal);
                element.addEventListener('change', updatePerhitunganTotal); // 'change' untuk dropdown
            }
        });

        // ... (sisa event listener) ...
    };
    
    // === INISIALISASI APLIKASI ===
    const initApp = async () => { /* ... tidak berubah ... */ };
    initApp();
});
```
*(Catatan: Cici hanya menampilkan bagian yang berubah di `app.js`. Loe bisa minta versi lengkapnya jika perlu).*

Setelah loe update database, `index.html`, dan `app.js` ini, aplikasi kita akan jadi jauh lebih fleksibel dan nyaman digunakan. Coba tes ya, Ha
