document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let produkSetengahJadiList = [];

    // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN & EVENT LISTENER ===
    const setupUI = (user) => {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        const userEmailDisplay = document.getElementById('user-email-display');

        if (user) {
            currentUser = user;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
            
            // Panggil semua fungsi yang butuh data setelah login
            loadBahanBaku();
            loadProduk();
            setupAppEventListeners(); // Pasang event listener untuk aplikasi HANYA setelah login
        } else {
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    };

    // === FUNGSI-FUNGSI APLIKASI ===
    // (Semua fungsi seperti loadBahanBaku, simpanProduk, dll. ditaruh di sini)
    const loadBahanBaku = async (kategoriFilter = 'Semua') => {
        // ... (Logika lengkap dari jawaban sebelumnya)
    };
    
    // ... (dan seterusnya untuk semua fungsi lainnya)


    // === FUNGSI UNTUK MEMASANG SEMUA EVENT LISTENER APLIKASI ===
    const setupAppEventListeners = () => {
        // Taruh SEMUA getElementById dan addEventListener untuk aplikasi di sini
        const masterBahanForm = document.getElementById('master-bahan-form');
        if (masterBahanForm) masterBahanForm.addEventListener('submit', simpanBahanBaku);
        
        const bahanFilterContainer = document.getElementById('bahan-filter-container');
        if (bahanFilterContainer) {
            bahanFilterContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-btn')) {
                    // ... (logika filter) ...
                }
            });
        }
        // ... (dan seterusnya untuk semua event listener lainnya)
    };


    // === INISIALISASI & AUTHENTIKASI AWAL ===
    const initAuth = () => {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) alert('Error login: ' + error.message);
            });
        }

        if (signupForm) {
             signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) { alert('Error mendaftar: ' + error.message); } 
                else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); }
            });
        }

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            setupUI(session?.user);
        });
    };

    // Jalankan inisialisasi otentikasi
    initAuth();
});
