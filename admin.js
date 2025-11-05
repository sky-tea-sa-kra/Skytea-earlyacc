document.addEventListener('DOMContentLoaded', () => {
    // === Konfigurasi & Elemen DOM ===
    const loginButton = document.getElementById('login-button');
    const loginArea = document.getElementById('admin-login-area');
    const adminPanel = document.getElementById('admin-panel');
    const panelPendingContainer = document.getElementById('admin-panel-container'); // Container for Pending
    const panelApprovedContainer = document.getElementById('admin-approved-container'); // Container for Approved (for Deletion)
    
    const SECRET_PASSWORD = "Skytea2025"; 

    // === Logika Password Admin ===
    if (loginButton && adminPanel) {
        loginButton.addEventListener('click', () => {
            const password = prompt("Masukkan kata sandi Admin:");
            if (password === SECRET_PASSWORD) {
                alert("Akses Admin Diberikan!");
                loginArea.style.display = 'none';
                adminPanel.style.display = 'block';
                // Muat kedua daftar setelah login
                loadPendingTeas(); 
                loadApprovedTeasForManagement(); 
            } else if (password !== null) {
                alert("Kata sandi salah!");
            }
        });
    }
    
    // === Logika Perbarui Status Tea (Approve/Reject) ===
    function updateTeaStatus(id, newStatus) {
        let allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        
        const teaIndex = allTeas.findIndex(tea => tea.id == id);

        if (teaIndex !== -1) {
            allTeas[teaIndex].status = newStatus;

            // Jika diapprove, pastikan hitungan reaksi dimulai dari 0 jika belum ada
            if (newStatus === 'approved') {
                allTeas[teaIndex].wow_count = allTeas[teaIndex].wow_count || 0;
                allTeas[teaIndex].lame_count = allTeas[teaIndex].lame_count || 0;
            }

            localStorage.setItem('pendingTeas', JSON.stringify(allTeas));
            
            alert(`Tea ID ${id} telah di-${newStatus}.`);

            // Muat ulang kedua daftar setelah pembaruan status
            loadPendingTeas(); 
            loadApprovedTeasForManagement(); 
        }
    }

    // === Logika Muat Tea yang Tertunda (Pending) ===
    function loadPendingTeas() {
        if (!panelPendingContainer) return;

        const allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        const pendingTeas = allTeas.filter(tea => tea.status === 'pending');

        panelPendingContainer.innerHTML = ''; // Bersihkan kontainer

        if (pendingTeas.length === 0) {
            panelPendingContainer.innerHTML = `
                <div class="tea-management-item">
                    <p class="subtitle" style="text-align: center;">Tidak ada Tea yang menunggu persetujuan.</p>
                </div>
            `;
            return;
        }

        pendingTeas.reverse().forEach(tea => { 
            const teaElement = document.createElement('div');
            teaElement.classList.add('tea-management-item');
            teaElement.innerHTML = `
                <div class="form-group">
                    <h3>${tea.person_name} (${tea.person_class})</h3>
                    <p class="subtitle" style="margin-bottom: 15px;">ID: ${tea.id}</p>
                    
                    <textarea rows="6" style="background-color: #0d0d0d; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; color: white; border-radius: 5px; width: 100%; margin-bottom: 15px;" readonly>${tea.the_tea}</textarea>
                    
                    <div class="admin-actions">
                        <button class="admin-button approve-btn" data-id="${tea.id}">Setujui</button>
                        <button class="admin-button reject-btn" data-id="${tea.id}">Tolak</button>
                    </div>
                </div>
            `;
            panelPendingContainer.appendChild(teaElement);
        });

        // Tambahkan event listeners
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', () => updateTeaStatus(button.dataset.id, 'approved'));
        });
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', () => updateTeaStatus(button.dataset.id, 'rejected'));
        });
    }

    // === Logika Muat Tea yang Disetujui (Untuk Dihapus) ===
    function loadApprovedTeasForManagement() {
        if (!panelApprovedContainer) return;

        const allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        const approvedTeas = allTeas.filter(tea => tea.status === 'approved');

        panelApprovedContainer.innerHTML = ''; // Bersihkan kontainer

        if (approvedTeas.length === 0) {
            panelApprovedContainer.innerHTML = `
                <div class="tea-management-item">
                    <p class="subtitle" style="text-align: center;">Tidak ada Tea yang disetujui untuk dikelola.</p>
                </div>
            `;
            return;
        }

        approvedTeas.reverse().forEach(tea => { 
            const teaElement = document.createElement('div');
            teaElement.classList.add('tea-management-item');
            teaElement.innerHTML = `
                <div class="form-group">
                    <h3>${tea.person_name} (${tea.person_class})</h3>
                    <p class="subtitle" style="margin-bottom: 15px;">ID: ${tea.id}</p>
                    <p>Wow: ${tea.wow_count || 0}, Lame: ${tea.lame_count || 0}</p>

                    <textarea rows="6" style="background-color: #0d0d0d; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; color: white; border-radius: 5px; width: 100%; margin-bottom: 15px;" readonly>${tea.the_tea}</textarea>
                    
                    <div class="admin-actions">
                        <button class="admin-button delete-btn" data-id="${tea.id}">Hapus Permanen</button>
                    </div>
                </div>
            `;
            panelApprovedContainer.appendChild(teaElement);
        });

        // Tambahkan event listeners untuk tombol hapus
        document.querySelectorAll('.delete-btn').forEach(button => {
            if (button.closest('#admin-approved-container')) {
                button.addEventListener('click', () => deleteTea(button.dataset.id));
            }
        });
    }

    // === Logika HAPUS PERMANEN Tea ===
    function deleteTea(id) {
        if (!confirm(`Yakin ingin MENGHAPUS Tea ID ${id} secara PERMANEN? Tea akan hilang dari semua halaman. Aksi ini tidak bisa dibatalkan.`)) {
            return;
        }
        
        let allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        
        // Filter out the tea to be deleted
        const updatedTeas = allTeas.filter(tea => tea.id != id);
        
        // Simpan array baru ke Local Storage
        localStorage.setItem('pendingTeas', JSON.stringify(updatedTeas));
        
        alert(`Tea dengan ID ${id} telah dihapus permanen.`);
        
        // Muat ulang daftar Approved Management
        loadApprovedTeasForManagement(); 
    }
});