/* =========================================================
   DESA SUMBEREJA — Logika interaksi Vanilla JS
   ========================================================= */

// (class "js-ready" sudah ditambahkan lewat inline script di <head> tiap halaman,
// supaya aktif sebelum body sempat dirender — mencegah efek "blink" saat load)

// ---------- Page fade-in (saat halaman dibuka/refresh) ----------
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("page-ready");
  });
});

// ---------- Page fade-out (saat pindah ke halaman lain di situs ini) ----------
const FADE_OUT_MS = 300;
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  const isInternal =
    href &&
    !href.startsWith("http") &&
    !href.startsWith("mailto:") &&
    !href.startsWith("tel:") &&
    !href.startsWith("#") &&
    link.target !== "_blank";

  if (!isInternal) return;
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  e.preventDefault();
  document.documentElement.classList.add("page-leaving");
  setTimeout(() => {
    window.location.href = href;
  }, FADE_OUT_MS);
});

// Pastikan halaman tetap terlihat kalau diakses dari cache (tombol back/forward browser)
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    document.documentElement.classList.remove("page-leaving");
    document.documentElement.classList.add("page-ready");
  }
});

// ---------- Tahun footer otomatis ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Navbar mobile toggle ----------
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const masthead = document.getElementById("masthead");

// ---------- Tinggi navbar diukur otomatis ----------
const setNavHeight = () => {
  if(masthead) document.documentElement.style.setProperty("--nav-h", `${masthead.offsetHeight}px`);
};
setNavHeight();
window.addEventListener("resize", setNavHeight);
window.addEventListener("load", setNavHeight);

// ---------- Sticky navbar ----------
const heroSection = document.getElementById("beranda");

