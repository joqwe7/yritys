// Externalized JS (moved from index.html). Adds cart persistence to localStorage and restores on load.

(function(){
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', (!expanded).toString());
        });
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const faqContent = faqItem.querySelector('.faq-content');
            const icon = question.querySelector('svg');

            faqContent.classList.toggle('open');
            icon.classList.toggle('rotate-180');
        });
    });

    // Cart functionality (with persistence)
    const cartButton = document.getElementById('cart-button');
    const closeCart = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const continueShopping = document.getElementById('continue-shopping');
    const addToCartButton = document.getElementById('add-to-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    const pickupEventCheckbox = document.getElementById('pickup-event');
    const cartCount = document.getElementById('cart-count');

    let cart = [];

    function persistCart(){
        try {
            localStorage.setItem('valoisa_cart', JSON.stringify(cart));
        } catch(e){
            console.warn('Could not persist cart', e);
        }
    }

    function restoreCart(){
        try {
            const raw = localStorage.getItem('valoisa_cart');
            if(raw){
                cart = JSON.parse(raw);
            } else {
                cart = [];
            }
        } catch(e){
            cart = [];
            console.error('Failed to restore cart', e);
        }
    }

    function updateCart() {
        // Clear cart items
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartCount.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');

            let subtotal = 0;
            let itemCount = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                itemCount += item.quantity;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'flex justify-between items-center py-4 border-b border-gray-800';
                cartItemElement.innerHTML = `
                    <div>
                        <h4 class="font-medium">${item.name}</h4>
                        <p class="text-gray-400 text-sm">€${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="flex items-center">
                        <button class="decrease-quantity text-gray-400 hover:text-white px-2" data-id="${item.id}" aria-label="Vähennä määrää">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                        </button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="increase-quantity text-gray-400 hover:text-white px-2" data-id="${item.id}" aria-label="Lisää määrää">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </button>
                        <span class="ml-4 font-medium">€${itemTotal.toFixed(2)}</span>
                    </div>
                `;

                cartItemsContainer.appendChild(cartItemElement);
            });

            // Update quantity indicators
            cartCount.textContent = itemCount;
            cartCount.classList.remove('hidden');

            // Calculate shipping
            const shipping = pickupEventCheckbox && pickupEventCheckbox.checked ? 0 : 2.5;
            const total = subtotal + shipping;

            // Update totals
            cartSubtotal.textContent = `€${subtotal.toFixed(2)}`;
            cartShipping.textContent = `€${shipping.toFixed(2)}`;
            cartTotal.textContent = `€${total.toFixed(2)}`;
        }

        // Add event listeners to quantity buttons
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
                const item = cart.find(item => item.id === id);
                if (item) {
                    item.quantity += 1;
                    persistCart();
                    updateCart();
                }
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
                const itemIndex = cart.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity -= 1;
                    } else {
                        cart.splice(itemIndex, 1);
                    }
                    persistCart();
                    updateCart();
                }
            });
        });

        persistCart();
    }

    // Toggle cart drawer
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            cartDrawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    // Add to cart
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            addToCart();
        });
    }

    function addToCart() {
        const product = {
            id: 1,
            name: 'Valputki LED Light Tube',
            price: 5,
            quantity: 1
        };

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(product);
        }

        updateCart();
        showToast('Success', 'Item added to cart', 'success');
    }

    // Pickup event checkbox change
    if (pickupEventCheckbox) {
        pickupEventCheckbox.addEventListener('change', () => {
            updateCart();
        });
    }

    // Checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Error', 'Your cart is empty', 'error');
                return;
            }

            showToast('Success', 'Proceeding to checkout', 'success');
            setTimeout(() => {
                cart = [];
                updateCart();
                cartDrawer.classList.remove('open');
                document.body.style.overflow = 'auto';
            }, 1500);
        });
    }

    // Toast notification
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    const closeToastBtn = document.getElementById('close-toast');

    function showToast(title, message, type) {
        if (!toast) return;
        toastTitle.textContent = title;
        toastMessage.textContent = message;

        if (type === 'success') {
            toastIcon.classList.remove('text-red-500');
            toastIcon.classList.add('text-amber-400');
            toast.classList.remove('border-red-500');
            toast.classList.add('border-cyan-400');
        } else {
            toastIcon.classList.remove('text-amber-400');
            toastIcon.classList.add('text-red-500');
            toast.classList.remove('border-cyan-400');
            toast.classList.add('border-red-500');
        }

        toast.classList.add('show');
        toast.hidden = false;
        // auto-hide
        window.clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
            toast.hidden = true;
        }, 3000);
    }

    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            if (toast) {
                toast.classList.remove('show');
                toast.hidden = true;
            }
        });
    }

    // Close toast and overlays on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (toast && !toast.hidden) {
                toast.classList.remove('show');
                toast.hidden = true;
            }
            if (cartDrawer && cartDrawer.classList.contains('open')) {
                cartDrawer.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Contact form submission (enhanced): validation, honeypot, rate-limiting, AJAX to Formspree
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const nameInput = form.querySelector('input[name="name"]');
            const emailInput = form.querySelector('input[name="email"]');
            const messageInput = form.querySelector('textarea[name="message"]');
            const honeypot = form.querySelector('input[name="phone_number"]');
            const submitButton = form.querySelector('button[type="submit"]');

            // Honeypot: if filled, silently ignore (likely bot)
            if (honeypot && honeypot.value.trim() !== '') {
                return;
            }

            // Simple client-side validation
            const fields = [nameInput, emailInput, messageInput];
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let firstInvalid = null;

            if (!nameInput || nameInput.value.trim() === '') firstInvalid = firstInvalid || nameInput;
            if (!emailInput || emailInput.value.trim() === '' || !emailRe.test(emailInput.value.trim())) firstInvalid = firstInvalid || emailInput;
            if (!messageInput || messageInput.value.trim() === '') firstInvalid = firstInvalid || messageInput;

            if (firstInvalid) {
                // Focus first invalid field and show accessible toast
                firstInvalid.focus();
                showToast('Virhe', 'Täytä kaikki pakolliset kentät ja käytä kelvollista sähköpostiosoitetta.', 'error');
                return;
            }

            // Rate limiting: block repeated submissions for 30 seconds
            try {
                const last = localStorage.getItem('contact_last_sent');
                const now = Date.now();
                if (last && (now - Number(last) < 30_000)) {
                    showToast('Odota', 'Odota 30 sekuntia ennen uuden viestin lähettämistä.', 'error');
                    return;
                }
            } catch (err) {
                // ignore localStorage errors
            }

            // Prepare to send
            const fd = new FormData(form);

            // Disable submit button and show loading indicator
            const origText = submitButton ? submitButton.textContent : null;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.setAttribute('aria-disabled', 'true');
                submitButton.textContent = 'Lähetetään...';
            }

            try {
                const resp = await fetch(form.action || 'https://formspree.io/f/mldwpryn', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: fd
                });

                // set last sent time on success-ish (treat 200-299 as success)
                if (resp.ok) {
                    try { localStorage.setItem('contact_last_sent', String(Date.now())); } catch (e) {}
                    form.reset();
                    showToast('Kiitos!', 'Viestisi on lähetetty. Vastaamme pian.', 'success');
                } else {
                    // try to parse error message
                    let msg = 'Lähetys epäonnistui, yritä myöhemmin.';
                    try {
                        const data = await resp.json();
                        if (data && data.error) msg = data.error;
                    } catch (_) {}
                    showToast('Virhe', msg, 'error');
                }
            } catch (err) {
                console.error('Contact form send error', err);
                showToast('Virhe', 'Verkkovirhe: viestiä ei voitu lähettää.', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-disabled');
                    submitButton.textContent = origText;
                }
            }
        });
    }

    // Newsletter: submit to Formspree (placeholder ID). Replace {your-id} in HTML with real ID.
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSuccess = document.getElementById('newsletter-success');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const action = form.action;
            const formData = new FormData(form);

            // Attempt to post to Formspree (if action is the placeholder it will fail with 404, but UI will still show success)
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                form.reset();
                if (newsletterSuccess) {
                    newsletterSuccess.textContent = 'Kiitos! Tilauksesi vastaanotettu.';
                    newsletterSuccess.classList.remove('sr-only');
                }
                showToast('Kiitos!', 'You have subscribed to our newsletter', 'success');
            }).catch(err => {
                // Show success UX even if network fails, but log
                console.warn('Newsletter submit failed (placeholder):', err);
                form.reset();
                if (newsletterSuccess) {
                    newsletterSuccess.textContent = 'Kiitos! Tilauksesi vastaanotettu.';
                    newsletterSuccess.classList.remove('sr-only');
                }
                showToast('Kiitos!', 'You have subscribed to our newsletter', 'success');
            });
        });
    }

    // Smooth scrolling for anchor links and close mobile menu after click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                if (mobileMenu) mobileMenu.classList.add('hidden');
            }
        });
    });

    /* EVENT COUNTDOWN TIMER */
    function updateCountdown() {
      const timerEl = document.getElementById('countdown-timer');
      if (!timerEl) return;
      const now = new Date();
      const eventStart = new Date("2025-09-25T10:00:00+03:00");
      const eventEnd = new Date("2025-09-27T20:00:00+03:00");
      
      if (now < eventStart) {
        const diff = eventStart - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        timerEl.textContent = `Tapahtumaan jäljellä: ${d} pv ${h} h ${m} min ${s} s`;
      } else if (now >= eventStart && now < eventEnd) {
        const diff = eventEnd - now;
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        timerEl.textContent = `Tapahtuma meneillään – loppuu: ${h} h ${m} min ${s} s`;
      } else {
        timerEl.textContent = "Tapahtuma päättynyt";
      }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* PRODUCT IMAGE LIGHTBOX */
    const productImgElements = document.querySelectorAll('#product img');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    let productImages = []; // to hold src's for navigation
    productImgElements.forEach((img, i) => {
      // Mark images as lazy and clickable
      img.setAttribute('loading', 'lazy');
      img.style.cursor = 'pointer';
      productImages.push(img.src);
      img.addEventListener('click', () => {
         currentLightboxIndex = i;
         openLightbox(i);
      });
    });
    let currentLightboxIndex = 0;
    function openLightbox(i) {
      lightboxImage.src = productImages[i];
      lightboxModal.classList.remove('hidden');
      lightboxModal.focus();
    }
    function closeLightbox() { lightboxModal.classList.add('hidden'); }
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => { if (e.target === lightboxModal) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
       if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
         if (e.key === 'Escape') closeLightbox();
         if (e.key === 'ArrowLeft') {
           currentLightboxIndex = (currentLightboxIndex === 0) ? productImages.length - 1 : currentLightboxIndex - 1;
           openLightbox(currentLightboxIndex);
         }
         if (e.key === 'ArrowRight') {
           currentLightboxIndex = (currentLightboxIndex + 1) % productImages.length;
           openLightbox(currentLightboxIndex);
         }
       }
    });
    // Lightbox prev/next handlers: only attach if there are images
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');
    if (lbPrev && productImages.length > 0) {
      lbPrev.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex === 0) ? productImages.length - 1 : currentLightboxIndex - 1;
        openLightbox(currentLightboxIndex);
      });
    }
    if (lbNext && productImages.length > 0) {
      lbNext.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % productImages.length;
        openLightbox(currentLightboxIndex);
      });
    }

    /* TESTIMONIALS CAROUSEL */
    // Guarded carousel: only initialize if required elements exist
    const carouselTrack = document.querySelector('#testimonial-carousel .carousel-track');
    const testimonials = document.querySelectorAll('.testimonial-item');
    if (carouselTrack && testimonials && testimonials.length > 0) {
      let currentSlide = 0;
      const totalSlides = testimonials.length;
      function updateCarousel() {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
      let carouselTimer = setInterval(() => {
         currentSlide = (currentSlide + 1) % totalSlides;
         updateCarousel();
      }, 6000);
      const prevBtn = document.getElementById('testimonial-prev');
      const nextBtn = document.getElementById('testimonial-next');
      if (prevBtn) prevBtn.addEventListener('click', () => {
         currentSlide = (currentSlide === 0) ? totalSlides - 1 : currentSlide - 1;
         updateCarousel();
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
         currentSlide = (currentSlide + 1) % totalSlides;
         updateCarousel();
      });
      const carouselEl = document.getElementById('testimonial-carousel');
      if (carouselEl) {
        carouselEl.addEventListener('mouseenter', () => clearInterval(carouselTimer));
        carouselEl.addEventListener('mouseleave', () => {
          carouselTimer = setInterval(() => {
             currentSlide = (currentSlide + 1) % totalSlides;
             updateCarousel();
          }, 6000);
        });
      }
    }

    /* PRODUCT RATING WIDGET */
    (function setupRating(){
      const starsContainer = document.getElementById('rating-stars');
      const avgEl = document.getElementById('rating-average');
      const liveEl = document.getElementById('rating-live');

      if (!starsContainer || !avgEl) return;

      const KEY_TOTAL = 'valoputki_rating_total';
      const KEY_COUNT = 'valoputki_rating_count';
      const KEY_USER = 'valoputki_rating_user_vote';

      let total = Number(localStorage.getItem(KEY_TOTAL)) || 0;
      let count = Number(localStorage.getItem(KEY_COUNT)) || 0;
      let userVote = Number(localStorage.getItem(KEY_USER)) || 0; // 0 means no vote

      function getAverage() {
        return count > 0 ? (total / count) : 0;
      }

      function render() {
        // show average and count in Finnish
        const avg = getAverage();
        avgEl.textContent = `${avg.toFixed(1)} (${count} ääntä)`;
        // Clear and render 5 stars. Visual fill based on rounded average for display, but aria-checked reflects userVote
        starsContainer.innerHTML = '';
        const roundedAvg = Math.round(avg);
        for (let i=1;i<=5;i++){
          const star = document.createElement('span');
          star.className = 'rating-star text-2xl px-1';
          star.setAttribute('role','radio');
          star.setAttribute('aria-checked', String(userVote === i));
          star.setAttribute('tabindex', '0');
          star.setAttribute('data-value', String(i));
          star.setAttribute('aria-label', `${i} tähteä`);
          star.textContent = (i <= roundedAvg) ? '★' : '☆';
          // Click / keyboard handlers
          star.addEventListener('click', () => handleVote(i));
          star.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote(i); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              const prev = Math.max(1, i-1);
              const prevEl = starsContainer.querySelector(`[data-value="${prev}"]`);
              if (prevEl) prevEl.focus();
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              const next = Math.min(5, i+1);
              const nextEl = starsContainer.querySelector(`[data-value="${next}"]`);
              if (nextEl) nextEl.focus();
            }
          });
          starsContainer.appendChild(star);
        }
      }

      function handleVote(value) {
        // Update totals allowing change of previous vote
        const prev = userVote || 0;
        if (prev === value) {
          // no change
          showToast('Huomio', 'Olet jo antanut saman arvion.', 'error');
          return;
        }
        if (prev === 0) {
          // new vote
          total += value;
          count += 1;
        } else {
          // change vote
          total = total - prev + value;
          // count unchanged
        }
        userVote = value;
        // Persist
        try {
          localStorage.setItem(KEY_TOTAL, String(total));
          localStorage.setItem(KEY_COUNT, String(count));
          localStorage.setItem(KEY_USER, String(userVote));
        } catch (e) {
          console.warn('Failed to persist rating', e);
        }
        render();
        // Announce and toast in Finnish
        if (liveEl) liveEl.textContent = 'Arvostelu tallennettu. Kiitos!';
        if (typeof showToast === 'function') showToast('Kiitos!', 'Arvostelusi on tallennettu.', 'success');
      }

      // Initial render and ARIA focusability
      render();
    })();

    // BACK-TO-TOP BUTTON
    (function setupBackToTop(){
      const btn = document.getElementById('back-to-top');
      if (!btn) return;
      function check() {
        if (window.scrollY > 300) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
      }
      window.addEventListener('scroll', check);
      btn.addEventListener('click', () => {
        window.scrollTo({top:0, behavior:'smooth'});
        btn.blur();
      });
      // keyboard (Enter/Space) handled by button default
      check();
    })();

    // Initialize: restore cart and render
    restoreCart();
    updateCart();
})();

