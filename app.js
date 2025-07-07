// File: app.js (VERSI DENGAN LOGIKA PERHITUNGAN LENGKAP)

document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];

    // === DOM ELEMENTS ===
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const logoutButton = document.getElementById('logout-button');
    const userEmailDisplay = document.getElementById('user-email-display');
    
    // Master Bahan Elements
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    
    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // HPP Form Elements
    const hppForm = document.getElementById('hpp-form');
    const addResepItemBtn = document.getElementById('add-resep-item-btn');
    const resepTableBody = document.getElementById('resep-table-body');
    
    // Input Biaya & Margin
    const overheadCostInput = document.getElementById('overhead-cost');
    const laborCostInput = document.getElementById('labor-cost');
    const errorCostPercentInput = document.getElementById('error-cost-percent');
    const targetMarginPercentInput = document.getElementById('target-margin-percent');
    const hargaJualAktualInput = document.getElementById('harga-jual-aktual');

    // Display Hasil
    const totalCogsDisplay = document.getElementById('total-cogs-display');
    const saranHargaDisplay = document.getElementById('saran-harga-display');
    const profitDisplay = document.getElementById('profit-display');
    const profitPercentDisplay = document.getElementById('profit-percent-display');
    
    // Daftar Produk Elements
    const produkTableBody = document.getElementById('produk-table-body');

    // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN ===
    const updateUI = (user) => {
        if (user) {
            currentUser = user;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
            loadBahanBaku();
            loadProduk();
        } else {
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    };

    // === FUNGSI-FUNGSI APLIKASI ===

    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
    };

    const loadBahanBaku = async () => { /* ... kode tidak berubah ... */ };
    const simpanBahanBaku = async (event) => { /* ... kode tidak berubah ... */ };
    const hapusBahanBaku = async (id) => { /* ... kode tidak berubah ... */ };
    const openEditModal = async (id) => { /* ... kode tidak berubah ... */ };
    const simpanPerubahanBahan = async (event) => { /* ... kode tidak berubah ... */ };
    const loadProduk = async () => { /* ... kode tidak berubah ... */ };
    
    // --- FUNGSI KALKULATOR HPP (YANG DI-UPGRADE) ---
    const tambahBahanKeResep = () => {
        const row = document.createElement('tr');
        let options = '<option value="">-- Pilih Bahan --</option>';
        masterBahanList.forEach(bahan => {
            options += `<option value="${bahan.id}">${bahan.nama} (${bahan.satuan_kemasan})</option>`;
        });
        row.innerHTML = `
            <td><select class="bahan-resep-dropdown">${options}</select></td>
            <td><input type="number" class="jumlah-resep" placeholder="0" min="0"></td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
    };

    // FUNGSI BARU: Otak utama kalkulator
    const updatePerhitunganTotal = () => {
        let totalBiayaBahan = 0;
        resepTableBody.querySelectorAll('tr').forEach(row => {
            const dropdown = row.querySelector('.bahan-resep-dropdown');
            const jumlahInput = row.querySelector('.jumlah-resep');
            const biayaDisplay = row.querySelector('.biaya-resep-display');
            const bahanId = dropdown.value;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const bahanTerpilih = masterBahanList.find(b => b.id === bahanId);

            if (bahanTerpilih && bahanTerpilih.isi_kemasan > 0) {
                const hargaPerSatuan = bahanTerpilih.harga_beli_kemasan / bahanTerpilih.isi_kemasan;
                const biayaBahan = jumlah * hargaPerSatuan;
                biayaDisplay.textContent = formatRupiah(biayaBahan);
                totalBiayaBahan += biayaBahan;
            } else {
                biayaDisplay.textContent = 'Rp 0,00';
            }
        });

        // Ambil nilai dari input biaya tambahan
        const overhead = parseFloat(overheadCostInput.value) || 0;
        const labor = parseFloat(laborCostInput.value) || 0;
        
        // Hitung error cost
        const biayaProduksi = totalBiayaBahan + overhead + labor;
        const errorPercent = parseFloat(errorCostPercentInput.value) || 0;
        const errorCost = biayaProduksi * (errorPercent / 100);
        
        // Hitung Total COGS
        const totalCogs = biayaProduksi + errorCost;
        totalCogsDisplay.textContent = formatRupiah(totalCogs);

        // Hitung Saran Harga Jual
        const marginPercent = parseFloat(targetMarginPercentInput.value) || 0;
        let saranHarga = 0;
        if (marginPercent < 100) {
            saranHarga = totalCogs / (1 - (marginPercent / 100));
        }
        saranHargaDisplay.textContent = formatRupiah(saranHarga);
        
        // Isi otomatis harga jual aktual jika masih kosong
        if (hargaJualAktualInput.value === '' || hargaJualAktualInput.value === '0') {
            hargaJualAktualInput.value = Math.ceil(saranHarga / 100) * 100; // Pembulatan ke atas
        }
        
        // Hitung Profit berdasarkan harga jual aktual
        const hargaJualAktual = parseFloat(hargaJualAktualInput.value) || 0;
        const profit = hargaJualAktual - totalCogs;
        const profitPercent = hargaJualAktual > 0 ? (profit / hargaJualAktual) * 100 : 0;
        
        profitDisplay.textContent = formatRupiah(profit);
        profitPercentDisplay.textContent = profitPercent.toFixed(2);
    };

    const simpanProduk = async (event) => { /* ... akan di-update di langkah selanjutnya ... */ };


    // === EVENT LISTENERS ===
    if (signupForm) { /* ... */ }
    if (loginForm) { /* ... */ }
    if (logoutButton) { /* ... */ }
    if (masterBahanForm) { /* ... */ }
    if (masterBahanTableBody) { /* ... */ }
    if (editBahanForm) { /* ... */ }
    if (cancelEditBtn) { /* ... */ }
    if (addResepItemBtn) { addResepItemBtn.addEventListener('click', tambahBahanKeResep); }
    
    // Event listener untuk semua input yang mempengaruhi perhitungan
    const calculationInputs = [resepTableBody, overheadCostInput, laborCostInput, errorCostPercentInput, targetMarginPercentInput, hargaJualAktualInput];
    calculationInputs.forEach(element => {
        if(element) {
            element.addEventListener('input', updatePerhitunganTotal);
            element.addEventListener('change', updatePerhitunganTotal); // Untuk dropdown
        }
    });

    if (resepTableBody) {
        resepTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('hapus-resep-item')) {
                event.target.closest('tr').remove();
                updatePerhitunganTotal();
            }
        });
    }

    if (hppForm) { hppForm.addEventListener('submit', simpanProduk); }

    // === INISIALISASI APLIKASI ===
    const initApp = async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUI(session?.user);
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateUI(session?.user);
        });
    };

    initApp();
    
    // --- Salin semua fungsi yang tidak berubah dari file lama loe ke sini ---
    /* ... (simpanBahanBaku, hapusBahanBaku, dll.) ... */
});
