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
        const userReactions = getUserReactions(); // Muat status reaksi pengguna
        
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

        const approvedTeas = allTeas.filter(tea => tea.status === 'approved');
        
        teaListContainer.innerHTML = ''; 

        if (approvedTeas.length === 0) {
            teaListContainer.innerHTML = `
                <div class="submission-form-container" style="background-color: #1a1a1a; text-align: center; margin-top: 20px;">
                    <h3 style="margin-bottom: 5px;">Belum Ada Tea yang Dipublikasikan.</h3>
                    <p class="subtitle">Kembali lagi nanti!</p>
                </div>
            `;
            return;
        }

        approvedTeas.reverse().forEach(tea => { // reverse() untuk menampilkan yang terbaru di atas
            const teaElement = document.createElement('div');
            teaElement.classList.add('submission-form-container', 'tea-item'); // Menggunakan class yang sama
            
            const date = new Date(tea.timestamp);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            // Periksa apakah pengguna sudah bereaksi pada Tea ini
            const userReaction = userReactions[tea.id]; // 'wow', 'lame', or undefined
            
            teaElement.innerHTML = `
                <div class="form-group">
                    <h3>${tea.person_name}</h3>
                    <p class="subtitle" style="margin-bottom: 15px;">Kelas: ${tea.person_class} | Dipublikasikan: ${formattedDate}</p>
                    
                    <textarea rows="8" style="background-color: #0d0d0d; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px; color: white; border-radius: 5px; width: 100%;" readonly>${tea.the_tea}</textarea>
                    
                    <div class="tea-reactions">
                        <button class="reaction-button ${userReaction ? 'disabled' : ''} ${userReaction === 'wow' ? 'selected' : ''}" 
                                data-id="${tea.id}" data-reaction="wow">
                            🤩 <span class="reaction-count" id="wow-count-${tea.id}">${tea.wow_count}</span>
                        </button>
                        <button class="reaction-button ${userReaction ? 'disabled' : ''} ${userReaction === 'lame' ? 'selected' : ''}" 
                                data-id="${tea.id}" data-reaction="lame">
                            😒 <span class="reaction-count" id="lame-count-${tea.id}">${tea.lame_count}</span>
                        </button>
                    </div>
                </div>
            `;
            teaListContainer.appendChild(teaElement);
        });

        // Menambahkan Event Listeners ke tombol reaksi
        document.querySelectorAll('.reaction-button').forEach(button => {
            if (!button.classList.contains('disabled')) {
                button.addEventListener('click', handleReaction);
            }
        });
    }

    // === Logika menangani klik reaksi ===
    function handleReaction(event) {
        const button = event.currentTarget;
        const id = button.dataset.id;
        const reactionType = button.dataset.reaction; // 'wow' or 'lame'

        if (button.classList.contains('disabled')) return; // Sudah bereaksi

        let userReactions = getUserReactions();
        if (userReactions[id]) { // Cek sekali lagi
            alert("Anda sudah memberikan reaksi untuk Tea ini!");
            return; 
        }

        let allTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
        const teaIndex = allTeas.findIndex(tea => tea.id == id);

        if (teaIndex !== -1) {
            // 1. Naikkan hitungan reaksi yang dipilih
            if (reactionType === 'wow') {
                allTeas[teaIndex].wow_count = (allTeas[teaIndex].wow_count || 0) + 1;
            } else if (reactionType === 'lame') {
                allTeas[teaIndex].lame_count = (allTeas[teaIndex].lame_count || 0) + 1;
            }
            
            // 2. Tandai bahwa pengguna telah bereaksi di Local Storage pengguna
            userReactions[id] = reactionType;
            localStorage.setItem(USER_REACTIONS_KEY, JSON.stringify(userReactions));

            // 3. Simpan kembali array Tea yang diperbarui
            localStorage.setItem('pendingTeas', JSON.stringify(allTeas));
            
            // 4. Perbarui tampilan hitungan
            const countElement = document.getElementById(`${reactionType}-count-${id}`);
            if (countElement) {
                countElement.textContent = allTeas[teaIndex][`${reactionType}_count`];
            }
            
            // 5. Nonaktifkan semua tombol reaksi untuk Tea ini
            const wowButton = document.querySelector(`.reaction-button[data-id="${id}"][data-reaction="wow"]`);
            const lameButton = document.querySelector(`.reaction-button[data-id="${id}"][data-reaction="lame"]`);
            
            wowButton.classList.add('disabled');
            lameButton.classList.add('disabled');
            
            // Beri sorotan pada tombol yang diklik
            if (reactionType === 'wow') {
                wowButton.classList.add('selected');
            } else {
                lameButton.classList.add('selected');
            }
        }
    }
});