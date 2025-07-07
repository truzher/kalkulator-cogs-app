// File: app.js (VERSI FINAL DENGAN FIX EKSPLISIT USER ID)

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = 'https://ubfbsmhyshosiihaewis.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmJzbWh5c2hvc2lpaGFld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzEwNjEsImV4cCI6MjA2NzQ0NzA2MX0.6mSpqn-jeS4Ix-2ZhBXFygPzxrQMQhCDzxyOgG5L9ss';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === VARIABEL GLOBAL ===
let currentUser = null;

// === DOM ELEMENTS ===
// ... (semua elemen lama tetap sama)
const masterBahanForm = document.getElementById('master-bahan-form');
const masterBahanTableBody = document.getElementById('master-bahan-table-body');
// ▼▼▼ DOM ELEMENT BARU UNTUK MODAL EDIT ▼▼▼
const editModal = document.getElementById('edit-modal');
const editBahanForm = document.getElementById('edit-bahan-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');


// === FUNGSI-FUNGSI APLIKASI ===

const loadBahanBaku = async () => { /* ...kode tetap sama... */ };
const simpanBahanBaku = async (event) => { /* ...kode tetap sama... */ };
const hapusBahanBaku = async (id) => { /* ...kode tetap sama... */ };

// ▼▼▼ FUNGSI BARU UNTUK FITUR EDIT ▼▼▼
const openEditModal = async (id) => {
    // 1. Ambil data spesifik dari bahan yang mau diedit
    const { data, error } = await supabaseClient
        .from('bahan_baku')
        .select('*')
        .eq('id', id)
        .single(); // .single() untuk mengambil satu baris saja

    if (error) {
        console.error('Error mengambil data untuk diedit:', error);
        return;
    }

    // 2. Isi form di dalam modal dengan data tersebut
    document.getElementById('edit-bahan-id').value = data.id;
    document.getElementById('edit-bahan-nama').value = data.nama;
    document.getElementById('edit-bahan-satuan').value = data.satuan;
    document.getElementById('edit-bahan-harga').value = data.harga_satuan;

    // 3. Tampilkan modalnya
    editModal.classList.remove('hidden');
};

const simpanPerubahanBahan = async (event) => {
    event.preventDefault();
    const idToUpdate = document.getElementById('edit-bahan-id').value;
    const namaBahan = document.getElementById('edit-bahan-nama').value;
    const satuanBahan = document.getElementById('edit-bahan-satuan').value;
    const hargaBahan = document.getElementById('edit-bahan-harga').value;

    const { error } = await supabaseClient
        .from('bahan_baku')
        .update({ nama: namaBahan, satuan: satuanBahan, harga_satuan: hargaBahan })
        .eq('id', idToUpdate);
    
    if (error) {
        console.error('Error menyimpan perubahan:', error);
        alert('Gagal menyimpan perubahan!');
    } else {
        console.log('Perubahan berhasil disimpan');
        editModal.classList.add('hidden'); // Sembunyikan modal
        loadBahanBaku(); // Muat ulang tabel
    }
};

// === EVENT LISTENERS ===
if (masterBahanForm) { masterBahanForm.addEventListener('submit', simpanBahanBaku); }

masterBahanTableBody.addEventListener('click', (event) => {
    // Cek tombol hapus
    if (event.target.classList.contains('button-delete')) {
        const idToDelete = event.target.getAttribute('data-id');
        hapusBahanBaku(idToDelete);
    }
    // ▼▼▼ LOGIKA BARU: Cek tombol edit ▼▼▼
    if (event.target.classList.contains('button-edit')) {
        const idToEdit = event.target.getAttribute('data-id');
        openEditModal(idToEdit);
    }
});

// ▼▼▼ EVENT LISTENER BARU UNTUK MODAL ▼▼▼
if(editBahanForm) { editBahanForm.addEventListener('submit', simpanPerubahanBahan); }
if(cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.classList.add('hidden'); }); }

// ... Sisa kode event listener untuk auth tetap sama ...
// ... Sisa kode onAuthStateChange tetap sama ...
