// =================================================================
// KODE FINAL - FITUR EDIT PRODUK DARI DAFTAR DIAKTIFKAN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    let isEditing = false; // Penanda mode edit
    let editingProdukId = null; // Menyimpan ID produk yang sedang diedit

    // --- (BAGIAN 2 & 3 tidak berubah) ---

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    
    // ... (fungsi-fungsi lama tidak berubah, kecuali yang Cici sebutkan di bawah)

    // --- FUNGSI BARU UNTUK MEMUAT PRODUK KE KALKULATOR ---
    async function loadProdukToKalkulator(produkId) {
        console.log(`Memuat produk dengan ID: ${produkId} ke kalkulator...`);
        
        // Cari data produk di antara produk jadi atau setengah jadi
        let produk;
        let targetTable = 'produk_jadi';
        // Untuk sementara, kita asumsikan hanya edit produk jadi.
        // Nanti kita bisa perluas untuk edit produk setengah jadi.
        
        const { data, error } = await _supabase.from(targetTable).select('*').eq('id', produkId).single();

        if (error || !data) {
            alert('Gagal mengambil detail produk!');
            console.error(error);
            return;
        }
        
        produk = data;

        // Pindah ke halaman kalkulator
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.nav-button[data-page="page-kalkulator"]').classList.add('active');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('page-kalkulator').classList.add('active');

        // Isi form dengan data produk
        document.getElementById('produk-nama').value = produk.nama_produk;
        document.getElementById('produk-kategori').value = produk.kategori_produk;
        document.getElementById('harga-jual-aktual').value = produk.saran_harga_jual; // Kita pakai saran harga jual sebagai default

        // Hapus resep lama & render resep dari produk yang dipilih
        const resepTableBody = document.getElementById('resep-table-body');
        resepTableBody.innerHTML = '';
        produk.resep.forEach(item => {
            const bahanInfo = {
                nama: item.nama_bahan,
                bahanId: item.bahan_id,
                harga: item.biaya / item.jumlah, // Hitung kembali harga satuan
                source: item.source || 'bahan_baku' // Asumsi default
            };
            tambahBahanKeResep(bahanInfo, item.jumlah);
        });

        // Set status ke mode edit
        isEditing = true;
        editingProdukId = produkId;

        // Ubah teks tombol simpan
        document.querySelector('#hpp-form button[type="submit"]').textContent = 'Update Produk';

        // Hitung ulang semua angka
        kalkulasiFinal();
    }
    
    // --- UBAH FUNGSI SIMPAN PRODUK AGAR BISA UPDATE ---
    async function handleSimpanProduk(e) {
        e.preventDefault();
        
        // ... (logika pengumpulan data produk tetap sama) ...
        let produkData = { /* ... */ };

        if (isEditing && editingProdukId) {
            // === LOGIKA UPDATE ===
            console.log(`Mengupdate produk dengan ID: ${editingProdukId}`);
            const { error } = await _supabase.from('produk_jadi').update(produkData).eq('id', editingProdukId);
            if (error) {
                alert('Gagal mengupdate produk: ' + error.message);
            } else {
                alert('Produk berhasil diupdate!');
                resetKalkulator();
            }
        } else {
            // === LOGIKA INSERT (YANG LAMA) ===
            // ... (logika insert yang sudah ada sebelumnya) ...
        }
    }

    // --- FUNGSI BARU UNTUK MERESET KALKULATOR ---
    function resetKalkulator() {
        if(hppForm) hppForm.reset();
        document.getElementById('resep-table-body').innerHTML = '';
        isEditing = false;
        editingProdukId = null;
        document.querySelector('#hpp-form button[type="submit"]').textContent = 'Simpan Produk';
        kalkulasiFinal();
    }

    // --- BAGIAN 5: PEMASANGAN EVENT LISTENER ---
    function setupAppEventListeners() {
        // ... (semua listener lama) ...

        // --- UBAH LISTENER UNTUK TABEL DAFTAR PRODUK ---
        const produkTableBody = document.getElementById('produk-table-body');
        if (produkTableBody) {
            produkTableBody.addEventListener('click', (e) => {
                const targetRow = e.target.closest('tr');
                if (!targetRow) return;
                const produkId = targetRow.dataset.id;
                const namaProduk = targetRow.dataset.nama;

                if (e.target.classList.contains('button-edit')) {
                    loadProdukToKalkulator(produkId); // <-- PANGGIL FUNGSI EDIT
                }
                if (e.target.classList.contains('button-delete')) {
                    // handleHapusProduk(produkId, namaProduk); // <-- Fungsi hapus produk akan kita buat setelah ini
                    alert("Fitur Hapus Produk akan segera dibuat!");
                }
            });
        }
        
        // --- LISTENER BARU UNTUK TOMBOL RESET ---
        const resetHppBtn = document.getElementById('reset-hpp-btn');
        if(resetHppBtn) {
            resetHppBtn.addEventListener('click', resetKalkulator);
        }
    }

    // ... (BAGIAN 6 tidak berubah) ...
});
