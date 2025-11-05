document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tea-submission-form');

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Menghentikan reload halaman

            // 1. Kumpulkan data dari formulir
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Objek submission untuk Local Storage
            const submission = {
                id: Date.now(), // ID unik
                person_name: data.person_name,
                person_class: data.person_class,
                the_tea: data.the_tea,
                status: 'pending', // Status awal
                timestamp: new Date().toISOString()
            };

            // 2. Muat kiriman yang sudah ada dari Local Storage
            const existingTeas = JSON.parse(localStorage.getItem('pendingTeas')) || [];
            
            // 3. Tambahkan kiriman baru dan simpan kembali
            existingTeas.push(submission);
            localStorage.setItem('pendingTeas', JSON.stringify(existingTeas));
            
            // 4. Kirim data ke Web3Forms menggunakan fetch
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    alert("Tea berhasil dikirim dan menunggu persetujuan!");
                    form.reset(); // Reset formulir HANYA setelah sukses
                } else {
                    alert(`Error: ${result.message}. Data Anda sudah disimpan secara lokal.`);
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert("Terjadi kesalahan jaringan. Data Anda sudah disimpan secara lokal.");
            }
        });
    }
});