const onScroll = () => {
  if (!masthead) return;
  if (!heroSection) {
    masthead.classList.add("is-scrolled");
    return;
  }
  const threshold = heroSection.offsetHeight - masthead.offsetHeight;
  masthead.classList.toggle("is-scrolled", window.scrollY > threshold);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Accordion (Layanan Publik) ----------
const accordionItems = document.querySelectorAll(".accordion__item");
accordionItems.forEach((item) => {
  const trigger = item.querySelector(".accordion__trigger");
  const panel = item.querySelector(".accordion__panel");

  trigger.addEventListener("click", () => {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    accordionItems.forEach((other) => {
      if (other !== item) {
        other.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
        other.querySelector(".accordion__panel").style.maxHeight = null;
      }
    });
    trigger.setAttribute("aria-expanded", String(!isExpanded));
    panel.style.maxHeight = isExpanded ? null : panel.scrollHeight + "px";
  });
});

// ---------- Counter angka ----------
const counters = document.querySelectorAll(".stat-card__num");

const animateCounter = (el) => {
  const target = Number(el.dataset.count);
  const duration = 900;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString("id-ID");
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if (counters.length > 0) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((counter) => statObserver.observe(counter));
}

// ---------- Floating: Perbesar/Perkecil Teks ----------
const btnFontSize = document.getElementById("btnFontSize");
const FONT_STEPS = ["", "text-lg", "text-xl"];
const FONT_LABELS = ["Aa", "Aa⁺", "Aa⁺⁺"];
let fontStepIndex = Number(localStorage.getItem("sumbereja-font-step")) || 0;

function terapkanUkuranFont() {
  document.documentElement.classList.remove("text-lg", "text-xl");
  const step = FONT_STEPS[fontStepIndex];
  if (step) document.documentElement.classList.add(step);
  if (btnFontSize) {
    btnFontSize.textContent = FONT_LABELS[fontStepIndex];
    btnFontSize.classList.toggle("is-active", fontStepIndex > 0);
  }
  setTimeout(setNavHeight, 250);
}
terapkanUkuranFont();

if (btnFontSize) {
  btnFontSize.addEventListener("click", () => {
    fontStepIndex = (fontStepIndex + 1) % FONT_STEPS.length;
    localStorage.setItem("sumbereja-font-step", String(fontStepIndex));
    terapkanUkuranFont();
  });
}

// ---------- Floating: Kembali ke Atas ----------
const btnBackToTop = document.getElementById("btnBackToTop");
if (btnBackToTop) {
  window.addEventListener("scroll", () => { 
    btnBackToTop.hidden = window.scrollY < 480; 
  }, { passive: true });
  btnBackToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------- Scroll Reveal ----------
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---------- Carousel foto Hero ----------
const heroSlides = document.querySelectorAll(".hero__slide");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroSlides.length > 1 && !prefersReducedMotion) {
  let activeSlide = 0;
  setInterval(() => {
    heroSlides[activeSlide].classList.remove("is-active");
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides[activeSlide].classList.add("is-active");
  }, 5000);
}

// ---------- Smooth scroll kustom untuk carousel (durasi & easing konsisten di semua browser) ----------
function smoothScrollBy(el, distance, duration = 450) {
  if (prefersReducedMotion) {
    el.scrollBy({ left: distance });
    return;
  }
  const start = el.scrollLeft;
  const startTime = performance.now();
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.scrollLeft = start + distance * easeInOutCubic(progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Carousel Warta Desa ----------
const newsTrack = document.getElementById("newsTrack");
const prevNews = document.getElementById("prevNews");
const nextNews = document.getElementById("nextNews");

if (newsTrack && prevNews && nextNews) {
  const scrollAmount = () => newsTrack.querySelector(".news-card").offsetWidth + 20;
  prevNews.addEventListener("click", () => smoothScrollBy(newsTrack, -scrollAmount()));
  nextNews.addEventListener("click", () => smoothScrollBy(newsTrack, scrollAmount()));
}

// ---------- Carousel UMKM (Perdagangan) ----------
const umkmTrackEl = document.getElementById("umkmGrid");
const prevUmkm = document.getElementById("umkmPrev");
const nextUmkm = document.getElementById("umkmNext");

if (umkmTrackEl && prevUmkm && nextUmkm) {
  const umkmScrollAmount = () => (umkmTrackEl.querySelector(".umkm-card")?.offsetWidth || 280) + 20;
  prevUmkm.addEventListener("click", () => smoothScrollBy(umkmTrackEl, -umkmScrollAmount()));
  nextUmkm.addEventListener("click", () => smoothScrollBy(umkmTrackEl, umkmScrollAmount()));
}

// ---------- Dropdown "Layanan Warga" ----------
document.querySelectorAll(".masthead__dropdown").forEach((dropdown) => {
  const btn = dropdown.querySelector(".masthead__dropdown-btn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".masthead__dropdown.is-open").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector(".masthead__dropdown-btn")?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".masthead__dropdown.is-open").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".masthead__dropdown-btn")?.setAttribute("aria-expanded", "false");
    });
  }
});

// ---------- Lightbox Galeri ----------
const galleryItems = document.querySelectorAll(".gallery__item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

if (lightbox && lightboxImg && lightboxCaption && lightboxClose) {
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const imageSrc = item.getAttribute("data-image");
      const captionText = item.getAttribute("data-caption");
      lightboxImg.src = imageSrc;
      lightboxCaption.textContent = captionText || "";
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightboxImg.src = ""; 
    setTimeout(() => { lightbox.hidden = true; }, 200); 
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}

// =========================================================
// UMKM — Filter direktori
// =========================================================
(function () {
  const filterBtns = document.querySelectorAll(".umkm-filter__btn");
  const umkmGrid   = document.getElementById("umkmGrid");
  if (!filterBtns.length || !umkmGrid) return; 

  const umkmCards = umkmGrid.querySelectorAll(".umkm-card");

  umkmCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.07}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => card.classList.add("is-visible"));
    });
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      umkmGrid.scrollTo({ left: 0, behavior: "smooth" });

      umkmCards.forEach((card) => {
        const match = filter === "semua" || card.dataset.category === filter;
        if (match) {
          card.removeAttribute("hidden");
          card.classList.remove("is-visible");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add("is-visible"));
          });
        } else {
          card.setAttribute("hidden", "");
        }
      });

      const visible  = umkmGrid.querySelectorAll(".umkm-card:not([hidden])");
      const emptyMsg = umkmGrid.querySelector(".umkm-empty");
      if (visible.length === 0) {
        if (!emptyMsg) {
          const msg = document.createElement("p");
          msg.className = "umkm-empty footnote";
          msg.textContent = "Belum ada UMKM dalam kategori ini yang terdata.";
          umkmGrid.appendChild(msg);
        }
      } else {
        if (emptyMsg) emptyMsg.remove();
      }
    });
  });
})();

