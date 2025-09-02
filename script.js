// Restore DOM-ready behaviors, cart logic, persistence to localStorage, and UI interactions

(function(){
  // Utilities
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const formatPrice = p => Number(p).toFixed(2).replace('.', ',' ) + ' €';

  // Elements
  const cartBtn = $('#cart-btn');
  const cartCount = $('#cart-count');
  const cartDrawer = $('#cart-drawer');
  const cartItemsEl = $('#cart-items');
  const cartTotalEl = $('#cart-total');
  const addButtons = $$('.add-to-cart');
  const toast = $('#toast');
  const toastMessage = $('#toast-message');
  const toastClose = $('#toast-close');
  const mobileMenuBtn = $('#mobile-menu-btn');
  const mainNav = $('#main-nav');
  const newsletterForm = $('#newsletter-form');
  const nlSuccess = $('#newsletter-success');

  // Cart data
  let cart = [];

  // Persist cart to localStorage whenever it changes
  function persistCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Restore cart from localStorage on load
  function restoreCart(){
    try{
      const raw = localStorage.getItem('cart');
      if(raw){
        cart = JSON.parse(raw);
      } else {
        cart = [];
      }
    } catch (e){
      cart = [];
      console.error('Could not restore cart', e);
    }
  }

  // Render cart UI
  function renderCart(){
    cartItemsEl.innerHTML = '';
    if(cart.length === 0){
      cartItemsEl.innerHTML = '<li>Ostoskori on tyhjä</li>';
      cartTotalEl.textContent = formatPrice(0);
      cartCount.textContent = '0';
      return;
    }
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.id = item.id;
      li.innerHTML = `
        <div class="cart-item-inner">
          <strong>${item.title}</strong>
          <div>Hinta: ${formatPrice(item.price)} x <input type="number" min="1" value="${item.qty}" class="cart-qty" aria-label="Määrä: ${item.title}" style="width:60px"></div>
          <button class="remove-item" aria-label="Poista ${item.title}">Poista</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });
    cartTotalEl.textContent = formatPrice(total);
    cartCount.textContent = String(cart.reduce((s,i)=>s+i.qty,0));
  }

  // Add item to cart
  function addToCart(id, title, price){
    const existing = cart.find(it => it.id === id);
    if(existing){
      existing.qty += 1;
    } else {
      cart.push({id,title,price,qty:1});
    }
    persistCart();
    renderCart();
    showToast(`${title} lisätty ostoskoriin`);
  }

  // Remove item
  function removeFromCart(id){
    cart = cart.filter(i => i.id !== id);
    persistCart();
    renderCart();
  }

  // Event handlers
  function initEventHandlers(){
    addButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = e.currentTarget.closest('.product');
        const id = product.dataset.id;
        const title = product.dataset.title;
        const price = Number(product.dataset.price);
        addToCart(id, title, price);
      });
    });

    cartBtn.addEventListener('click', () => {
      const expanded = cartDrawer.getAttribute('aria-hidden') === 'false';
      cartDrawer.setAttribute('aria-hidden', String(expanded));
      cartDrawer.setAttribute('aria-hidden', expanded ? 'true' : 'false');
      cartDrawer.style.transform = expanded ? 'translateX(100%)' : 'translateX(0)';
    });

    // Delegation for cart actions
    cartItemsEl.addEventListener('click', (e) => {
      if(e.target.classList.contains('remove-item')){
        const id = e.target.closest('.cart-item').dataset.id;
        removeFromCart(id);
      }
    });

    cartItemsEl.addEventListener('change', (e) => {
      if(e.target.classList.contains('cart-qty')){
        const id = e.target.closest('.cart-item').dataset.id;
        const val = Math.max(1, parseInt(e.target.value,10) || 1);
        const item = cart.find(i => i.id === id);
        if(item){
          item.qty = val;
          persistCart();
          renderCart();
        }
      }
    });

    // Mobile nav toggle
    mobileMenuBtn.addEventListener('click', () => {
      const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
      if(mainNav.style.display === 'block'){
        mainNav.style.display = '';
      } else {
        mainNav.style.display = 'block';
      }
    });

    // Toast close
    toastClose.addEventListener('click', hideToast);

    // Keyboard: close toast on Esc, allow focus
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        if(!toast.hidden) hideToast();
        // close mobile nav if open
        if(mobileMenuBtn.getAttribute('aria-expanded') === 'true'){
          mobileMenuBtn.click();
        }
      }
    });

    // Newsletter submission with fetch
    if(newsletterForm){
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        // Note: Replace {your-id} in form action with real Formspree ID
        fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(resp => {
          if(resp.ok){
            form.reset();
            nlSuccess.textContent = 'Kiitos! Tilauksesi vastaanotettu.';
            showToast('Uutiskirje tilattu — kiitos!');
          } else {
            showToast('Lähetys epäonnistui, yritä myöhemmin.');
          }
        }).catch(err => {
          console.error(err);
          showToast('Verkkovirhe, yritä myöhemmin.');
        });
      });
    }
  }

  // Toast helpers
  let toastTimer = null;
  function showToast(msg, timeout=3500){
    toastMessage.textContent = msg;
    toast.hidden = false;
    toast.setAttribute('aria-hidden', 'false');
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => hideToast(), timeout);
  }
  function hideToast(){
    toast.hidden = true;
    toast.setAttribute('aria-hidden', 'true');
    toastMessage.textContent = '';
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    restoreCart();
    renderCart();
    initEventHandlers();
  });

})();
