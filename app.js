// =================================================================
// KODE MASTER v3.8 - 13 JULI 2025
// FITUR DOWNLOAD SEMUA RESEP KE EXCEL
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ... (semua kode lama tidak berubah) ...

    // --- FUNGSI BARU UNTUK DOWNLOAD SEMUA RESEP ---
    function handleDownloadSemuaResep() {
        const tipeAktif = document.querySelector('.resep-filter-btn.active').dataset.tipe;
        const listResep = semuaResepList.filter(r => r.tipe_resep === tipeAktif);

        if (listResep.length === 0) {
            alert(`Tidak ada resep ${tipeAktif.toLowerCase()} untuk di-download.`);
            return;
        }

        const workbook = XLSX.utils.book_new();

        listResep.forEach(resep => {
            const ringkasanData = [
                ["Nama Resep", resep.nama_resep],
                ["Tipe Resep", resep.tipe_resep],
                ["Kategori", resep.kategori],
                ["Total HPP", resep.total_hpp],
                ["Harga Jual", resep.harga_jual || "-"],
                ["", ""],
                ["DETAIL BAHAN", "JUMLAH", "SUMBER", "BIAYA"],
            ];

            const detailBahanData = resep.resep_json.map(item => {
                // ... (logika map detail bahan sama seperti sebelumnya) ...
            });

            const dataFinal = ringkasanData.concat(detailBahanData);
            const worksheet = XLSX.utils.aoa_to_sheet(dataFinal);
            worksheet["!cols"] = [{wch:30}, {wch:15}, {wch:15}, {wch:20}];
            
            // Gunakan nama resep yang valid sebagai nama sheet
            const sheetName = resep.nama_resep.substring(0, 31).replace(/[\\/*?[\]:]/g, "");
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        XLSX.writeFile(workbook, "Semua Resep.xlsx");
    }

    // --- (Fungsi renderProdukTable diperbarui untuk hapus tombol download lama) ---
    // ...

    // --- PEMASANGAN EVENT LISTENER (dengan perubahan) ---
    function setupAppEventListeners() {
        // ... (semua listener lama) ...

        const downloadAllBtn = document.getElementById('download-all-resep-btn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', handleDownloadSemuaResep);
        }
    }

    // ...
});
