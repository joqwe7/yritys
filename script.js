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

    // Contact form submission (local-only success toast)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Success', 'Your message has been sent!', 'success');
            e.target.reset();
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

    // Initialize: restore cart and render
    restoreCart();
    updateCart();
})();
