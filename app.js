// =================================================================
// DIBUAT ULANG OLEH CICI - VERSI FINAL + PERBAIKAN KOLOM & TOMBOL
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // BAGIAN 1: KONEKSI & KONFIGURASI AWAL
    // -------------------------------------------------------------
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; // <- INI SUDAH CICI SESUAIKAN DARI SCREENSHOT
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss'; // <- JANGAN LUPA GANTI INI

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

    function setupUI(user) {
        if (user) {
            console.log("User terdeteksi:", user.email, "Menampilkan aplikasi.");
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
            console.log("User tidak terdeteksi, menampilkan halaman login.");
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            if (userEmailDisplay) userEmailDisplay.textContent = '';
        }
    }

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

    async function loadBahanBaku(kategoriFilter = 'Semua') {
        console.log(`Mencoba memuat data bahan baku dengan filter: ${kategoriFilter}`);
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) return;

        let query = _supabase.from('bahan_baku').select('*').order('created_at', { ascending: false });
        
        // Tambahkan filter jika bukan 'Semua'
        if (kategoriFilter !== 'Semua') {
            query = query.eq('kategori', kategoriFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Gagal memuat bahan baku:", error.message);
            return;
        }

        console.log("Data bahan baku berhasil diambil:", data);
        masterBahanTableBody.innerHTML = '';

        if (data.length === 0) {
            masterBahanTableBody.innerHTML = `<tr><td colspan="4">Tidak ada bahan baku untuk kategori ini.</td></tr>`;
            return;
        }

        data.forEach(bahan => {
            // PERBAIKAN NAMA KOLOM ADA DI SINI
            const hargaPerSatuan = (bahan.harga_beli_kemasan && bahan.isi_kemasan) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama || 'N/A'}</td>
                <td>${bahan.kategori || 'N/A'}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(hargaPerSatuan)} / ${bahan.satuan_kemasan || ''}</td>
                <td>
                    <button class="edit-btn" data-id="${bahan.id}">Edit</button>
                    <button class="delete-btn" data-id="${bahan.id}">Hapus</button>
                </td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    }

    function setupAppEventListeners() {
        console.log("Memasang event listener aplikasi...");
        const navButtons = document.querySelectorAll('.nav-button');
        const pages = document.querySelectorAll('.page');
        const filterButtons = document.querySelectorAll('.filter-btn');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                button.classList.add('active');
                const targetPageId = button.dataset.page;
                document.getElementById(targetPageId).classList.add('active');
            });
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const kategori = button.dataset.kategori;
                loadBahanBaku(kategori); // Langsung memfilter
            });
        });
    }

    // -------------------------------------------------------------
    // BAGIAN 5: JALANKAN APLIKASI
    // -------------------------------------------------------------
    initAuth();

});
