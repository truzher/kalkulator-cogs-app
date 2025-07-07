// File: app.js (VERSI DENGAN KALKULATOR HPP AKTIF - LENGKAP)

document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];

    // === DOM ELEMENTS ===
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutButton = document.getElementById('logout-button');
    const userEmailDisplay = document.getElementById('user-email-display');
    const masterBahanForm = document.getElementById('master-bahan-form');
    const masterBahanTableBody = document.getElementById('master-bahan-table-body');
    const editModal = document.getElementById('edit-modal');
    const editBahanForm = document.getElementById('edit-bahan-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const addResepItemBtn = document.getElementById('add-resep-item-btn');
    const resepTableBody = document.getElementById('resep-table-body');
    const totalHppDisplay = document.getElementById('total-hpp-display');

    // === FUNGSI UTAMA UNTUK MENGATUR TAMPILAN ===
    const updateUI = (user) => {
        if (user) {
            currentUser = user;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
            loadBahanBaku();
        } else {
            currentUser = null;
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    };

    // === FUNGSI-FUNGSI APLIKASI ===

    const formatRupiah = (angka) => {
        if (isNaN(angka)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(angka);
    };

    const loadBahanBaku = async () => {
        const { data, error } = await supabaseClient.from('bahan_baku').select('*').order('created_at', { ascending: false });
        if (error) { console.error('Error mengambil data:', error); return; }

        masterBahanList = data;
        
        masterBahanTableBody.innerHTML = '';
        data.forEach(bahan => {
            const hargaPerSatuanDasar = (bahan.isi_kemasan > 0) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama}</td>
                <td>${formatRupiah(bahan.harga_beli_kemasan)} / ${bahan.isi_kemasan} ${bahan.satuan_kemasan}</td>
                <td><strong>${formatRupiah(hargaPerSatuanDasar)} / ${bahan.satuan_kemasan}</strong></td>
                <td>
                    <button class="button-edit" data-id="${bahan.id}">Edit</button>
                    <button class="button-delete" data-id="${bahan.id}">Hapus</button>
                </td>
            `;
            masterBahanTableBody.appendChild(row);
        });
    };

    const simpanBahanBaku = async (event) => {
        event.preventDefault();
        if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }
        const nama = document.getElementById('bahan-nama').value;
        const harga_beli_kemasan = document.getElementById('harga-beli-kemasan').value;
        const isi_kemasan = document.getElementById('isi-kemasan').value;
        const satuan_kemasan = document.getElementById('satuan-kemasan').value;

        const { error } = await supabaseClient.from('bahan_baku').insert([{ nama, harga_beli_kemasan, isi_kemasan, satuan_kemasan, user_id: currentUser.id }]);
        if (error) { console.error('Error menyimpan data:', error); alert('Gagal menyimpan bahan!'); } 
        else { masterBahanForm.reset(); loadBahanBaku(); }
    };

    const hapusBahanBaku = async (id) => {
        if (confirm("Yakin mau hapus bahan ini?")) {
            const { error } = await supabaseClient.from('bahan_baku').delete().eq('id', id);
            if (error) { console.error('Error menghapus data:', error); alert('Gagal menghapus bahan!'); } 
            else { loadBahanBaku(); }
        }
    };

    const openEditModal = async (id) => {
        const { data, error } = await supabaseClient.from('bahan_baku').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data untuk diedit:', error); return; }

        document.getElementById('edit-bahan-id').value = data.id;
        document.getElementById('edit-bahan-nama').value = data.nama;
        document.getElementById('edit-harga-beli-kemasan').value = data.harga_beli_kemasan;
        document.getElementById('edit-isi-kemasan').value = data.isi_kemasan;
        document.getElementById('edit-satuan-kemasan').value = data.satuan_kemasan;
        editModal.classList.remove('hidden');
    };

    const simpanPerubahanBahan = async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-bahan-id').value;
        const nama = document.getElementById('edit-bahan-nama').value;
        const harga_beli_kemasan = document.getElementById('edit-harga-beli-kemasan').value;
        const isi_kemasan = document.getElementById('edit-isi-kemasan').value;
        const satuan_kemasan = document.getElementById('edit-satuan-kemasan').value;

        const { error } = await supabaseClient.from('bahan_baku').update({ nama, harga_beli_kemasan, isi_kemasan, satuan_kemasan }).eq('id', id);
        if (error) { console.error('Error menyimpan perubahan:', error); alert('Gagal menyimpan perubahan!'); } 
        else { editModal.classList.add('hidden'); loadBahanBaku(); }
    };

    const tambahBahanKeResep = () => {
        const row = document.createElement('tr');
        let options = '<option value="">-- Pilih Bahan --</option>';
        masterBahanList.forEach(bahan => {
            options += `<option value="${bahan.id}">${bahan.nama}</option>`;
        });
        row.innerHTML = `
            <td><select class="bahan-resep-dropdown">${options}</select></td>
            <td><input type="number" class="jumlah-resep" value="0" min="0" style="width: 80px;"></td>
            <td class="satuan-resep-display">-</td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
    };

    const updateBiayaResep = () => {
        let totalHpp = 0;
        const semuaBarisResep = resepTableBody.querySelectorAll('tr');

        semuaBarisResep.forEach(row => {
            const dropdown = row.querySelector('.bahan-resep-dropdown');
            const jumlahInput = row.querySelector('.jumlah-resep');
            const satuanDisplay = row.querySelector('.satuan-resep-display');
            const biayaDisplay = row.querySelector('.biaya-resep-display');

            const bahanId = dropdown.value;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const bahanTerpilih = masterBahanList.find(b => b.id === bahanId);

            if (bahanTerpilih && bahanTerpilih.isi_kemasan > 0) {
                satuanDisplay.textContent = bahanTerpilih.satuan_kemasan;
                const hargaPerSatuan = bahanTerpilih.harga_beli_kemasan / bahanTerpilih.isi_kemasan;
                const biayaBahan = jumlah * hargaPerSatuan;
                biayaDisplay.textContent = formatRupiah(biayaBahan);
                totalHpp += biayaBahan;
            } else {
                satuanDisplay.textContent = '-';
                biayaDisplay.textContent = 'Rp 0,00';
            }
        });
        totalHppDisplay.textContent = formatRupiah(totalHpp);
    };

    // === EVENT LISTENERS ===
    if (signupForm) { signupForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('signup-email').value; const password = document.getElementById('signup-password').value; const { error } = await supabaseClient.auth.signUp({ email, password }); if (error) { alert('Error mendaftar: ' + error.message); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); } }); }
    if (loginForm) { loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { alert('Error login: ' + error.message); } }); }
    if (logoutButton) { logoutButton.addEventListener('click', async () => { await supabaseClient.auth.signOut(); }); }
    if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }
    if (masterBahanTableBody) { masterBahanTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('button-delete')) { hapusBahanBaku(event.target.getAttribute('data-id')); } if (event.target.classList.contains('button-edit')) { openEditModal(event.target.getAttribute('data-id')); } }); }
    if(editBahanForm) { editBahanForm.addEventListener('submit', simpanPerubahanBahan); }
    if(cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.classList.add('hidden'); }); }
    if(addResepItemBtn) { addResepItemBtn.addEventListener('click', tambahBahanKeResep); }
    if(resepTableBody) {
        resepTableBody.addEventListener('change', (event) => { if (event.target.classList.contains('bahan-resep-dropdown')) { updateBiayaResep(); } });
        resepTableBody.addEventListener('input', (event) => { if (event.target.classList.contains('jumlah-resep')) { updateBiayaResep(); } });
        resepTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('hapus-resep-item')) { event.target.closest('tr').remove(); updateBiayaResep(); } });
    }

    // === INISIALISASI APLIKASI ===
    const initApp = async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUI(session?.user);
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateUI(session?.user);
        });
    };

    initApp();
});
