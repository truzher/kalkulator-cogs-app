// =================================================================
// KODE FINAL DENGAN FUNGSI SIMPAN, EDIT, DELETE
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // BAGIAN 1: KONEKSI & VARIABEL GLOBAL
    // -------------------------------------------------------------
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- JANGAN LUPA GANTI INI

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let masterBahanList = [];

    // -------------------------------------------------------------
    // BAGIAN 2: SELEKSI ELEMEN DOM
    // -------------------------------------------------------------
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // -------------------------------------------------------------
    // BAGIAN 3: FUNGSI-FUNGSI OTENTIKASI & UI
    // -------------------------------------------------------------
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
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const { error } = await _supabase.auth.signInWithPassword({ email, password });
                if (error) alert(`Login Gagal: ${error.message}`);
            });
        }
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await _supabase.auth.signUp({ email, password });
                if (error) { alert(`Daftar Gagal: ${error.message}`); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => await _supabase.auth.signOut());
        }
        _supabase.auth.onAuthStateChange((_event, session) => setupUI(session ? session.user : null));
    }

    // -------------------------------------------------------------
    // BAGIAN 4: LOGIKA APLIKASI (CRUD & KALKULATOR)
    // -------------------------------------------------------------

    async function loadBahanBaku(kategoriFilter = 'Semua') {
        if (!masterBahanTableBody) return;
        let query = _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') { query = query.eq('kategori', kategoriFilter); }
        
        const { data, error } = await query;
        if (error) { console.error("Gagal memuat bahan baku:", error.message); return; }
        
        masterBahanList = data;
        masterBahanTableBody.innerHTML = '';
        if (data.length === 0) {
            masterBahanTableBody.innerHTML = `<tr><td colspan="4">Tidak ada bahan baku.</td></tr>`;
            return;
        }
        data.forEach(bahan => {
            const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.dataset.id = bahan.id; // Menyimpan ID di baris
            row.innerHTML = `
                <td>${bahan.nama || 'N/A'}</td>
                <td>${bahan.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td>
                <td><button class="edit-btn">Edit</button> <button class="delete-btn">Hapus</button></td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    }

    function populateEditForm(id) {
        const bahan = masterBahanList.find(b => b.id == id);
        if (!bahan) return;

        document.getElementById('edit-bahan-id').value = bahan.id;
        document.getElementById('edit-bahan-nama').value = bahan.nama;
        document.getElementById('edit-bahan-kategori').value = bahan.kategori;
        document.getElementById('edit-harga-beli-kemasan').value = bahan.harga_beli_kemasan;
        document.getElementById('edit-isi-kemasan').value = bahan.isi_kemasan;
        document.getElementById('edit-satuan-kemasan').value = bahan.satuan_kemasan;
        
        if(editModal) editModal.classList.remove('hidden');
    }

    async function handleHapusBahan(id) {
        if (confirm('Yakin mau hapus bahan ini?')) {
            const { error } = await _supabase.from('bahan_baku').delete().eq('id', id);
            if (error) {
                alert('Gagal hapus bahan: ' + error.message);
            } else {
                alert('Bahan berhasil dihapus.');
                loadBahanBaku(); // Muat ulang data
            }
        }
    }
    
    // --- (Fungsi-fungsi untuk kalkulator resep tetap sama) ---
    function renderPilihBahanList(bahanList) { /* ... */ }
    function tambahBahanKeResep(bahanInfo) { /* ... */ }
    function openPilihBahanModal() { /* ... */ }
    function hitungTotalHpp() { /* ... */ }


    // -------------------------------------------------------------
    // BAGIAN 5: PEMASANGAN SEMUA EVENT LISTENER
    // -------------------------------------------------------------
    function setupAppEventListeners() {
        // --- Listener untuk form Master Bahan (Simpan Baru) ---
        if (masterBahanForm) {
            masterBahanForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newBahan = {
                    nama: document.getElementById('bahan-nama').value,
                    kategori: document.getElementById('bahan-kategori').value,
                    harga_beli_kemasan: document.getElementById('harga-beli-kemasan').value,
                    isi_kemasan: document.getElementById('isi-kemasan').value,
                    satuan_kemasan: document.getElementById('satuan-kemasan').value,
                };
                const { error } = await _supabase.from('bahan_baku').insert([newBahan]);
                if (error) {
                    alert('Gagal simpan bahan: ' + error.message);
                } else {
                    alert('Bahan baru berhasil disimpan!');
                    masterBahanForm.reset();
                    loadBahanBaku();
                }
            });
        }

        // --- Listener untuk form Edit Bahan (Update) ---
        if (editBahanForm) {
            editBahanForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-bahan-id').value;
                const updatedBahan = {
                    nama: document.getElementById('edit-bahan-nama').value,
                    kategori: document.getElementById('edit-bahan-kategori').value,
                    harga_beli_kemasan: document.getElementById('edit-harga-beli-kemasan').value,
                    isi_kemasan: document.getElementById('edit-isi-kemasan').value,
                    satuan_kemasan: document.getElementById('edit-satuan-kemasan').value,
                };
                const { error } = await _supabase.from('bahan_baku').update(updatedBahan).eq('id', id);
                if (error) {
                    alert('Gagal update bahan: ' + error.message);
                } else {
                    alert('Bahan berhasil diupdate!');
                    if(editModal) editModal.classList.add('hidden');
                    loadBahanBaku();
                }
            });
        }
        
        // --- Listener untuk tombol di dalam tabel Master Bahan (Edit & Delete) ---
        if (masterBahanTableBody) {
            masterBahanTableBody.addEventListener('click', (e) => {
                const targetRow = e.target.closest('tr');
                if (!targetRow) return; // Keluar jika klik bukan di dalam baris
                
                const id = targetRow.dataset.id;
                if (e.target.classList.contains('edit-btn')) {
                    populateEditForm(id);
                }
                if (e.target.classList.contains('delete-btn')) {
                    handleHapusBahan(id);
                }
            });
        }
        
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));

        // --- (Semua listener lain yang sudah kita buat sebelumnya ada di sini) ---
    }
    
    // -------------------------------------------------------------
    // BAGIAN 6: JALANKAN APLIKASI
    // -------------------------------------------------------------
    initAuth();
});
