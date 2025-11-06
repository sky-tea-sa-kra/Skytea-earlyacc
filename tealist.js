document.addEventListener('DOMContentLoaded', () => {
    const teaListContainer = document.getElementById('tea-list-container');
    const USER_REACTIONS_KEY = 'teaReactions'; // Kunci Local Storage untuk melacak reaksi per perangkat

    if (teaListContainer) {
        loadApprovedTeas();
    }
    
    // === Helper: Muat Reaksi Pengguna dari Local Storage ===
    function getUserReactions() {
        return JSON.parse(localStorage.getItem(USER_REACTIONS_KEY)) || {};
    }

    // === Logika utama memuat Tea yang Disetujui ===
    function loadApprovedTeas() {
        let allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        const userReactions = getUserReactions(); 
        
        // Memastikan setiap Tea yang disetujui memiliki hitungan reaksi
        allTeas = allTeas.map(tea => {
            if (tea.status === 'approved') {
                return {
                    ...tea,
                    wow_count: tea.wow_count || 0,
                    lame_count: tea.lame_count || 0,
                };
            }
            return tea;
        });

        localStorage.setItem('pendingTeas', JSON.stringify(allTeas));

        let approvedTeas = allTeas.filter(tea => tea.status === 'approved');
        
        // ==========================================================
        // V Peningkatan: Sortir Tea Berdasarkan Skor Popularitas V
        // ==========================================================
        approvedTeas.sort((a, b) => {
            // Hitung skor sederhana (Wow - Lame)
            const scoreA = a.wow_count - a.lame_count;
            const scoreB = b.wow_count - b.lame_count;

            // Urutkan dari skor tertinggi (populer) ke terendah
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            
            // Jika skor sama, urutkan dari yang terbaru (ID lebih besar karena menggunakan Date.now())
            return b.id - a.id;
        });
        // ==========================================================


        teaListContainer.innerHTML = ''; 

        if (approvedTeas.length === 0) {
            teaListContainer.innerHTML = `
                <div class="submission-form-container" style="background-color: #1a1a1a; text-align: center; margin-top: 20px;">
                    <h3 style="margin-bottom: 5px;">Belum Ada Tea yang Dipublikasikan ☕</h3>
                    <p class="subtitle">Admin belum menyetujui Tea apa pun. Coba lagi nanti!</p>
                </div>
            `;
            return;
        }

        approvedTeas.forEach(tea => {
            const hasReacted = userReactions[tea.id];
            const reactionText = hasReacted 
                ? `Anda sudah bereaksi: ${hasReacted === 'wow' ? '🤩 Wow' : '🙄 Lame'}` 
                : 'Berikan reaksi Anda!';

            const wowDisabled = hasReacted ? 'disabled' : '';
            const lameDisabled = hasReacted ? 'disabled' : '';

            const teaElement = document.createElement('div');
            teaElement.className = 'tea-management-item submission-form-container'; // Menggunakan gaya yang sama

            teaElement.innerHTML = `
                <div class="tea-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #5d5dff;">
                        Tentang ${tea.person_name} (${tea.person_class})
                    </h3>
                    <span style="font-size: 0.8rem; opacity: 0.7;">
                        ${new Date(tea.timestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                
                <p style="white-space: pre-wrap; margin-bottom: 20px; font-style: italic;">${tea.the_tea}</p>
                
                <p style="font-size: 0.9rem; margin-bottom: 10px; opacity: 0.8; text-align: right;">${reactionText}</p>
                
                <div class="tea-reactions">
                    <button class="reaction-button ${wowDisabled}" data-id="${tea.id}" data-reaction="wow" ${wowDisabled ? 'disabled' : ''}>
                        🤩 Wow 
                        <span class="reaction-count" id="wow-count-${tea.id}">${tea.wow_count}</span>
                    </button>
                    <button class="reaction-button ${lameDisabled}" data-id="${tea.id}" data-reaction="lame" ${lameDisabled ? 'disabled' : ''}>
                        🙄 Lame 
                        <span class="reaction-count" id="lame-count-${tea.id}">${tea.lame_count}</span>
                    </button>
                </div>
            `;
            teaListContainer.appendChild(teaElement);
        });

        // Daftarkan event listeners setelah elemen Tea dimuat
        document.querySelectorAll('.reaction-button:not(.disabled)').forEach(button => {
            button.addEventListener('click', handleReaction);
        });
    }
    
    // ... sisa fungsi handleReaction tetap sama ...
    function handleReaction(event) {
        // ... kode fungsi handleReaction yang sudah ada ...
    }

    // Panggil loadApprovedTeas untuk pertama kali
    loadApprovedTeas(); 

    // === Logika penanganan Reaksi ===
    function handleReaction(event) {
        // ... (kode fungsi handleReaction yang sudah ada)
        const button = event.currentTarget;
        const id = button.dataset.id;
        const reactionType = button.dataset.reaction; // 'wow' or 'lame'

        let allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        const userReactions = getUserReactions(); // Muat reaksi pengguna

        // 1. Periksa apakah pengguna sudah bereaksi terhadap Tea ini
        if (userReactions[id]) {
            alert("Anda hanya dapat bereaksi sekali per Tea!");
            return;
        }
        
        const teaIndex = allTeas.findIndex(tea => tea.id == id);

        if (teaIndex !== -1) {
            // 1. Naikkan hitungan reaksi yang dipilih
            if (reactionType === 'wow') {
                allTeas[teaIndex].wow_count = (allTeas[teaIndex].wow_count || 0) + 1;
            } else if (reactionType === 'lame') {
                allTeas[teaIndex].lame_count = (allTeas[teaIndex].lame_count || 0) + 1;
            }

            // 2. Tandai reaksi pengguna di Local Storage
            userReactions[id] = reactionType;
            localStorage.setItem(USER_REACTIONS_KEY, JSON.stringify(userReactions));

            // 3. Simpan kembali array Tea yang diperbarui ke Local Storage
            localStorage.setItem('pendingTeas', JSON.stringify(allTeas));
            
            // 4. Perbarui tampilan
            const currentCount = allTeas[teaIndex][`${reactionType}_count`];
            const countElement = document.getElementById(`${reactionType}-count-${id}`);
            if (countElement) {
                countElement.textContent = currentCount;
            }
            
            // 5. Nonaktifkan semua tombol reaksi untuk Tea ini
            // Muat ulang daftar untuk memastikan semua state disinkronkan, termasuk teks reaksi.
            // Panggil loadApprovedTeas() lagi agar Tea yang baru berinteraksi disortir dengan benar.
            loadApprovedTeas(); 

            // alert(`Reaksi '${reactionType.toUpperCase()}' Anda telah dicatat!`);

            // Opsional: berikan umpan balik visual (tidak perlu jika memuat ulang)
        }
    }
});