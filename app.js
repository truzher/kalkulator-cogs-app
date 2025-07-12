// =================================================================
// KODE MASTER v3.7 - 13 JULI 2025
// PERBAIKAN LISTENER UNTUK TOMBOL DAFTAR BELANJA
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1 & 2 (Tidak ada perubahan) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let semuaResepList = [];
    let isEditing = false;
    let editingResepId = null;
    // ... (sisa seleksi elemen DOM)

    // --- BAGIAN 3 (Tidak ada perubahan) ---
    function setupUI(user) { /* ... */ }
    function initAuth() { /* ... */ }

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    // ... (fungsi-fungsi lama tidak berubah) ...

    async function handleBuatDaftarBelanja() {
        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) {
            alert('Tidak ada bahan di resep untuk dibuat daftar belanja.');
            return;
        }
        const namaResep = document.getElementById('resep-nama').value || 'Tanpa Nama';
        const namaDaftarBelanja = `Belanjaan untuk ${namaResep}`;
        const itemBelanja = Array.from(resepRows)
            .filter(row => row.dataset.source === 'bahan_baku')
            .map(row => {
                const jumlah = row.querySelector('.resep-jumlah').value;
                const bahanMaster = masterBahanList.find(b => b.id == row.dataset.bahanId);
                const satuan = bahanMaster ? bahanMaster.satuan_kemasan : '';
                return `${row.cells[0].textContent} (${jumlah} ${satuan})`;
            });
        if (itemBelanja.length === 0) {
            alert('Resep ini tidak mengandung bahan baku mentah untuk dibuat daftar belanja.');
            return;
        }
        const { data: { user } } = await _supabase.auth.getUser();
        if (!user) { alert("Sesi tidak valid."); return; }
        const { error } = await _supabase.from('daftar_belanja').insert([{
            user_id: user.id,
            nama_daftar: namaDaftarBelanja,
            item_belanja: itemBelanja
        }]);
        if (error) {
            alert('Gagal menyimpan daftar belanja: ' + error.message);
        } else {
            alert(`Daftar belanja "${namaDaftarBelanja}" berhasil disimpan! (Fitur untuk melihat daftar akan dibuat selanjutnya)`);
        }
    }

    // --- BAGIAN 5: PEMASANGAN EVENT LISTENER ---
    function setupAppEventListeners() {
        // ... (semua listener lama tetap ada di sini) ...

        // === LISTENER BARU UNTUK DAFTAR BELANJA ===
        const buatDaftarBelanjaBtn = document.getElementById('buat-daftar-belanja-btn');
        if (buatDaftarBelanjaBtn) {
            buatDaftarBelanjaBtn.addEventListener('click', handleBuatDaftarBelanja);
        }
    }
    
    // --- (BAGIAN 6 tidak berubah) ---
    initAuth();
});
