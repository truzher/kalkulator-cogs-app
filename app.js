// =================================================================
// KODE FINAL - PERBAIKAN BUG ANGKA 0 DI KOLOM JUMLAH
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ... (Semua kode dari BAGIAN 1 sampai 3 tetap sama)

    // --- BAGIAN 4: LOGIKA APLIKASI ---

    // Fungsi tambahBahanKeResep diperbarui
    function tambahBahanKeResep(bahanInfo) {
        const resepTableBody = document.getElementById('resep-table-body');
        if(!resepTableBody) return;
        const row = document.createElement('tr');
        row.dataset.bahanId = bahanInfo.bahanId;
        row.dataset.source = bahanInfo.source;
        row.dataset.harga = bahanInfo.harga;
        
        // PERBAIKAN DI SINI: value="" agar inputnya kosong, bukan 0
        row.innerHTML = `
            <td>${bahanInfo.nama}</td>
            <td><input type="number" class="resep-jumlah" placeholder="0" min="0" step="any" value=""></td>
            <td class="resep-biaya">Rp 0,00</td>
            <td><button class="resep-delete-btn">Hapus</button></td>
        `;
        resepTableBody.appendChild(row);
        document.getElementById('pilih-bahan-modal').classList.add('hidden');
    }

    // ... (Fungsi-fungsi lain tidak ada perubahan)

    // --- BAGIAN 5 & 6 (Tidak ada perubahan) ---
});
