// =================================================================
// KODE FINAL - DENGAN PERBAIKAN ID & LOG DEBUGGING
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOMContentLoaded -> Mulai eksekusi script.');

    // --- (BAGIAN 1: KONEKSI & VARIABEL GLOBAL) ---
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- PASTIKAN INI DIGANTI
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let masterBahanList = [];
    console.log('DEBUG: Supabase client dibuat.');

    // --- (BAGIAN 2: SELEKSI ELEMEN DOM) ---
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const hppForm = document.getElementById('hpp-form'); // PERBAIKAN ID FORM
    console.log('DEBUG: Elemen DOM utama dipilih.');
    
    // --- (BAGIAN 3: FUNGSI-FUNGSI OTENTIKASI & UI) ---
    function setupUI(user) {
        console.log('DEBUG: setupUI dipanggil. User:', user ? user.email : 'null');
        if (user) {
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                if (!appContainer.dataset.listenersAttached) {
                    console.log('DEBUG: Listener aplikasi belum ada, akan dipasang sekarang.');
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
        console.log('DEBUG: initAuth dipanggil.');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('DEBUG: Form login di-submit.');
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                console.log('DEBUG: Mencoba login dengan email:', email);
                const { error } = await _supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    console.error('DEBUG: Login Gagal!', error);
                    alert(`Login Gagal: ${error.message}`);
                } else {
                    console.log('DEBUG: Perintah login berhasil dikirim (bukan berarti sudah login).');
                }
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('DEBUG: Form signup di-submit.');
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await _supabase.auth.signUp({ email, password });
                if (error) { 
                    console.error('DEBUG: Daftar Gagal!', error);
                    alert(`Daftar Gagal: ${error.message}`); 
                } else { 
                    console.log('DEBUG: Perintah daftar berhasil dikirim.');
                    alert('Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.'); 
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                console.log('DEBUG: Tombol logout diklik.');
                await _supabase.auth.signOut();
            });
        }

        console.log('DEBUG: Memasang listener onAuthStateChange.');
        _supabase.auth.onAuthStateChange((event, session) => {
            console.log(`DEBUG: onAuthStateChange event: ${event}`, session);
            setupUI(session ? session.user : null);
        });
    }

    // --- (BAGIAN 4: LOGIKA APLIKASI) ---
    async function loadBahanBaku(kategoriFilter = 'Semua') { /* ... (Tidak ada perubahan di sini) ... */ }
    function populateEditForm(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    async function handleHapusBahan(id) { /* ... (Tidak ada perubahan di sini) ... */ }
    function renderPilihBahanList(bahanList) { /* ... (Tidak ada perubahan di sini) ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... (Tidak ada perubahan di sini) ... */ }
    function openPilihBahanModal() { /* ... (Tidak ada perubahan di sini) ... */ }
    function kalkulasiFinal() { /* ... (Tidak ada perubahan di sini) ... */ }
    function hitungTotalHppBahan() { /* ... (Tidak ada perubahan di sini) ... */ }

    // --- FUNGSI BARU UNTUK SIMPAN PRODUK JADI (DENGAN ID YANG BENAR) ---
    async function handleSimpanProduk(e) {
        e.preventDefault();
        console.log("DEBUG: handleSimpanProduk dipanggil.");

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
            nama_produk: document.getElementById('produk-nama').value, // PERBAIKAN ID
            kategori_produk: document.getElementById('produk-kategori').value, // PERBAIKAN ID
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

        console.log("DEBUG: Mengirim data produk ke Supabase:", produkData);
        const { data, error } = await _supabase.from('produk_jadi').insert([produkData]).select();

        if (error) {
            alert('Gagal menyimpan produk: ' + error.message);
            console.error('DEBUG: Error Supabase saat simpan produk:', error);
        } else {
            alert(`Produk "${data[0].nama_produk}" berhasil disimpan!`);
            if(hppForm) hppForm.reset();
            document.getElementById('resep-table-body').innerHTML = '';
            kalkulasiFinal();
        }
    }

    // --- (BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER) ---
    function setupAppEventListeners() {
        console.log('DEBUG: setupAppEventListeners dipanggil.');
        // ... (Semua listener lain yang sudah kita buat sebelumnya ada di sini) ...
        
        // Listener untuk form Simpan Produk (dengan ID yang benar)
        if (hppForm) {
            console.log('DEBUG: Memasang listener untuk hpp-form.');
            hppForm.addEventListener('submit', handleSimpanProduk);
        } else {
            console.error('DEBUG: Form dengan ID "hpp-form" tidak ditemukan!');
        }
    }
    
    // --- (BAGIAN 6: JALANKAN APLIKASI) ---
    console.log('DEBUG: Script akan memanggil initAuth().');
    initAuth();
});
