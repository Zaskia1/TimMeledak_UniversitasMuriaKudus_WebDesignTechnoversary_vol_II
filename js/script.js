// Inisialisasi ikon Lucide
    lucide.createIcons();

    // State Tabungan Sampah (Tersimpan di LocalStorage)
    let deposits = JSON.parse(localStorage.getItem('umk_ecobank_deposits_v1')) || [];
    let savedNim = localStorage.getItem('umk_ecobank_nim_v1') || '';

    // ---------------------------------------------------------
    // 1. SISTEM NAVIGASI MULTI-HALAMAN (SPA VIEW SWITCHER)
    // ---------------------------------------------------------
    function navigateTo(pageId) {
      // Sembunyikan semua halaman
      document.querySelectorAll('.page-view').forEach(section => {
        section.classList.remove('active');
      });

      // Tampilkan halaman target
      const targetSection = document.getElementById(`view-${pageId}`);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Update status aktif di Desktop Navbar
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('active');
        }
      });

      // Update status aktif di Mobile Navbar
      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('bg-eco-soft', 'text-eco-primary', 'font-semibold');
          link.classList.remove('text-slate-600', 'font-medium');
        } else {
          link.classList.remove('bg-eco-soft', 'text-eco-primary', 'font-semibold');
          link.classList.add('text-slate-600', 'font-medium');
        }
      });

      // Tutup menu mobile jika terbuka
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }

      // Scroll mulus ke atas
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Jalankan ulang animasi counter jika kembali ke Home
      if (pageId === 'home') {
        animateCounters();
      }
    }

    // Toggle Menu Mobile
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
      document.getElementById('mobileMenu').classList.toggle('hidden');
    });

    // ---------------------------------------------------------
    // 2. TOAST NOTIFICATION (Pengganti alert() yang modern)
    // ---------------------------------------------------------
    function showToast(title, message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const isSuccess = type === 'success';

      toast.className = `pointer-events-auto bg-white border-l-4 ${isSuccess ? 'border-eco-primary' : 'border-amber-500'} rounded-xl shadow-xl p-4 flex items-start gap-3 transform transition-all duration-300 translate-y-2 opacity-0`;
      toast.innerHTML = `
        <div class="w-8 h-8 rounded-lg ${isSuccess ? 'bg-eco-light text-eco-primary' : 'bg-amber-100 text-amber-700'} flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="${isSuccess ? 'check-circle-2' : 'alert-circle'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-slate-900">${title}</h4>
          <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">${message}</p>
        </div>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      // Trigger animasi masuk
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      // Hapus otomatis setelah 4 detik
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // ---------------------------------------------------------
    // 3. ANIMASI COUNTER STATISTIK (Halaman Home)
    // ---------------------------------------------------------
    function animateCounters() {
      const counters = document.querySelectorAll('.stat-counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const duration = 1200; // ms
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeProgress * target);

          counter.textContent = currentVal.toLocaleString('id-ID');

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.textContent = target.toLocaleString('id-ID');
          }
        }
        requestAnimationFrame(update);
      });
    }

    // ---------------------------------------------------------
    // 4. FILTER KATALOG SAMPAH (Halaman Edukasi)
    // ---------------------------------------------------------
    function filterCatalog(category, btnElement) {
      // Update style tombol aktif
      document.querySelectorAll('.catalog-filter-btn').forEach(btn => {
        btn.classList.remove('bg-eco-primary', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      });
      btnElement.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      btnElement.classList.add('bg-eco-primary', 'text-white', 'shadow-sm');

      // Filter kartu katalog
      document.querySelectorAll('.catalog-card').forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Pintasan dari Katalog ke Kalkulator Simulasi
    function quickSelectWaste(priceValue) {
      navigateTo('simulasi');
      const selectEl = document.getElementById('wasteType');
      if (selectEl) {
        selectEl.value = priceValue;
        updateLiveEstimate();
        document.getElementById('wasteWeight').focus();
      }
    }

    // ---------------------------------------------------------
    // 5. KALKULATOR & STRUK DIGITAL (Halaman Simulasi)
    // ---------------------------------------------------------
    function updateLiveEstimate() {
      const pricePerKg = parseFloat(document.getElementById('wasteType').value) || 0;
      const weight = parseFloat(document.getElementById('wasteWeight').value) || 0;
      const badge = document.getElementById('livePreviewBadge');

      if (weight > 0) {
        const estRp = Math.round(pricePerKg * weight);
        const estPts = Math.round(weight * 10);
        badge.textContent = `Estimasi: Rp ${estRp.toLocaleString('id-ID')} • +${estPts} Poin`;
      } else {
        badge.textContent = `Estimasi: Rp 0 • +0 Poin`;
      }
    }

    function renderDeposits() {
      const listEl = document.getElementById('receiptList');
      const ownerEl = document.getElementById('receiptOwnerLabel');
      const totalWeightEl = document.getElementById('totalWeightDisplay');
      const totalPointsEl = document.getElementById('totalPointsDisplay');
      const totalRupiahEl = document.getElementById('totalRupiahDisplay');

      if (!listEl) return;

      ownerEl.textContent = savedNim ? `Nasabah: ${savedNim}` : 'Nasabah: Belum diisi';
      listEl.innerHTML = '';

      let sumWeight = 0;
      let sumPoints = 0;
      let sumRupiah = 0;

      if (deposits.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-8 px-4 bg-white/70 rounded-2xl border border-eco-primary/10">
            <p class="text-sm text-slate-500">Belum ada item sampah ditambahkan.</p>
            <p class="text-xs text-slate-400 mt-1">Isi form di sebelah kiri untuk mulai menghitung tabunganmu.</p>
          </div>
        `;
      } else {
        deposits.forEach((item, idx) => {
          sumWeight += item.weight;
          sumPoints += item.points;
          sumRupiah += item.subtotal;

          const itemCard = document.createElement('div');
          itemCard.className = 'bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs';
          itemCard.innerHTML = `
            <div>
              <h4 class="text-sm font-bold text-slate-900">${item.name}</h4>
              <p class="text-xs text-slate-500 mt-0.5">${item.weight} kg × Rp ${item.pricePerKg.toLocaleString('id-ID')} • <span class="text-eco-primary font-semibold">+${item.points} Poin</span></p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-extrabold text-slate-900">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
              <button onclick="removeDepositItem(${idx})" title="Hapus item" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          `;
          listEl.appendChild(itemCard);
        });
        lucide.createIcons();
      }

      totalWeightEl.textContent = `${sumWeight.toFixed(1)} Kg`;
      totalPointsEl.textContent = `+${sumPoints} EcoPoin`;
      totalRupiahEl.textContent = `Rp ${sumRupiah.toLocaleString('id-ID')}`;
    }

    function removeDepositItem(index) {
      deposits.splice(index, 1);
      localStorage.setItem('umk_ecobank_deposits_v1', JSON.stringify(deposits));
      renderDeposits();
      showToast('Item Dihapus', 'Item sampah dihapus dari ringkasan setor.', 'warning');
    }

    function resetDeposits() {
      if (deposits.length === 0) return;
      deposits = [];
      localStorage.removeItem('umk_ecobank_deposits_v1');
      renderDeposits();
      showToast('Daftar Direset', 'Semua item simulasi setor telah dikosongkan.', 'warning');
    }

    // Submit Form Simulasi
    document.getElementById('depositForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const nimInput = document.getElementById('studentNim').value.trim();
      const selectEl = document.getElementById('wasteType');
      const weightInput = parseFloat(document.getElementById('wasteWeight').value);

      if (!nimInput) {
        showToast('Data Belum Lengkap', 'Silakan masukkan NIM atau nama unit Ormawa.', 'warning');
        return;
      }

      if (isNaN(weightInput) || weightInput <= 0) {
        showToast('Berat Tidak Valid', 'Masukkan perkiraan berat minimal 0.1 kg.', 'warning');
        return;
      }

      const pricePerKg = parseInt(selectEl.value, 10);
      const wasteName = selectEl.options[selectEl.selectedIndex].getAttribute('data-name');
      const subtotal = Math.round(pricePerKg * weightInput);
      const points = Math.round(weightInput * 10);

      savedNim = nimInput;
      localStorage.setItem('umk_ecobank_nim_v1', savedNim);

      deposits.push({
        name: wasteName,
        pricePerKg: pricePerKg,
        weight: weightInput,
        subtotal: subtotal,
        points: points
      });

      localStorage.setItem('umk_ecobank_deposits_v1', JSON.stringify(deposits));
      renderDeposits();

      // Reset input berat saja
      document.getElementById('wasteWeight').value = '';
      updateLiveEstimate();
      showToast('Berhasil Ditambahkan', `${wasteName} (${weightInput} kg) masuk ke daftar setor.`);
    });

    // Modal Tiket Setor Digital
    function openReceiptModal() {
      if (deposits.length === 0) {
        showToast('Daftar Masih Kosong', 'Tambahkan minimal satu jenis sampah terlebih dahulu.', 'warning');
        return;
      }

      const totalRp = deposits.reduce((acc, item) => acc + item.subtotal, 0);
      const totalPts = deposits.reduce((acc, item) => acc + item.points, 0);
      const totalKg = deposits.reduce((acc, item) => acc + item.weight, 0);
      const ticketCode = 'UMK-' + Math.floor(100000 + Math.random() * 900000);

      const modalBody = document.getElementById('modalReceiptBody');
      modalBody.innerHTML = `
        <div class="flex justify-between border-b border-eco-primary/15 pb-2">
          <span class="text-slate-500">Kode Tiket:</span>
          <span class="font-mono font-bold text-eco-dark">${ticketCode}</span>
        </div>
        <div class="flex justify-between border-b border-eco-primary/15 pb-2">
          <span class="text-slate-500">Penyetor:</span>
          <span class="font-bold text-slate-900">${savedNim || 'Civitas UMK'}</span>
        </div>
        <div class="flex justify-between border-b border-eco-primary/15 pb-2">
          <span class="text-slate-500">Total Berat:</span>
          <span class="font-semibold">${totalKg.toFixed(1)} Kg (${deposits.length} jenis)</span>
        </div>
        <div class="flex justify-between border-b border-eco-primary/15 pb-2">
          <span class="text-slate-500">Bonus EcoPoin:</span>
          <span class="font-bold text-eco-primary">+${totalPts} Poin</span>
        </div>
        <div class="flex justify-between pt-1 text-base font-extrabold text-eco-dark">
          <span>Estimasi Saldo:</span>
          <span>Rp ${totalRp.toLocaleString('id-ID')}</span>
        </div>
      `;

      const modal = document.getElementById('receiptModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeReceiptModal() {
      const modal = document.getElementById('receiptModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // ---------------------------------------------------------
    // 6. FORM KONTAK & REQUEST JEMPUT (Halaman Contact)
    // ---------------------------------------------------------
    document.getElementById('contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value.trim();
      const faculty = document.getElementById('senderFaculty').value.trim();
      const service = document.getElementById('serviceType').value;

      showToast(
        'Permintaan Terkirim!',
        `Terima kasih ${name} (${faculty}). Pengajuan "${service}" telah diteruskan ke petugas Bank Sampah UMK.`
      );
      e.target.reset();
    });

    // ---------------------------------------------------------
    // INISIALISASI SAAT HALAMAN DIMUAT
    // ---------------------------------------------------------
    window.addEventListener('DOMContentLoaded', () => {
      animateCounters();
      if (savedNim) {
        document.getElementById('studentNim').value = savedNim;
      }
      renderDeposits();
    });
