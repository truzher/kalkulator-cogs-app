// File: app.js (VERSI DEBUGGING SUPER DASAR)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Event DOMContentLoaded terpicu. HTML sudah siap.");

    try {
        // === KONFIGURASI SUPABASE ===
        const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client berhasil dibuat.");

        // === DOM ELEMENTS ===
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        console.log("Elemen authContainer:", authContainer);
        console.log("Elemen appContainer:", appContainer);

        // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN ===
        const updateUI = (user) => {
            console.log("Fungsi updateUI dipanggil. User:", user);
            if (!authContainer || !appContainer) {
                console.error("Salah satu container (auth/app) tidak ditemukan!");
                return;
            }
            if (user) {
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
            } else {
                authContainer.classList.remove('hidden');
                appContainer.classList.add('hidden');
            }
            console.log("UI berhasil di-update.");
        };

        // === INISIALISASI APLIKASI ===
        const initApp = async () => {
            console.log("Mulai initApp...");
            const { data: { session } } = await supabaseClient.auth.getSession();
            console.log("Sesi awal didapatkan:", session);
            updateUI(session?.user);

            supabaseClient.auth.onAuthStateChange((_event, session) => {
                console.log("Terjadi perubahan state auth!", _event);
                updateUI(session?.user);
            });
            console.log("initApp selesai.");
        };

        // Jalankan aplikasi
        initApp();

    } catch (e) {
        console.error("!!! TERJADI ERROR FATAL DI LEVEL ATAS !!!", e);
        // Tampilkan error langsung di halaman untuk debugging
        document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif; color: red;"><h1>Error Fatal</h1><p>${e.message}</p><pre>${e.stack}</pre></div>`;
    }
});
