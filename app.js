document.addEventListener('DOMContentLoaded', () => {
    // === KONFIGURASI SUPABASE ===
    const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === VARIABEL GLOBAL ===
    let currentUser = null;
    let masterBahanList = [];
    let isEditingProduk = false;
    let editingProdukId = null;

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
    const hppForm = document.getElementById('hpp-form');
    const produkTableBody = document.getElementById('produk-table-body');
    const produkNamaInput = document.getElementById('produk-nama');
    const produkKategoriInput = document.getElementById('produk-kategori');
    const mainNav = document.querySelector('.main-nav');
    const pages = document.querySelectorAll('.page');

    // Input Biaya & Margin
    const overheadCostInput = document.getElementById('overhead-cost');
    const overheadTypeInput = document.getElementById('overhead-type');
    const laborCostInput = document.getElementById('labor-cost');
    const errorCostPercentInput = document.getElementById('error-cost-percent');
    const targetMarginPercentInput = document.getElementById('target-margin-percent');
    const hargaJualAktualInput = document.getElementById('harga-jual-aktual');

    // Display Hasil
    const totalCogsDisplay = document.getElementById('total-cogs-display');
    const saranHargaDisplay = document.getElementById('saran-harga-display');
    const profitDisplay = document.getElementById('profit-display');
    const profitPercentDisplay = document.getElementById('profit-percent-display');

    // === FUNGSI UTAMA ===
    const updateUI = (user) => {
        if (user) {
            currentUser = user;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
            loadBahanBaku();
            loadProduk();
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
        if (error) { console.error('Error mengambil data bahan baku:', error); return; }
        masterBahanList = data;
        masterBahanTableBody.innerHTML = '';
        data.forEach(bahan => {
            const hargaPerSatuanDasar = (bahan.isi_kemasan > 0) ? (bahan.harga_beli_kemasan / bahan.isi_kemasan) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bahan.nama}</td>
                <td>${formatRupiah(hargaPerSatuanDasar)} / ${bahan.satuan_kemasan}</td>
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
        if (error) { console.error('Error menyimpan bahan baku:', error); alert('Gagal menyimpan bahan!'); } 
        else { masterBahanForm.reset(); loadBahanBaku(); }
    };

    const hapusBahanBaku = async (id) => {
        if (confirm("Yakin mau hapus bahan ini?")) {
            const { error } = await supabaseClient.from('bahan_baku').delete().eq('id', id);
            if (error) { console.error('Error menghapus bahan baku:', error); alert('Gagal menghapus bahan!'); } 
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

    const tambahBahanKeResep = (bahanId = '', jumlah = '') => {
        const row = document.createElement('tr');
        let options = '<option value="">-- Pilih Bahan --</option>';
        masterBahanList.forEach(bahan => {
            const isSelected = bahan.id === bahanId ? 'selected' : '';
            options += `<option value="${bahan.id}">${bahan.nama}</option>`;
        });
        row.innerHTML = `
            <td><select class="bahan-resep-dropdown">${options}</select></td>
            <td><input type="number" class="jumlah-resep" placeholder="0" value="${jumlah}" min="0"></td>
            <td class="biaya-resep-display">Rp 0,00</td>
            <td><button type="button" class="button-delete hapus-resep-item">X</button></td>
        `;
        resepTableBody.appendChild(row);
    };

    const updatePerhitunganTotal = () => {
        let totalBiayaBahan = 0;
        resepTableBody.querySelectorAll('tr').forEach(row => {
            const dropdown = row.querySelector('.bahan-resep-dropdown');
            const jumlahInput = row.querySelector('.jumlah-resep');
            const biayaDisplay = row.querySelector('.biaya-resep-display');
            const bahanId = dropdown.value;
            const jumlah = parseFloat(jumlahInput.value) || 0;
            const bahanTerpilih = masterBahanList.find(b => b.id === bahanId);
            if (bahanTerpilih && bahanTerpilih.isi_kemasan > 0) {
                const hargaPerSatuan = bahanTerpilih.harga_beli_kemasan / bahanTerpilih.isi_kemasan;
                const biayaBahan = jumlah * hargaPerSatuan;
                biayaDisplay.textContent = formatRupiah(biayaBahan);
                totalBiayaBahan += biayaBahan;
            } else {
                biayaDisplay.textContent = 'Rp 0,00';
            }
        });
        
        const overheadValue = parseFloat(overheadCostInput.value) || 0;
        const overheadType = overheadTypeInput.value;
        let overheadCost = 0;
        if (overheadType === 'persen') {
            overheadCost = totalBiayaBahan * (overheadValue / 100);
        } else {
            overheadCost = overheadValue;
        }

        const labor = parseFloat(laborCostInput.value) || 0;
        const biayaProduksi = totalBiayaBahan + overheadCost + labor;
        const errorPercent = parseFloat(errorCostPercentInput.value) || 0;
        const errorCost = biayaProduksi * (errorPercent / 100);
        const totalCogs = biayaProduksi + errorCost;
        totalCogsDisplay.textContent = formatRupiah(totalCogs);
        
        const marginPercent = parseFloat(targetMarginPercentInput.value) || 0;
        let saranHarga = 0;
        if (marginPercent < 100 && marginPercent >= 0) {
            saranHarga = totalCogs / (1 - (marginPercent / 100));
        } else if (totalCogs > 0) {
            saranHarga = totalCogs;
        }
        saranHargaDisplay.textContent = formatRupiah(saranHarga);
        
        const hargaJualAktual = parseFloat(hargaJualAktualInput.value) || 0;
        if (hargaJualAktual === 0 && saranHarga > 0) {
            hargaJualAktualInput.value = Math.ceil(saranHarga / 1000) * 1000;
        }
        
        const profit = hargaJualAktual - totalCogs;
        const profitPercent = hargaJualAktual > 0 ? (profit / hargaJualAktual) * 100 : 0;
        profitDisplay.textContent = formatRupiah(profit);
        profitPercentDisplay.textContent = profitPercent.toFixed(2);
    };

    const simpanProduk = async (event) => {
        event.preventDefault();
        if (!currentUser) { alert('Sesi tidak ditemukan.'); return; }
        const namaProduk = produkNamaInput.value;
        if (!namaProduk) { alert('Nama produk tidak boleh kosong!'); return; }
        const resepItems = [];
        resepTableBody.querySelectorAll('tr').forEach(row => {
            const bahanId = row.querySelector('.bahan-resep-dropdown').value;
            const jumlah = parseFloat(row.querySelector('.jumlah-resep').value) || 0;
            if (bahanId && jumlah > 0) {
                resepItems.push({ bahan_id: bahanId, jumlah: jumlah });
            }
        });
        if (resepItems.length === 0) { alert('Resep tidak boleh kosong!'); return; }

        const produkData = {
            nama_produk: namaProduk,
            resep: resepItems,
            kategori: produkKategoriInput.value,
            overhead_cost: parseFloat(overheadCostInput.value) || 0,
            overhead_cost_type: overheadTypeInput.value,
            labor_cost: parseFloat(laborCostInput.value) || 0,
            error_cost_percent: parseFloat(errorCostPercentInput.value) || 0,
            target_margin_percent: parseFloat(targetMarginPercentInput.value) || 0,
            harga_jual_aktual: parseFloat(hargaJualAktualInput.value) || 0,
            user_id: currentUser.id
        };

        let error;
        if (isEditingProduk && editingProdukId) {
            const { error: updateError } = await supabaseClient.from('produk').update(produkData).eq('id', editingProdukId);
            error = updateError;
        } else {
            const { error: insertError } = await supabaseClient.from('produk').insert([produkData]);
            error = insertError;
        }
        if (error) {
            console.error('Error menyimpan produk:', error);
            alert('Gagal menyimpan produk!');
        } else {
            alert(`Produk berhasil ${isEditingProduk ? 'diperbarui' : 'disimpan'}!`);
            resetFormHpp();
            loadProduk();
        }
    };

    const loadProduk = async () => {
        const { data, error } = await supabaseClient.from('produk').select('*').order('created_at', { ascending: false });
        if (error) { console.error('Error mengambil data produk:', error); return; }
        produkTableBody.innerHTML = '';
        data.forEach(produk => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produk.nama_produk}</td>
                <td>${produk.kategori || '-'}</td>
                <td>${formatRupiah(produk.harga_jual_aktual)}</td>
                <td>
                    <button class="button-edit" data-id="${produk.id}">Edit</button>
                    <button class="button-delete" data-id="${produk.id}">Hapus</button>
                </td>
            `;
            produkTableBody.appendChild(row);
        });
    };

    const hapusProduk = async (id) => {
        if (confirm("Yakin mau hapus produk ini beserta resepnya?")) {
            const { error } = await supabaseClient.from('produk').delete().eq('id', id);
            if (error) { console.error('Error menghapus produk:', error); alert('Gagal menghapus produk!'); } 
            else { loadProduk(); }
        }
    };

    const editProduk = async (id) => {
        const { data: produk, error } = await supabaseClient.from('produk').select('*').eq('id', id).single();
        if (error) { console.error('Error mengambil data produk:', error); return; }
        isEditingProduk = true;
        editingProdukId = id;
        produkNamaInput.value = produk.nama_produk;
        produkKategoriInput.value = produk.kategori || 'Minuman';
        overheadCostInput.value = produk.overhead_cost || 0;
        overheadTypeInput.value = produk.overhead_cost_type || 'nominal';
        laborCostInput.value = produk.labor_cost || 0;
        errorCostPercentInput.value = produk.error_cost_percent || 0;
        targetMarginPercentInput.value = produk.target_margin_percent || 0;
        hargaJualAktualInput.value = produk.harga_jual_aktual || 0;
        resepTableBody.innerHTML = '';
        if (produk.resep) {
            produk.resep.forEach(item => {
                tambahBahanKeResep(item.bahan_id, item.jumlah);
            });
        }
        updatePerhitunganTotal();
        
        // Pindah ke halaman kalkulator
        mainNav.querySelector('[data-page="page-kalkulator"]').click();
        document.getElementById('kalkulator-container').scrollIntoView({ behavior: 'smooth' });
    };

    const resetFormHpp = () => {
        isEditingProduk = false;
        editingProdukId = null;
        hppForm.reset();
        resepTableBody.innerHTML = '';
        updatePerhitunganTotal();
    };

    // === EVENT LISTENERS ===
    const setupEventListeners = () => {
        if (signupForm) { signupForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('signup-email').value; const password = document.getElementById('signup-password').value; const { error } = await supabaseClient.auth.signUp({ email, password }); if (error) { alert('Error mendaftar: ' + error.message); } else { alert('Pendaftaran berhasil! Cek email untuk verifikasi.'); } }); }
        if (loginForm) { loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) { alert('Error login: ' + error.message); } }); }
        if (logoutButton) { logoutButton.addEventListener('click', async () => { await supabaseClient.auth.signOut(); }); }
        if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }
        if (masterBahanTableBody) { masterBahanTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('button-delete')) { hapusBahanBaku(event.target.getAttribute('data-id')); } if (event.target.classList.contains('button-edit')) { openEditModal(event.target.getAttribute('data-id')); } }); }
        if (editBahanForm) { editBahanForm.addEventListener('submit', simpanPerubahanBahan); }
        if (cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.classList.add('hidden'); }); }
        if (addResepItemBtn) { addResepItemBtn.addEventListener('click', () => tambahBahanKeResep()); }
        if (hppForm) { hppForm.addEventListener('submit', simpanProduk); }
        if (produkTableBody) { produkTableBody.addEventListener('click', (event) => { const target = event.target; const id = target.getAttribute('data-id'); if (target.classList.contains('button-delete')) { hapusProduk(id); } if (target.classList.contains('button-edit')) { editProduk(id); } }); }

        const calculationInputs = [overheadCostInput, overheadTypeInput, laborCostInput, errorCostPercentInput, targetMarginPercentInput, hargaJualAktualInput];
        calculationInputs.forEach(element => {
            if (element) {
                element.addEventListener('input', updatePerhitunganTotal);
                element.addEventListener('change', updatePerhitunganTotal);
            }
        });
        if (resepTableBody) {
            resepTableBody.addEventListener('change', (event) => { if (event.target.classList.contains('bahan-resep-dropdown')) { updatePerhitunganTotal(); } });
            resepTableBody.addEventListener('input', (event) => { if (event.target.classList.contains('jumlah-resep')) { updatePerhitunganTotal(); } });
            resepTableBody.addEventListener('click', (event) => { if (event.target.classList.contains('hapus-resep-item')) { event.target.closest('tr').remove(); updatePerhitunganTotal(); } });
        }
        if (mainNav) {
            mainNav.addEventListener('click', (event) => {
                if (event.target.classList.contains('nav-button')) {
                    const targetPageId = event.target.getAttribute('data-page');
                    pages.forEach(page => page.classList.remove('active'));
                    mainNav.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                    document.getElementById(targetPageId).classList.add('active');
                    event.target.classList.add('active');
                }
            });
        }
    };
    
    // === INISIALISASI APLIKASI ===
    const initApp = async () => {
        setupEventListeners();
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUI(session?.user);
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateUI(session?.user);
        });
    };

    initApp();
});
