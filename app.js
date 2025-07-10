// =================================================================
// DIBUAT ULANG OLEH CICI - VERSI LENGKAP DENGAN LOAD DATA
// =================================================================

// Menunggu seluruh halaman HTML siap sebelum menjalankan JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // BAGIAN 1: KONEKSI & KONFIGURASI AWAL
    // -------------------------------------------------------------

    // Ganti dengan URL dan Anon Key dari proyek Supabase loe
    const SUPABASE_URL = 'https://URL_PROYEK_LOE.supabase.co';
    const SUPABASE_ANON_KEY = 'KUNCI_ANON_PROYEK_LOE';

    // Membuat koneksi ke Supabase
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Koneksi Supabase berhasil dibuat.');

    // -------------------------------------------------------------
    // BAGIAN 2: SELEKSI ELEMEN-ELEMEN PENTING DARI HTML
    // -------------------------------------------------------------
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutButton = document.getElementById('logout-button');

    console.log('Elemen-elemen DOM utama berhasil dipilih.');

    // -------------------------------------------------------------
    // BAGIAN 3: FUNGSI-FUNGSI UTAMA
    // -------------------------------------------------------------

    /**
     * Mengatur tampilan UI berdasarkan status login pengguna.
     * @param {object | null} user - Objek user dari Supabase, atau null jika logout.
     */
    function setupUI(user) {
        if (user) {
            // Jika user ADA (sudah login)
            console.log("User terdeteksi:", user.email, "Menampilkan aplikasi.");
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;

            // PERINTAH BARU: Panggil fungsi untuk memuat data dari database
            loadBahanBaku();

        } else {
            // Jika user NULL (belum login / sudah logout)
            console.log("User tidak terdeteksi, menampilkan halaman login.");
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            if (userEmailDisplay) userEmailDisplay.textContent = '';
        }
    }

    /**
     * Fungsi utama yang menjalankan semua logika otentikasi.
     */
    function initAuth() {
        console.log('Menjalankan initAuth...');

        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                alert('Mencoba login...');
                const { error } = await _supabase.auth.signInWithPassword({ email, password });
                if (error) alert(`Login Gagal: ${error.message}`);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                alert('Mendaftarkan akun...');
                const { error } = await _supabase.auth.signUp({ email, password });
                if (error) {
                    alert(`Daftar Gagal: ${error.message}`);
                } else {
                    alert('Pendaftaran berhasil! Cek email untuk verifikasi.');
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', async () => await _supabase.auth.signOut());
        }

        _supabase.auth.onAuthStateChange((_event, session) => {
            const user = session ? session.user : null;
            setupUI(user);
        });
    }

    // -------------------------------------------------------------
    // BAGIAN 4: LOGIKA KALKULATOR COGS
    // -------------------------------------------------------------

    /**
     * Mengambil dan menampilkan data bahan baku dari Supabase.
     */
    async function loadBahanBaku() {
        console.log("Mencoba memuat data bahan baku...");
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) {
            console.error("Elemen tabel 'master-bahan-table-body' tidak ditemukan.");
            return;
        }

        const { data, error } = await _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error("Gagal memuat bahan baku:", error.message);
            alert(`Gagal mengambil data: ${error.message}`);
            return;
        }

        console.log("Data bahan baku berhasil diambil:", data);
        masterBahanTableBody.innerHTML = '';

        if (data.length === 0) {
            masterBahanTableBody.innerHTML = '<tr><td colspan="4">Belum ada bahan baku. Silakan tambahkan.</td></tr>';
            return;
        }

        data.forEach(bahan => {
            // Pastikan nama kolom di bawah ini SAMA PERSIS dengan di tabel Supabase loe
            const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama_bahan || 'N/A'}</td>
                <td>${bahan.kategori_bahan || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td>
                <td>
                    <button class="edit-btn" data-id="${bahan.id}">Edit</button>
                    <button class="delete-btn" data-id="${bahan.id}">Hapus</button>
                </td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    }


    // -------------------------------------------------------------
    // BAGIAN 5: JALANKAN APLIKASI
    // -------------------------------------------------------------
    initAuth();

});
