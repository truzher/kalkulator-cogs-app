document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let produkSetengahJadiList = [];
    let isEditingProduk = false;
    let editingProdukId = null;

    // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN & EVENT LISTENER ===
    const setupUI = (user) => {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if (user) {
            currentUser = user;
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) {
                appContainer.classList.remove('hidden');
                const userEmailDisplay = document.getElementById('user-email-display');
                if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            }
            
            // Panggil semua fungsi yang butuh data setelah login
            loadBahanBaku();
            loadProduk();
            // Pasang event listener untuk aplikasi HANYA setelah login
            // Pastikan ini dipanggil sekali saja
            if (!appContainer.dataset.listenersAttached) {
                setupAppEventListeners();
                appContainer.dataset.listenersAttached = 'true';
            }
        } else {
            currentUser = null;
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
        }
    };

    // === FUNGSI-FUNGSI APLIKASI ===
    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
    };

    const loadBahanBaku = async (kategoriFilter = 'Semua') => {
        const masterBahanTableBody = document.getElementById('master-bahan-table-body');
        if (!masterBahanTableBody) return;

        let query = supabaseClient.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (kategoriFilter !== 'Semua') {
            query = query.eq('kategori', kategoriFilter);
        }
        const { data, error } = await query;

        if (error) { console.error('Error mengambil data bahan baku:', error); return; }
        
        if (kategoriFilter === 'Semua') {
            masterBahanList = data;
        }

        masterBahanTableBody.innerHTML = '';
        data.forEach(bahan => {
            const hargaPerSatuanDasar = (bahan.isi_kemasan > 0) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama}</td>
                <td><span class="chip-kategori">${bahan.kategori || 'Lainnya'}</span></td>
                <td>${formatRupiah(hargaPerSatuanDasar)} / ${bahan.satuan_kemasan}</td>
                <td>
                    <button class="button-edit" data-id="${bahan.id}">Edit</button>
                    <button class="button-delete" data-id="${bahan.id}">Hapus</button>
                </td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    };
    
    const simpanBahanBaku = async (event, isCepat = false) => {
        event.preventDefault();
        if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }
        
        const formPrefix = isCepat ? '-cepat' : '';
        const formElement = isCepat ? document.getElementById('master-bahan-cepat-form') : document.getElementById('master-bahan-form');

        const nama = document.getElementById(`bahan-nama${formPrefix}`).value;
        const kategori = document.getElementById(`bahan-kategori${formPrefix}`).value;
        const harga_beli_kemasan = document.getElementById(`harga-beli-kemasan${formPrefix}`).value;
        const isi_kemasan = document.getElementById(`isi-kemasan${formPrefix}`).value;
        const satuan_kemasan = document.getElementById(`satuan-kemasan${formPrefix}`).value;
        
        const { data, error } = await supabaseClient.from('bahan_baku').insert([{ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan, user_id: currentUser.id }]).select();
        
        if (error) { 
            console.error('Error menyimpan bahan baku:', error); 
            alert('Gagal menyimpan bahan!'); 
        } else { 
            formElement.reset(); 
            await loadBahanBaku();
            if (isCepat) {
                document.getElementById('tambah-bahan-cepat-modal').classList.add('hidden');
                tampilkanHasilPencarian(nama, 'bahan_baku');
            }
        }
    };

    const hapusBahanBaku = async (id) => {
        if (confirm("Yakin mau hapus bahan ini?")) {
            const { error } = await supabaseClient.from('bahan_baku').delete().eq('id', id);
            if (error) { console.error('Error menghapus bahan baku:', error); alert('Gagal menghapus bahan!'); } 
            else { loadBahanBaku(); }
        }
    };

    const openEditModal = async (id) => {
        const editModal = document.getElementById('edit-modal');
        const { data, error } = await supabaseClient.from('bahan_baku').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data untuk diedit:', error); return; }
        document.getElementById('edit-bahan-id').value = data.id;
        document.getElementById('edit-bahan-nama').value = data.nama;
        document.getElementById('edit-bahan-kategori').value = data.kategori || 'Bahan Umum';
        document.getElementById('edit-harga-beli-kemasan').value = data.harga_beli_kemasan;
        document.getElementById('edit-isi-kemasan').value = data.isi_kemasan;
        document.getElementById('edit-satuan-kemasan').value = data.satuan_kemasan;
        editModal.classList.remove('hidden');
    };

    const simpanPerubahanBahan = async (event) => {
        event.preventDefault();
        const editModal = document.getElementById('edit-modal');
        const id = document.getElementById('edit-bahan-id').value;
        const nama = document.getElementById('edit-bahan-nama').value;
        const kategori = document.getElementById('edit-bahan-kategori').value;
        const harga_beli_kemasan = document.getElementById('edit-harga-beli-kemasan').value;
        const isi_kemasan = document.getElementById('edit-isi-kemasan').value;
        const satuan_kemasan = document.getElementById('edit-satuan-kemasan').value;
        const { error } = await supabaseClient.from('bahan_baku').update({ nama, kategori, harga_beli_kemasan, isi_kemasan, satuan_kemasan }).eq('id', id);
        if (error) { console.error('Error menyimpan perubahan:', error); alert('Gagal menyimpan perubahan!'); } 
        else { editModal.classList.add('hidden'); loadBahanBaku(); }
    };
    
    // === FUNGSI-FUNGSI KALKULATOR ===

    const addBahanFromModal = (bahan) => {
        const resepTableBody = document.getElementById('resep-table-body');
        const row = document.createElement('tr');
        row.dataset.bahanId = bahan.id;
        row.dataset.source = bahan.source;
        row.innerHTML = `
            <td>${bahan.nama}</td>
            <td><input type="number" class="jumlah-resep" placeholder="0" min="0"></td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
        updatePerhitunganTotal();
    };

    const updatePerhitunganTotal = () => {
        // ... (Logika lengkap dari jawaban sebelumnya)
    };
    
    const simpanProduk = async (event) => {
        // ... (Logika lengkap dari jawaban sebelumnya)
    };

    const loadProduk = async () => {
        // ... (Logika lengkap dari jawaban sebelumnya)
    };

    // ... (dan seterusnya untuk semua fungsi lainnya)

    // === FUNGSI UNTUK MEMASANG SEMUA EVENT LISTENER APLIKASI ===
    const setupAppEventListeners = () => {
        // Taruh SEMUA getElementById dan addEventListener untuk aplikasi di sini
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', async () => await supabaseClient.auth.signOut());

        const masterBahanForm = document.getElementById('master-bahan-form');
        if (masterBahanForm) masterBahanForm.addEventListener('submit', (e) => simpanBahanBaku(e, false));
        
        const bahanFilterContainer = document.getElementById('bahan-filter-container');
        if (bahanFilterContainer) {
            bahanFilterContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('filter-btn')) {
                    const kategori = event.target.dataset.kategori;
                    bahanFilterContainer.querySelector('.active').classList.remove('active');
                    event.target.classList.add('active');
                    loadBahanBaku(kategori);
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
