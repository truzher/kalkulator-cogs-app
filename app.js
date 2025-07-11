// =================================================================
// KODE FINAL - DENGAN PERBAIKAN LOGIKA UPDATE PRODUK
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    let isEditing = false;
    let editingProdukId = null;

    // --- (BAGIAN 2 & 3 tidak berubah) ---
    // ...

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    
    // ... (Fungsi-fungsi lain tidak berubah)
    
    // --- FUNGSI handleSimpanProduk DENGAN LOGIKA UPDATE YANG DIPERBAIKI ---
    async function handleSimpanProduk(e) {
        e.preventDefault();
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) {
            alert("Sesi tidak valid, silakan login ulang.");
            return;
        }

        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) { alert('Resep tidak boleh kosong!'); return; }
        const resepData = Array.from(resepRows).map(row => ({
            bahan_id: row.dataset.bahanId, nama_bahan: row.cells[0].textContent, jumlah: row.querySelector('.resep-jumlah').value,
            biaya: parseFloat(row.querySelector('.resep-biaya').textContent.replace(/[^0-9,-]+/g, "").replace(",", "."))
        }));

        let produkData = {
            user_id: user.id,
            nama_produk: document.getElementById('produk-nama').value,
            kategori_produk: document.getElementById('produk-kategori').value,
            resep: resepData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            saran_harga_jual: parseFloat(document.getElementById('saran-harga-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit: parseFloat(document.getElementById('profit-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit_persen: parseFloat(document.getElementById('profit-percent-display').textContent.replace('%', ''))
        };
        if (!produkData.nama_produk) { alert('Nama produk harus diisi!'); return; }

        const tipeProduk = document.getElementById('jenis-produk-input').value;
        const targetTable = (tipeProduk === 'Produk Jadi') ? 'produk_jadi' : 'produk_setengah_jadi';
        if (tipeProduk === 'Produk Setengah Jadi') {
            produkData.hasil_jadi_jumlah = parseFloat(document.getElementById('hasil-jadi-jumlah').value) || null;
            produkData.hasil_jadi_satuan = document.getElementById('hasil-jadi-satuan').value || null;
        }

        if (isEditing && editingProdukId) {
            console.log(`Mengupdate produk dengan ID: ${editingProdukId}`);
            const { error } = await _supabase.from(targetTable).update(produkData).eq('id', editingProdukId);
            
            if (error) {
                alert('Gagal mengupdate produk: ' + error.message);
            } else {
                // AMBIL NAMA PRODUK DARI DATA YANG KITA KIRIM, BUKAN DARI DATA BALIKAN
                alert(`Produk "${produkData.nama_produk}" berhasil diupdate!`);
                resetKalkulator();
                loadProdukJadi(); 
                loadProdukSetengahJadi();
            }
        } else {
            console.log(`Menyimpan produk baru ke tabel: ${targetTable}`);
            const { data, error } = await _supabase.from(targetTable).insert([produkData]).select();
            if (error) {
                alert(`Gagal menyimpan produk: ${error.message}`);
            } else {
                alert(`Produk "${data[0].nama_produk}" berhasil disimpan!`);
                resetKalkulator();
                loadProdukJadi(); 
                loadProdukSetengahJadi();
            }
        }
    }
    
    // ... (sisa fungsi lainnya & event listener tidak berubah)

    // --- BAGIAN 6: JALANKAN APLIKASI ---
    initAuth();
});
