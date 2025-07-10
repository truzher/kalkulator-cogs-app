document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];

    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const produkForm = document.getElementById('produk-form');
    
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
            loadBahanBaku();
        } else {
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            if (userEmailDisplay) userEmailDisplay.textContent = '';
        }
    }

    function initAuth() {
        // ... (fungsi initAuth lengkap seperti sebelumnya)
    }

    async function loadBahanBaku(kategoriFilter = 'Semua') {
        // ... (fungsi loadBahanBaku lengkap seperti sebelumnya)
    }

    function populateEditForm(id) {
        // ... (fungsi populateEditForm lengkap seperti sebelumnya)
    }

    async function handleHapusBahan(id) {
        // ... (fungsi handleHapusBahan lengkap seperti sebelumnya)
    }

    function renderPilihBahanList(bahanList) {
        // ... (fungsi renderPilihBahanList lengkap seperti sebelumnya)
    }

    function tambahBahanKeResep(bahanInfo) {
        // ... (fungsi tambahBahanKeResep lengkap seperti sebelumnya)
    }

    function openPilihBahanModal() {
        // ... (fungsi openPilihBahanModal lengkap seperti sebelumnya)
    }

    function kalkulasiFinal() {
        // ... (fungsi kalkulasiFinal lengkap seperti sebelumnya)
    }
    
    async function handleSimpanProduk(e) {
        e.preventDefault();
        console.log("Tombol Simpan Produk diklik.");

        const resepRows = document.querySelectorAll('#resep-table-body tr');
        if (resepRows.length === 0) {
            alert('Resep tidak boleh kosong!');
            return;
        }

        const resepData = Array.from(resepRows).map(row => ({
            bahan_id: row.dataset.bahanId,
            nama_bahan: row.cells[0].textContent,
            jumlah: row.querySelector('.resep-jumlah').value,
            biaya: parseFloat(row.querySelector('.resep-biaya').textContent.replace(/[^0-9,-]+/g, "").replace(",", "."))
        }));

        const produkData = {
            nama_produk: document.getElementById('product-name').value,
            kategori_produk: document.getElementById('product-category').value,
            resep: resepData,
            total_hpp: parseFloat(document.getElementById('total-cogs-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            saran_harga_jual: parseFloat(document.getElementById('saran-harga-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit: parseFloat(document.getElementById('profit-display').textContent.replace(/[^0-9,-]+/g, "").replace(",", ".")),
            profit_persen: parseFloat(document.getElementById('profit-percent-display').textContent.replace('%', ''))
        };

        if (!produkData.nama_produk) {
            alert('Nama produk harus diisi!');
            return;
        }

        const { data, error } = await _supabase.from('produk_jadi').insert([produkData]).select();

        if (error) {
            alert('Gagal menyimpan produk: ' + error.message);
            console.error('Error Supabase:', error);
        } else {
            alert(`Produk "${data[0].nama_produk}" berhasil disimpan!`);
            produkForm.reset();
            document.getElementById('resep-table-body').innerHTML = '';
            kalkulasiFinal();
        }
    }

    function setupAppEventListeners() {
        // ... (semua listener lama tetap ada di sini)
        
        if (produkForm) {
            produkForm.addEventListener('submit', handleSimpanProduk);
        }
    }
    
    initAuth();
});
