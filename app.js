// =================================================================
// DIBUAT ULANG OLEH CICI PADA 10 JULI 2025
// TUJUAN: MENGHILANGKAN SEMUA SYNTAX ERROR
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
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');
    console.log('Elemen-elemen DOM berhasil dipilih.');

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
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
        } else {
            // Jika user NULL (belum login / sudah logout)
            console.log("User tidak terdeteksi, menampilkan halaman login.");
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            userEmailDisplay.textContent = '';
        }
    }

    /**
     * Fungsi utama yang menjalankan semua logika otentikasi.
     */
    function initAuth() {
        console.log('Menjalankan initAuth...');

        // Listener untuk form login/signup
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            messageDiv.textContent = 'Memproses...';

            // Coba login
            const { error: loginError } = await _supabase.auth.signInWithPassword({ email, password });

            if (loginError) {
                // Jika login gagal, coba daftar (signup)
                console.log("Login gagal, mencoba mendaftar...");
                const { error: signUpError } = await _supabase.auth.signUp({ email, password });
                
                if (signUpError) {
                    console.error("Error saat signup:", signUpError.message);
                    messageDiv.textContent = `Error: ${signUpError.message}`;
                } else {
                    console.log("Signup berhasil, cek email untuk verifikasi.");
                    messageDiv.textContent = 'Pendaftaran berhasil! Cek email untuk verifikasi.';
                }
            } else {
                console.log("Login berhasil!");
                messageDiv.textContent = '';
            }
        });

        // Listener untuk tombol logout
        logoutButton.addEventListener('click', async () => {
            console.log("Tombol logout diklik.");
            await _supabase.auth.signOut();
        });

        // Listener untuk memantau perubahan status login (jantungnya ada di sini)
        _supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Status otentikasi berubah, event:", _event);
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

}); // <-- Penutup untuk document.addEventListener('DOMContentLoaded', ...)