// =========================================================
// RIWAYAT PENGADUAN — baca & tampilkan dari localStorage
// (SENGAJA di luar IIFE form di bawah, supaya tetap jalan
//  di riwayat.html walau elemen #aduanForm tidak ada di sana)
// =========================================================
const RIWAYAT_KEY = "sumbereja_riwayat_pengaduan";
const riwayatList = document.getElementById("riwayatList");

function ambilRiwayat() {
  try {
    return JSON.parse(localStorage.getItem(RIWAYAT_KEY)) || [];
  } catch {
    return [];
  }
}

function simpanKeRiwayat(entry) {
  const daftar = ambilRiwayat();
  daftar.unshift(entry);
  localStorage.setItem(RIWAYAT_KEY, JSON.stringify(daftar.slice(0, 20)));
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatTanggal(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderRiwayat() {
  if (!riwayatList) return;
  const daftar = ambilRiwayat();

  if (daftar.length === 0) {
    riwayatList.innerHTML = `<p class="riwayat-empty">Belum ada riwayat pengaduan di perangkat ini. Riwayat akan muncul otomatis setelah Anda mengirim laporan lewat formulir di atas.</p>`;
    return;
  }

  riwayatList.innerHTML = daftar.map((item) => {
    const desc = item.deskripsi.length > 120 ? item.deskripsi.slice(0, 120) + "…" : item.deskripsi;
    return `
      <div class="riwayat-item">
        <div class="riwayat-item__top">
          <span class="riwayat-item__ref">${escapeHTML(item.ref)}</span>
          <span class="riwayat-item__date">${formatTanggal(item.tanggal)}</span>
        </div>
        <span class="riwayat-item__kategori">${escapeHTML(item.kategori)}</span>
        <p class="riwayat-item__desc">${escapeHTML(desc)}</p>
      </div>
    `;
  }).join("");
}

renderRiwayat();

// =========================================================
// PENGADUAN — logika form
// =========================================================
(function () {
  const form        = document.getElementById("aduanForm");
  if (!form) return; 

  const successView = document.getElementById("aduanSuccess");
  const refNumEl    = document.getElementById("refNum");
  const btnReset    = document.getElementById("btnReset");
  const deskripsi   = document.getElementById("deskripsi");
  const charCount   = document.getElementById("charCount");

  const NOMOR_WA_DESA = "6285218518516";
  const EMAIL_DESA    = "desasumbereja@gmail.com";
  const MAX_CHARS     = 500;

  deskripsi.addEventListener("input", () => {
    const len = deskripsi.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS} karakter`;
    charCount.classList.toggle("is-near-limit", len > MAX_CHARS * 0.9);
  });

  const requiredFields = ["nama", "dusun", "kontak", "kategori", "deskripsi"];

  function clearErrors() {
    form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("has-error"));
    form.querySelectorAll(".form-error").forEach((e) => (e.textContent = ""));
  }

  function validate() {
    clearErrors();
    let valid = true;
    requiredFields.forEach((name) => {
      const field   = form.elements[name];
      const group   = field.closest(".form-group");
      const errorEl = group.querySelector(".form-error");
      const value   = field.value.trim();
      if (!value) {
        group.classList.add("has-error");
        if (errorEl) errorEl.textContent = "Wajib diisi.";
        valid = false;
        return;
      }
      if (name === "kontak" && !/^[\d\s\-+]{9,}$/.test(value)) {
        group.classList.add("has-error");
        if (errorEl) errorEl.textContent = "Format nomor tidak valid.";
        valid = false;
      }
    });
    return valid;
  }

  function buatNomorReferensi() {
    const now    = new Date();
    const tanggal = now.toISOString().slice(0, 10).replace(/-/g, "");
    const acak    = Math.floor(100 + Math.random() * 900);
    return `SBR-${tanggal}-${acak}`;
  }

  function susunPesan(data, ref) {
    const kategoriLabel = form.elements.kategori.selectedOptions[0].text;
    const dusunLabel    = form.elements.dusun.selectedOptions[0].text;
    return (
      `*PENGADUAN/ASPIRASI WARGA — DESA SUMBEREJA*\n` +
      `No. Referensi: ${ref}\n\n` +
      `Nama: ${data.nama}\n` +
      `Kampung/Dusun: ${dusunLabel}\n` +
      `No. HP/WA: ${data.kontak}\n` +
      `Kategori: ${kategoriLabel}\n` +
      (data.lokasi ? `Lokasi spesifik: ${data.lokasi}\n` : "") +
      `\nDeskripsi:\n${data.deskripsi}\n\n` +
      `(Dikirim otomatis dari formulir website Desa Sumbereja)`
    );
  }

  let pesanTrigger = null;
  form.querySelectorAll('button[type="submit"]').forEach((btn) => {
    btn.addEventListener("click", () => { pesanTrigger = btn.id; });
  });

  function tampilkanSukses(ref, kategoriLabel, deskripsi) {
    simpanKeRiwayat({
      ref,
      tanggal: new Date().toISOString(),
      kategori: kategoriLabel,
      deskripsi,
    });
    renderRiwayat();

    refNumEl.textContent  = ref;
    form.hidden           = true;
    successView.hidden    = false;
    successView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstError) firstError.focus();
      return;
    }
    const data = {
      nama:      form.elements.nama.value.trim(),
      kontak:    form.elements.kontak.value.trim(),
      lokasi:    form.elements.lokasi.value.trim(),
      deskripsi: form.elements.deskripsi.value.trim(),
    };
    const ref            = buatNomorReferensi();
    const kategoriLabel  = form.elements.kategori.selectedOptions[0].text;
    const dusunLabel     = form.elements.dusun.selectedOptions[0].text;
    const pesan          = susunPesan(data, ref);
    const pesanEncoded   = encodeURIComponent(pesan);

    if (pesanTrigger === "btnEmail") {
      // Kirim langsung dari server (FormSubmit) supaya tidak bergantung
      // pada aplikasi email default di perangkat pengunjung.
      const emailBtn      = document.getElementById("btnEmail");
      const teksAsliBtn   = emailBtn.textContent;
      emailBtn.disabled   = true;
      emailBtn.textContent = "Mengirim...";

      fetch(`https://formsubmit.co/ajax/${EMAIL_DESA}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `Pengaduan Warga — ${ref}`,
          "No. Referensi": ref,
          Nama: data.nama,
          "Kampung/Dusun": dusunLabel,
          "No. HP/WhatsApp": data.kontak,
          Kategori: kategoriLabel,
          "Lokasi Spesifik": data.lokasi || "-",
          Deskripsi: data.deskripsi,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengirim lewat FormSubmit");
          return res.json();
        })
        .then(() => {
          emailBtn.disabled    = false;
          emailBtn.textContent = teksAsliBtn;
          tampilkanSukses(ref, kategoriLabel, data.deskripsi);
        })
        .catch(() => {
          // Fallback: kalau pengiriman via server gagal (mis. offline / diblokir),
          // buka aplikasi email lewat mailto sebagai cadangan.
          emailBtn.disabled    = false;
          emailBtn.textContent = teksAsliBtn;
          const subject = encodeURIComponent(`Pengaduan Warga — ${ref}`);
          const mailtoLink = document.createElement("a");
          mailtoLink.href = `mailto:${EMAIL_DESA}?subject=${subject}&body=${pesanEncoded}`;
          mailtoLink.click();
          tampilkanSukses(ref, kategoriLabel, data.deskripsi);
        });
    } else {
      window.open(`https://wa.me/${NOMOR_WA_DESA}?text=${pesanEncoded}`, "_blank");
      tampilkanSukses(ref, kategoriLabel, data.deskripsi);
    }
  });

  btnReset.addEventListener("click", () => {
    form.reset();
    clearErrors();
    charCount.textContent = `0 / ${MAX_CHARS} karakter`;
    successView.hidden    = true;
    form.hidden           = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();