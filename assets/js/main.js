document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================
       HERO SLIDESHOW
    ===================================== */
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    let currentSlide = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));

    if (slides.length > 0 && !slides[currentSlide].classList.contains("active")) {
        slides[currentSlide].classList.add("active");
    }

    slides.forEach(slide => {
        slide.addEventListener("error", () => {
            slide.dataset.failed = "true";
            if (slides[currentSlide] === slide) {
                changeSlide();
            }
        });

        const preloader = new Image();
        preloader.src = slide.src;
    });

    function isSlideReady(slide) {
        return slide.dataset.failed !== "true" && slide.complete && slide.naturalWidth > 0;
    }

    function changeSlide() {
        if (slides.length < 2) return;

        let nextIndex = currentSlide;
        let checked = 0;

        while (checked < slides.length) {
            nextIndex = (nextIndex + 1) % slides.length;
            checked++;
            if (isSlideReady(slides[nextIndex])) {
                slides[currentSlide].classList.remove("active");
                slides[nextIndex].classList.add("active");
                currentSlide = nextIndex;
                return;
            }
        }
    }

    if (slides.length > 1 && !prefersReducedMotion) {
        setInterval(() => {
            if (!document.hidden) {
                changeSlide();
            }
        }, 4000);
    }

    /* =====================================
       MOBILE NAVIGATION
    ===================================== */
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {
        const setMenuState = (open) => {
            navMenu.classList.toggle("open", open);
            menuToggle.setAttribute("aria-expanded", String(open));
        };

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            setMenuState(!navMenu.classList.contains("open"));
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => setMenuState(false));
        });

        document.addEventListener("click", (event) => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenuState(false);
            }
        });
    }

    /* =====================================
       STATS COUNTER
    ===================================== */
    const statNumbers = document.querySelectorAll(".stat-number[data-count]");

    statNumbers.forEach(el => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";

        if (prefersReducedMotion || Number.isNaN(target)) {
            el.textContent = `${target.toLocaleString()}${suffix}`;
            return;
        }

        const duration = 1200;
        const startTime = performance.now();

        function updateCount(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = `${value.toLocaleString()}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = `${target.toLocaleString()}${suffix}`;
            }
        }

        requestAnimationFrame(updateCount);
    });

    /* =====================================
       SAMPLE CAREER OPPORTUNITIES
    ===================================== */
    const vacanciesGrid = document.getElementById("vacanciesGrid");
    const sampleVacancies = [
        {
            tag: "Full Time",
            title: "About this career",
            company: "Bindura University of Science and Education offers many full time opportunities across different faculties and departments",
            meta: "Apply via our job Portal",
            
        },
        {
            tag: "Graduate Traineeship",
            title: "About this career",
            company: "Bindura University of Science and Education offers many Graduate Traineeship across different faculties and departments",
            meta: "Apply via our job Portal",
            
        },
        {
            tag: "Internships",
            title: "About this career",
            company: "Bindura University of Science and Education offers many Internship opportunities across different faculties and departments",
            meta: "Apply via our job Portal",
            
        },
       
    ];

    if (vacanciesGrid) {
        vacanciesGrid.innerHTML = sampleVacancies.map(item => `
            <article class="vacancy-card">
                <span class="vacancy-tag">${item.tag}</span>
                <h3>${item.title}</h3>
                <p class="vacancy-company">${item.company}</p>
                <div class="vacancy-footer">
                    <span>${item.meta}</span>
                    
                </div>
            </article>
        `).join("");
    }

    /* =====================================
       FOOTER YEAR
    ===================================== */
    const currentYear = document.getElementById("currentYear");
    if (currentYear) {
        currentYear.textContent = String(new Date().getFullYear());
    }
});

/* ==========================================================
   MEET THE VOICES: carousel, reveal animation and bio popup
   ========================================================== */
(function () {
  const section = document.getElementById('voices');
  const track = document.getElementById('voicesTrack');
  if (!section || !track) return;

  const cards = [...track.querySelectorAll('.voice-card, .voice-cardd')];

  const prev = section.querySelector('.voices-prev');
  const next = section.querySelector('.voices-next');
  const dialog = document.getElementById('voiceDialog');
  const dialogPhoto = document.getElementById('voiceDialogPhoto');
  const dialogName = document.getElementById('voiceDialogName');
  const dialogShow = document.getElementById('voiceDialogShow');
  const dialogBio = document.getElementById('voiceDialogBio');

  // If a photo is missing, remove it so the coloured card with the initial shows.
  cards.forEach(card => {
    const img = card.querySelector('.voice-photo img');
    if (!img) return;
    const drop = () => img.remove();
    img.addEventListener('error', drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });

  // Arrows: scroll one card at a time.
  function stepSize() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }
  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  // Cards pop in one after another as they scroll into view.
  if ('IntersectionObserver' in window) {
    section.classList.add('reveal-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const index = cards.indexOf(card);
        card.style.transitionDelay = `${(index % 4) * 110}ms`;
        card.classList.add('is-visible');
        // Clear the delay after the reveal so hover stays snappy.
        setTimeout(() => { card.style.transitionDelay = ''; }, 1200);
        observer.unobserve(card);
      });
    }, { root: null, threshold: 0.2 });
    cards.forEach(card => observer.observe(card));
  }

  // "See Bio" popup.
  track.addEventListener('click', e => {
    const button = e.target.closest('.voice-bio-btn');
    if (!button || !dialog || typeof dialog.showModal !== 'function') return;
    const card = button.closest('.voice-card');
    const img = card.querySelector('.voice-photo img');

    dialogName.textContent = card.dataset.name;
    dialogShow.textContent = card.dataset.show;
    dialogBio.textContent = card.dataset.bio;

    if (img) {
      dialogPhoto.style.backgroundImage = `url("${img.src}")`;
      dialogPhoto.textContent = '';
    } else {
      dialogPhoto.style.backgroundImage = '';
      dialogPhoto.textContent = card.dataset.name.charAt(0);
    }
    dialog.showModal();
  });

  if (dialog) {
    dialog.addEventListener('click', e => {
      // Clicking the dark backdrop or the × closes the popup.
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
  }
})();

// 1. FLUCTUATING BARS - random height every 1.2 seconds, forever
  function fluctuateBars(containerId, min, max) {
    const bars = document.querySelectorAll(`#${containerId} .bar`);
    setInterval(() => {
      bars.forEach(bar => {
        const randomHeight = Math.floor(Math.random() * (max - min + 1)) + min;
        bar.style.height = randomHeight + '%';
      });
    }, 1200);
  }
  fluctuateBars('bars1', 20, 100);
  fluctuateBars('bars2', 25, 95);

  // 2. FLUCTUATING COUNTER - 10,000 goes up and down slightly, like live data
  let alumni = 10000;
  setInterval(() => {
    alumni += Math.floor(Math.random() * 21) - 5; // -5 to +15
    if (alumni < 9950) alumni = 9950;
    if (alumni > 10400) alumni = 10400;
    document.getElementById('alumniCount').innerText = alumni.toLocaleString();
  }, 1500);

  // 3. YEARS - subtle pulse 20 -> 21 -> 20, just for life
  let years = 20;
  setInterval(() => {
    years = years === 20 ? 21 : 20;
    document.getElementById('yearsCount').innerText = years;
  }, 3000);

  // 4. FACULTIES - 10 -> 11 -> 10
  let fac = 10;
  setInterval(() => {
    fac = fac === 10 ? 11 : 10;
    document.getElementById('facultyCount').innerText = fac;
  }, 4000);