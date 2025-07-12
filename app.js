// =================================================================
// KODE MASTER v3.5 - 13 JULI 2025
// PENAMBAHAN FITUR DAFTAR BELANJA
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- (BAGIAN 1, 2, 3 tidak berubah) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // GANTI DENGAN KUNCI ASLI LOE
    // ... (sisa variabel global)

    // --- BAGIAN 4: LOGIKA APLIKASI ---
    // ... (fungsi-fungsi lama tidak berubah) ...

    // --- FUNGSI BARU UNTUK DAFTAR BELANJA ---
    async function handleBuatDaftarBelanja() {
        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) {
            alert('Tidak ada bahan di resep untuk dibuat daftar belanja.');
            return;
        }

        const namaResep = document.getElementById('resep-nama').value || 'Tanpa Nama';
        const namaDaftarBelanja = `Belanjaan untuk ${namaResep}`;

        const itemBelanja = Array.from(resepRows)
            .filter(row => row.dataset.source === 'bahan_baku') // Hanya ambil bahan baku
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
        // ... (semua listener lama) ...
        
        // --- LISTENER BARU UNTUK DAFTAR BELANJA ---
        const buatDaftarBelanjaBtn = document.getElementById('buat-daftar-belanja-btn');
        if (buatDaftarBelanjaBtn) {
            buatDaftarBelanjaBtn.addEventListener('click', handleBuatDaftarBelanja);
        }
    }
    
    // --- (BAGIAN 6 tidak berubah) ---
    initAuth();
});
