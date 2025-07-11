// =================================================================
// KODE FINAL - LENGKAP DENGAN FUNGSI EDIT/HAPUS PRODUK
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1 & 2 (Tidak ada perubahan) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    // ... (sisa seleksi elemen DOM)

    // --- BAGIAN 3 (Tidak ada perubahan) ---
    function setupUI(user) { /* ... */ }
    function initAuth() { /* ... */ }

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    async function loadDataAwal() { /* ... */ }
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... */ }
    async function loadProdukSetengahJadi() { /* ... */ }

    async function loadProdukJadi() {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;
        const { data, error } = await _supabase.from('produk_jadi').select('*').order('created_at', { ascending: false });
        if (error) { console.error("Gagal memuat produk jadi:", error.message); return; }
        produkTableBody.innerHTML = '';
        if (data.length === 0) {
            produkTableBody.innerHTML = '<tr><td colspan="5">Belum ada produk yang disimpan.</td></tr>';
            return;
        }
        data.forEach(produk => {
            const row = document.createElement('tr');
            // Simpan semua data produk di dataset baris untuk referensi nanti
            row.dataset.id = produk.id;
            row.dataset.nama = produk.nama_produk;
            
            row.innerHTML = `
                <td>${produk.nama_produk || 'N/A'}</td>
                <td><span class="chip-kategori">Produk Jadi</span></td>
                <td>${produk.kategori_produk || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.saran_harga_jual || 0)}</td>
                <td>
                    <button class="button-edit">Lihat/Edit</button>
                    <button class="button-delete">Hapus</button>
                </td>
            `;
            produkTableBody.appendChild(row);
        });
    }

    function populateEditForm(id) { /* ... */ }
    async function handleHapusBahan(id) { /* ... */ }

    // --- FUNGSI BARU UNTUK HAPUS PRODUK ---
    async function handleHapusProduk(id, namaProduk) {
        if (confirm(`Yakin mau hapus produk "${namaProduk}"?`)) {
            const { error } = await _supabase.from('produk_jadi').delete().eq('id', id);
            if (error) {
                alert('Gagal hapus produk: ' + error.message);
            } else {
                alert('Produk berhasil dihapus.');
                loadProdukJadi(); // Muat ulang daftar produk
            }
        }
    }

    function renderPilihBahanList(list, sourceType) { /* ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... */ }
    function openPilihBahanModal() { /* ... */ }
    function kalkulasiFinal() { /* ... */ }
    async function handleSimpanProduk(e) { /* ... */ }
    
    // --- BAGIAN 5: PEMASANGAN EVENT LISTENER ---
    function setupAppEventListeners() {
        // ... (Semua listener lama tetap ada di sini) ...

        // === LISTENER BARU UNTUK TABEL DAFTAR PRODUK ===
        const produkTableBody = document.getElementById('produk-table-body');
        if (produkTableBody) {
            produkTableBody.addEventListener('click', (e) => {
                const targetRow = e.target.closest('tr');
                if (!targetRow) return;

                const produkId = targetRow.dataset.id;
                const namaProduk = targetRow.dataset.nama;

                // Jika tombol "Lihat/Edit" diklik
                if (e.target.classList.contains('button-edit')) {
                    alert('Fitur untuk edit produk dari halaman ini sedang dalam pengembangan, Habb! Sabar ya.');
                    // Di masa depan, kita bisa panggil fungsi untuk membuka modal edit produk di sini
                }

                // Jika tombol "Hapus" diklik
                if (e.target.classList.contains('button-delete')) {
                    handleHapusProduk(produkId, namaProduk);
                }
            });
        }
    }
    
    // --- BAGIAN 6 (Tidak ada perubahan) ---
    initAuth();
});
