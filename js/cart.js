// js/cart.js - Lógica exclusiva para la vista del carrito

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== ELEMENTOS DEL DOM =====
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyState = document.getElementById('empty-state');
    const orderSummary = document.getElementById('order-summary');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const toastContainer = document.getElementById('toast-container');

    // ===== LÓGICA DEL MODO OSCURO (Reutilizada para coherencia visual) =====
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    function updateThemeIcons() {
        if (document.documentElement.classList.contains('dark')) {
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            themeToggleLightIcon.classList.add('hidden');
            themeToggleDarkIcon.classList.remove('hidden');
        }
    }

    updateThemeIcons();

    themeToggleBtn.addEventListener('click', function() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons();
    });

    // ===== FUNCIONES DEL CARRITO =====

    // Obtener datos del carrito
    function getCartData() {
        return JSON.parse(localStorage.getItem('urbanCart')) || [];
    }

    // Guardar datos en el carrito
    function saveCartData(cartData) {
        localStorage.setItem('urbanCart', JSON.stringify(cartData));
    }

    // Renderizar los productos
    function renderCart() {
        const cartData = getCartData();
        
        if (cartData.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.appendChild(emptyState);
            emptyState.classList.remove('hidden');
            orderSummary.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        orderSummary.classList.remove('hidden');
        
        // Limpiar contenedor antes de renderizar
        cartItemsContainer.innerHTML = '';

        cartData.forEach((item, index) => {
            const itemHTML = document.createElement('div');
            itemHTML.className = 'flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm relative scroll-reveal active';
            
            itemHTML.innerHTML = `
                <!-- Imagen del producto con el filtro CSS aplicado -->
                <div class="w-full sm:w-32 h-32 bg-brand-beige/50 dark:bg-black/50 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain drop-shadow-lg transform -rotate-12" style="filter: ${item.colorFilter};" />
                </div>
                
                <!-- Detalles -->
                <div class="flex-grow text-center sm:text-left">
                    <h3 class="font-display text-xl font-bold text-brand-black dark:text-white uppercase tracking-wide">${item.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Color: <span class="font-semibold text-brand-black dark:text-white">${item.colorName}</span></p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Talla: <span class="font-semibold text-brand-black dark:text-white">${item.size}</span></p>
                </div>
                
                <!-- Precio y Eliminar -->
                <div class="flex flex-col items-center sm:items-end gap-4 shrink-0">
                    <span class="font-display font-bold text-2xl text-brand-black dark:text-brand-gold">$${item.price.toFixed(2)}</span>
                    <button class="remove-item-btn text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition" data-index="${index}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Remover
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemHTML);
        });

        attachRemoveEvents();
        updateTotals(cartData);
    }

    // Adjuntar eventos a los botones de remover
    function attachRemoveEvents() {
        const removeBtns = document.querySelectorAll('.remove-item-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                removeCartItem(index);
            });
        });
    }

    // Eliminar item del carrito
    function removeCartItem(index) {
        let cartData = getCartData();
        const removedItemName = cartData[index].name;
        
        cartData.splice(index, 1); // Eliminar el elemento del arreglo
        saveCartData(cartData); // Guardar nuevo estado
        
        renderCart(); // Re-renderizar la vista
        showToast(`${removedItemName} eliminado de la bolsa.`, 'info');
    }

    // Calcular y actualizar totales
    function updateTotals(cartData) {
        let subtotal = 0;
        cartData.forEach(item => {
            subtotal += item.price;
        });

        // Lógica de envío gratis si supera los $100
        let shipping = subtotal > 100 ? 0 : 15; 
        
        // Formateo
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
        
        const total = subtotal + shipping;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    }

    // ===== TOAST NOTIFICATIONS =====
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        const icons = {
            success: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
            error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
            info: `<svg class="w-5 h-5 text-brand-black dark:text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        };

        const borderColors = {
            success: 'border-green-500',
            error: 'border-red-500',
            info: 'border-brand-black dark:border-brand-gold'
        };
        
        toast.className = `toast-in toast-glass dark:bg-brand-darkCard/90 dark:text-white ${borderColors[type] || borderColors.info} px-6 py-4 rounded-r-lg shadow-lg flex items-center justify-between gap-4 w-full`;
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                ${icons[type] || icons.info}
                <span class="font-semibold text-sm tracking-wide">${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-brand-black dark:hover:text-white transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('toast-in');
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ===== EVENTO DE CHECKOUT =====
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const btnOriginalText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = '<span class="relative z-10 font-sans tracking-widest text-brand-black">PROCESANDO...</span>';
            
            setTimeout(() => {
                showToast('Redirigiendo a la pasarela de pago...', 'success');
                // Aquí iría la integración real con Stripe, PayPal, etc.
                setTimeout(() => {
                    checkoutBtn.innerHTML = btnOriginalText;
                }, 2000);
            }, 1000);
        });
    }

    // Inicializar la vista
    renderCart();
});