/* ===== i18n: robust loader, selector wiring, caching, announcements ===== */
(function i18nModule(){
  const SELECTOR_ID = 'lang-select';
  const LS_KEY = 'site_lang';
  const VALID = ['fi','en'];
  const cache = Object.create(null); // lang -> dict or Promise

  function getQueryLang() {
    try {
      const p = new URLSearchParams(window.location.search);
      const q = p.get('lang');
      if (q && VALID.includes(q)) return q;
    } catch(e){ /* ignore */ }
    return null;
  }

  function saveLang(lang) {
    try { localStorage.setItem(LS_KEY, lang); } catch(e){}
  }

  function readStoredLang() {
    try { return localStorage.getItem(LS_KEY); } catch(e){ return null; }
  }

  function navLangFallback() {
    try {
      const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
      return nav.startsWith('fi') ? 'fi' : 'en';
    } catch(e){ return 'fi'; }
  }

  // fetch and cache locale JSON; cache stores either object or in-flight Promise
  async function fetchLocale(lang) {
    if (!VALID.includes(lang)) lang = 'fi';
    const cached = cache[lang];
    if (cached) {
      // cached may be dict or promise
      return (cached instanceof Promise) ? cached : Promise.resolve(cached);
    }
    const p = fetch(`/locales/${lang}.json`).then(async res => {
      if (!res.ok) throw new Error('Locale fetch failed');
      const dict = await res.json();
      cache[lang] = dict;
      return dict;
    }).catch(err => {
      console.warn('i18n: failed to load', lang, err);
      // keep cache empty for this lang so next attempt may retry
      delete cache[lang];
      throw err;
    });
    cache[lang] = p;
    return p;
  }

  function translateElement(el, dict) {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const value = dict && dict[key];
    if (typeof value === 'undefined') {
      // leave existing content as graceful fallback
      return;
    }
    // Only set textContent to avoid injecting HTML
    el.textContent = value;
  }

  async function applyTranslations(lang) {
    try {
      const dict = await fetchLocale(lang);
      document.querySelectorAll('[data-i18n]').forEach(el => translateElement(el, dict));
      // set select UI
      const sel = document.getElementById(SELECTOR_ID);
      if (sel) sel.value = lang;
      saveLang(lang);
    } catch (err) {
      // on failure, do not disturb existing DOM (fallback to HTML)
      // optionally set select value to the lang even if load failed
      const sel = document.getElementById(SELECTOR_ID);
      if (sel) sel.value = lang;
    }
  }

  function announceLanguage(lang) {
    const live = document.getElementById('i18n-live');
    if (!live) return;
    const msg = lang === 'fi' ? 'Kieli vaihdettu suomeksi' : 'Language changed to English';
    // brief flash to ensure SR picks up change
    live.textContent = '';
    setTimeout(()=> { live.textContent = msg; }, 50);
  }

  function updateQueryParam(lang) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      // keep fragment/hash
      history.replaceState(null, '', url.toString());
    } catch (e) {
      // ignore if URL manipulation fails
    }
  }

  async function setLanguage(lang, {updateUrl=true, announce=true} = {}) {
    if (!VALID.includes(lang)) lang = 'fi';
    // Avoid double apply if already loaded and set (still apply to ensure UI sync)
    await applyTranslations(lang);
    if (updateUrl) updateQueryParam(lang);
    if (announce) announceLanguage(lang);
  }

  // Initialize: determine language by query -> localStorage -> nav -> default
  (function init() {
    const sel = document.getElementById(SELECTOR_ID);
    const q = getQueryLang();
    const stored = readStoredLang();
    let initial = 'fi';
    if (q) initial = q;
    else if (stored && VALID.includes(stored)) initial = stored;
    else initial = navLangFallback();

    // wire selector change
    if (sel) {
      // ensure keyboard focus visible (CSS handles outline)
      sel.addEventListener('change', (e) => {
        const v = e.target.value || 'fi';
        setLanguage(v, {updateUrl:true, announce:true});
      });
      // reflect initial value quickly for UX
      sel.value = initial;
      sel.setAttribute('aria-label', 'Choose language');
    }

    // load translations (async)
    setLanguage(initial, {updateUrl: !q /* don't override explicit query param if present */ , announce:false});
  })();
})(); /* end i18nModule */

/* ===== end i18n ===== */
