// =================================================================
// KODE MASTER v2.1 - 12 JULI 2025
// PERBAIKAN LOGIKA KRUSIAL DI FUNGSI UPDATE PRODUK
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- (BAGIAN 1, 2, 3 tidak berubah) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // ... sisa variabel dan seleksi elemen ...

    // --- BAGIAN 4: LOGIKA APLIKASI ---

    // ... (Semua fungsi lain TIDAK BERUBAH) ...

    // --- FUNGSI handleSimpanProduk DENGAN PERBAIKAN FINAL ---
    async function handleSimpanProduk(e) {
        e.preventDefault();
        // ... (logika pengumpulan data user dan resep tetap sama) ...
        
        let produkData = { /* ... objek data produk ... */ };
        
        if (isEditing && editingProdukId) {
            // === INI BAGIAN YANG DIPERBAIKI TOTAL ===
            console.log(`Mengupdate resep dengan ID: ${editingProdukId}`);
            const { error } = await _supabase
                .from('resep')
                .update(produkData)
                .eq('id', editingProdukId);
            
            if (error) {
                alert('Gagal mengupdate resep: ' + error.message);
                console.error("Error update:", error);
            } else {
                alert(`Resep "${produkData.nama_resep}" berhasil diupdate!`);
                resetKalkulator();
            }
        } else {
            // === LOGIKA INSERT BARU (TETAP SAMA & SUDAH BENAR) ===
            const { data, error } = await _supabase.from('resep').insert([produkData]).select();
            if (error) {
                alert(`Gagal menyimpan resep: ${error.message}`);
                console.error("Error insert:", error);
            } else {
                alert(`Resep "${data[0].nama_resep}" berhasil disimpan!`);
                resetKalkulator();
            }
        }
        // Muat ulang semua data setelah simpan/update
        loadDataAwal();
    }

    // --- (Fungsi-fungsi lain & event listener tidak berubah) ---
    
    // BAGIAN 6: JALANKAN APLIKASI
    initAuth();
});
