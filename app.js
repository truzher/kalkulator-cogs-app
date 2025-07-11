// =================================================================
// KODE MASTER v1.3 - 12 JULI 2025
// PERBAIKAN QUERY SELECT DI FITUR EDIT PRODUK
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1 & 2 (Tidak ada perubahan) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    // ... (sisa deklarasi & seleksi elemen)

    // --- BAGIAN 3 (Tidak ada perubahan) ---
    function setupUI(user) { /* ... */ }
    function initAuth() { /* ... */ }

    // --- BAGIAN 4: LOGIKA APLIKASI (DENGAN PERUBAHAN) ---
    async function loadDataAwal() { /* ... */ }
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... */ }
    async function loadProdukSetengahJadi() { /* ... */ }
    async function loadProdukJadi() { /* ... */ }
    function populateEditForm(id) { /* ... */ }
    async function handleHapusBahan(id) { /* ... */ }
    async function handleHapusProduk(id, namaProduk) { /* ... */ }
    
    // --- FUNGSI YANG DIPERBAIKI ---
    async function loadProdukToKalkulator(produkId) {
        console.log(`Memuat produk dengan ID: ${produkId} ke kalkulator...`);
        // Untuk sementara, kita asumsikan hanya edit dari produk_jadi
        const targetTable = 'produk_jadi';
        
        // PERBAIKAN DI SINI: ganti .select('*, resep(*)') menjadi .select('*')
        const { data: produk, error } = await _supabase.from(targetTable).select('*').eq('id', produkId).single();

        if (error || !produk) {
            alert('Gagal mengambil detail produk!');
            console.error(error);
            return;
        }
        
        // ... sisa fungsi ini tidak berubah ...
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.nav-button[data-page="page-kalkulator"]').classList.add('active');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('page-kalkulator').classList.add('active');

        document.getElementById('jenis-produk-input').disabled = true;
        document.getElementById('jenis-produk-input').value = 'Produk Jadi';
        document.getElementById('produk-nama').value = produk.nama_produk;
        document.getElementById('produk-kategori').value = produk.kategori_produk;
        document.getElementById('harga-jual-aktual').value = produk.saran_harga_jual;
        
        const hasilJadiContainer = document.getElementById('hasil-jadi-container');
        hasilJadiContainer.classList.add('hidden');

        const resepTableBody = document.getElementById('resep-table-body');
        resepTableBody.innerHTML = '';
        if(produk.resep) {
            produk.resep.forEach(item => {
                const hargaSatuan = (item.biaya && item.jumlah > 0) ? item.biaya / item.jumlah : 0;
                const bahanInfo = { nama: item.nama_bahan, bahanId: item.bahan_id, harga: hargaSatuan, source: item.source || 'bahan_baku' };
                tambahBahanKeResep(bahanInfo, item.jumlah);
            });
        }
        isEditing = true;
        editingProdukId = produkId;
        document.querySelector('#hpp-form button[type="submit"]').textContent = 'Update Produk';
        kalkulasiFinal();
    }

    // --- (Fungsi-fungsi lain tidak berubah) ---
    function renderPilihBahanList(list, sourceType) { /* ... */ }
    function tambahBahanKeResep(bahanInfo, jumlah) { /* ... */ }
    function openPilihBahanModal() { /* ... */ }
    function kalkulasiFinal() { /* ... */ }
    async function handleSimpanProduk(e) { /* ... */ }
    function resetKalkulator() { /* ... */ }
    
    // --- BAGIAN 5 & 6 (Tidak ada perubahan) ---
    function setupAppEventListeners() { /* ... */ }
    initAuth();
});
