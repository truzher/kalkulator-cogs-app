// =================================================================
// DIBUAT ULANG OLEH CICI - VERSI FINAL UNTUK LOGIN
// Disesuaikan dengan struktur HTML yang punya form login & signup terpisah
// =================================================================

// Menunggu seluruh halaman HTML siap sebelum menjalankan JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // BAGIAN 1: KONEKSI & KONFIGURASI AWAL
    // -------------------------------------------------------------

    // Ganti dengan URL dan Anon Key dari proyek Supabase loe
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';

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
    // Kita tidak butuh messageDiv di sini karena form-nya terpisah

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
     * VERSI BARU: Mengenali form login dan signup yang terpisah.
     */
    function initAuth() {
        console.log('Menjalankan initAuth...');

        // Ambil elemen form login dan signup dari HTML
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        // --- Event Listener untuk Form LOGIN ---
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                alert('Mencoba login...'); // Menggunakan alert untuk sementara

                const { error } = await _supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    console.error("Error saat login:", error.message);
                    alert(`Login Gagal: ${error.message}`);
                } else {
                    console.log("Login berhasil!");
                    // Tampilan akan diurus oleh onAuthStateChange
                }
            });
        }

        // --- Event Listener untuk Form SIGNUP ---
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                alert('Mendaftarkan akun...'); // Menggunakan alert untuk sementara

                const { error } = await _supabase.auth.signUp({ email, password });

                if (error) {
                    console.error("Error saat signup:", error.message);
                    alert(`Daftar Gagal: ${error.message}`);
                } else {
                    console.log("Signup berhasil, cek email untuk verifikasi.");
                    alert('Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.');
                }
            });
        }


        // Listener untuk tombol logout
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                console.log("Tombol logout diklik.");
                await _supabase.auth.signOut();
            });
        }

        // Listener untuk memantau perubahan status login
        _supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Status otentikasi berubah.");
            const user = session ? session.user : null;
            setupUI(user);
        });
    }

    // -------------------------------------------------------------
    // BAGIAN 4: LOGIKA KALKULATOR COGS (DI SINI NANTI KITA ISI)
    // -------------------------------------------------------------

    // ... (Sengaja dikosongkan dulu, kita fokus benerin login) ...


    // -------------------------------------------------------------
    // BAGIAN 5: JALANKAN APLIKASI
    // -------------------------------------------------------------
    initAuth();

});
