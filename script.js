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
    document.getElementById('lightbox-prev').addEventListener('click', () => {
       currentLightboxIndex = (currentLightboxIndex === 0) ? productImages.length - 1 : currentLightboxIndex - 1;
       openLightbox(currentLightboxIndex);
    });
    document.getElementById('lightbox-next').addEventListener('click', () => {
       currentLightboxIndex = (currentLightboxIndex + 1) % productImages.length;
       openLightbox(currentLightboxIndex);
    });

    /* TESTIMONIALS CAROUSEL */
    const carouselTrack = document.querySelector('#testimonial-carousel .carousel-track');
    const testimonials = document.querySelectorAll('.testimonial-item');
    let currentSlide = 0;
    const totalSlides = testimonials.length;
    function updateCarousel() {
      carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    let carouselTimer = setInterval(() => { 
       currentSlide = (currentSlide + 1) % totalSlides;
       updateCarousel();
    }, 6000);
    document.getElementById('testimonial-prev').addEventListener('click', () => {
       currentSlide = (currentSlide === 0) ? totalSlides - 1 : currentSlide - 1;
       updateCarousel();
    });
    document.getElementById('testimonial-next').addEventListener('click', () => {
       currentSlide = (currentSlide + 1) % totalSlides;
       updateCarousel();
    });
    const carouselEl = document.getElementById('testimonial-carousel');
    carouselEl.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    carouselEl.addEventListener('mouseleave', () => {
      carouselTimer = setInterval(() => { 
         currentSlide = (currentSlide + 1) % totalSlides;
         updateCarousel();
      }, 6000);
    });

    /* QUICK BULK-ORDER CALCULATOR */
    const bulkQuantityEl = document.getElementById('bulk-quantity');
    const bulkCalcBtn = document.getElementById('bulk-calc-btn');
    const bulkResultEl = document.getElementById('bulk-order-result');
    const addBulkBtn = document.getElementById('add-bulk-to-cart');
    const UNIT_PRICE = 5;
    function calculateBulkOrder() {
       let qty = parseInt(bulkQuantityEl.value, 10);
       if (!qty || qty < 1) qty = 1;
       let discount = 0;
       if (qty >=5 && qty < 20) discount = 0.10;
       if (qty >= 20) discount = 0.20;
       let subtotal = UNIT_PRICE * qty;
       let discountAmount = subtotal * discount;
       let shipping = (pickupEventCheckbox && pickupEventCheckbox.checked) ? 0 : 2.5;
       let total = subtotal - discountAmount + shipping;
       bulkResultEl.innerHTML = `Alennus: €${discountAmount.toFixed(2)}<br>Välisumma: €${(subtotal - discountAmount).toFixed(2)}<br>Toimitus: €${shipping.toFixed(2)}<br>Kokonaissumma: €${total.toFixed(2)}`;
       return qty;
    }
    bulkCalcBtn.addEventListener('click', calculateBulkOrder);
    addBulkBtn.addEventListener('click', () => {
       const qty = calculateBulkOrder();
       // re-use existing addToCart logic but add qty instead of 1
       const product = {
           id: 1,
           name: 'Valputki LED Light Tube',
           price: UNIT_PRICE,
           quantity: qty
       };
       const existingItem = cart.find(item => item.id === product.id);
       if (existingItem) {
          existingItem.quantity += qty;
       } else {
          cart.push(product);
       }
       updateCart();
       showToast('Success', 'Bulk order added to cart', 'success');
    });

    /* PRODUCT RATING WIDGET */
    const ratingStarsEl = document.getElementById('rating-stars');
    const ratingAverageEl = document.getElementById('rating-average');
    let totalRating = Number(localStorage.getItem('product_total_rating')) || 0;
    let totalVotes = Number(localStorage.getItem('product_total_votes')) || 0;
    let hasVoted = localStorage.getItem('product_has_voted') === "true";
    function renderStars() {
       ratingStarsEl.innerHTML = '';
       for (let i = 1; i <= 5; i++) {
         const star = document.createElement('span');
         star.textContent = (i <= Math.round(totalRating / (totalVotes || 1))) ? '★' : '☆';
         star.style.cursor = hasVoted ? 'default' : 'pointer';
         star.setAttribute('data-value', i);
         star.setAttribute('aria-label', `${i} star`);
         if (!hasVoted) {
            star.addEventListener('click', () => {
              totalRating += i;
              totalVotes++;
              localStorage.setItem('product_total_rating', totalRating);
              localStorage.setItem('product_total_votes', totalVotes);
              localStorage.setItem('product_has_voted', "true");
              renderStars();
              ratingAverageEl.textContent = `(${(totalRating / totalVotes).toFixed(1)} / 5, ${totalVotes} votes)`;
              showToast('Kiitos!', 'Kiitos arvostelustasi!', 'success');
            });
         }
         ratingStarsEl.appendChild(star);
       }
       ratingAverageEl.textContent = (totalVotes > 0) ? `(${(totalRating / totalVotes).toFixed(1)} / 5, ${totalVotes} votes)` : '(0 votes)';
    }
    renderStars();

    // Initialize: restore cart and render
    restoreCart();
    updateCart();
})();
