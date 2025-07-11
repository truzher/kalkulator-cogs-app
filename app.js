// =================================================================
// KODE MASTER v2.0 - 12 JULI 2025
// ARSITEKTUR BARU DENGAN SATU TABEL 'RESEP'
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- BAGIAN 1: KONEKSI & VARIABEL GLOBAL ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- GANTI DENGAN KUNCI ASLI LOE
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    let semuaResepList = []; // Satu tempat untuk semua resep
    let isEditing = false;
    let editingResepId = null;

    // --- (BAGIAN 2: SELEKSI ELEMEN DOM tidak berubah) ---

    // --- BAGIAN 3: FUNGSI OTENTIKASI & UI ---
    function setupUI(user) {
        if (user) {
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                if (!appContainer.dataset.listenersAttached) {
                    setupAppEventListeners();
                    appContainer.dataset.listenersAttached = 'true';
                }
            }
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            loadDataAwal();
        } else {
            // ... logika logout
        }
    }

    function initAuth() { /* ... fungsi ini tidak berubah ... */ }

    // --- BAGIAN 4: LOGIKA APLIKASI (DIRANCANG ULANG) ---
    async function loadDataAwal() {
        await loadBahanBaku();
        await loadSemuaResep();
        renderProdukJadiTable(); // Tampilkan produk jadi di halaman default
    }
    
    async function loadBahanBaku() { /* ... fungsi ini tidak berubah ... */ }

    async function loadSemuaResep() {
        const { data, error } = await _supabase.from('resep').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Gagal memuat resep:", error.message);
            semuaResepList = [];
        } else {
            semuaResepList = data;
        }
    }

    function renderProdukJadiTable() {
        const produkTableBody = document.getElementById('produk-table-body');
        if (!produkTableBody) return;
        
        const produkJadiList = semuaResepList.filter(r => r.tipe_resep === 'PRODUK JADI');
        
        produkTableBody.innerHTML = '';
        if (produkJadiList.length === 0) {
            produkTableBody.innerHTML = '<tr><td colspan="5">Belum ada produk jadi yang disimpan.</td></tr>';
            return;
        }
        produkJadiList.forEach(resep => {
            const row = document.createElement('tr');
            row.dataset.id = resep.id;
            row.dataset.nama = resep.nama_resep;
            row.innerHTML = `
                <td>${resep.nama_resep || 'N/A'}</td>
                <td><span class="chip-kategori">Produk Jadi</span></td>
                <td>${resep.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(resep.harga_jual || 0)}</td>
                <td><button class="button-edit">Lihat/Edit</button> <button class="button-delete">Hapus</button></td>
            `;
            produkTableBody.appendChild(row);
        });
    }

    // ... (sisa fungsi seperti populateEditForm, handleHapusBahan, renderPilihBahanList, dll. perlu disesuaikan) ...
    // Cici akan berikan versi lengkapnya yang sudah disesuaikan di bawah.

});
