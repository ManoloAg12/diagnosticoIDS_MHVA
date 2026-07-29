// js/cart.js - Lógica avanzada para la bolsa de compras (Pagos, Descuentos, Ciudades dinámicas y Animaciones)

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== ELEMENTOS DEL DOM =====
    const cartTitle = document.getElementById('cart-title');
    const cartContainer = document.getElementById('cart-container');
    const cartItemsContainer = document.getElementById('cart-items');
    
    const emptyState = document.getElementById('empty-state');
    const successState = document.getElementById('success-state');
    
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryDiscountRow = document.getElementById('summary-discount-row');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTotal = document.getElementById('summary-total');
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutBtnText = document.getElementById('checkout-btn-text');
    const checkoutSpinner = document.getElementById('checkout-spinner');
    
    const toastContainer = document.getElementById('toast-container');

    // Elementos de Método de Pago y Envío
    const payMethodBtns = document.querySelectorAll('.pay-method-btn');
    const cardForm = document.getElementById('card-form');
    
    const checkoutEmail = document.getElementById('checkout-email');
    const checkoutDepto = document.getElementById('checkout-depto');
    const checkoutCity = document.getElementById('checkout-city');
    const checkoutAddress = document.getElementById('checkout-address');

    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');

    let currentPaymentMethod = 'card'; // 'card', 'paypal', 'btc'
    let currentCartData = [];

    // ===== DATOS DE MUNICIPIOS (El Salvador) =====
    const locations = {
        "Ahuachapán": ["Ahuachapán", "Atiquizaya", "Concepción de Ataco", "San Francisco Menéndez"],
        "Santa Ana": ["Santa Ana", "Chalchuapa", "Metapán", "Coatepeque", "El Congo"],
        "Sonsonate": ["Sonsonate", "Acajutla", "Izalco", "Nahuizalco", "Armenia"],
        "Chalatenango": ["Chalatenango", "Nueva Concepción", "La Palma", "Tejutla"],
        "La Libertad": ["Santa Tecla", "Antiguo Cuscatlán", "Colón (Lourdes)", "La Libertad", "Zaragoza", "San Juan Opico"],
        "San Salvador": ["San Salvador", "Soyapango", "Mejicanos", "Ilopango", "Apopa", "San Marcos", "Ciudad Delgado"],
        "Cuscatlán": ["Cojutepeque", "Suchitoto", "San Pedro Perulapán"],
        "La Paz": ["Zacatecoluca", "San Luis Talpa", "Olocuilta", "San Luis La Herradura"],
        "Cabañas": ["Sensuntepeque", "Ilobasco", "Victoria"],
        "San Vicente": ["San Vicente", "Apastepeque", "San Sebastián"],
        "Usulután": ["Usulután", "Jiquilisco", "Santiago de María", "Berlin"],
        "San Miguel": ["San Miguel", "Ciudad Barrios", "Chinameca", "Chirilagua"],
        "Morazán": ["San Francisco Gotera", "Jocoro", "Corinto"],
        "La Unión": ["La Unión", "Santa Rosa de Lima", "Conchagua", "Pasaquina"]
    };

    // Lógica para actualizar el Select de Ciudades
    checkoutDepto.addEventListener('change', function() {
        const selectedDepto = this.value;
        const cities = locations[selectedDepto] || [];
        
        checkoutCity.innerHTML = '<option value="" disabled selected>Seleccione ciudad...</option>';
        
        if (cities.length > 0) {
            checkoutCity.disabled = false;
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                checkoutCity.appendChild(option);
            });
        } else {
            checkoutCity.disabled = true;
        }
    });

    // ===== LÓGICA DEL MODO OSCURO =====
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

    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
        });
    }

    // ===== FUNCIONES DEL CARRITO =====

    function getCartData() {
        return JSON.parse(localStorage.getItem('urbanCart')) || [];
    }

    function saveCartData(cartData) {
        localStorage.setItem('urbanCart', JSON.stringify(cartData));
    }

    function renderCart() {
        currentCartData = getCartData();
        
        if (currentCartData.length === 0) {
            cartContainer.classList.add('hidden');
            cartContainer.classList.remove('grid');
            
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            cartTitle.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        cartContainer.classList.remove('hidden');
        cartContainer.classList.add('grid');
        
        cartItemsContainer.innerHTML = '';

        currentCartData.forEach((item, index) => {
            const itemHTML = document.createElement('div');
            itemHTML.className = 'flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-brand-darkCard p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm relative transition-all hover:shadow-md';
            
            itemHTML.innerHTML = `
                <div class="w-full sm:w-28 h-28 bg-brand-beige/50 dark:bg-black/50 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain drop-shadow-lg transform -rotate-6" style="filter: ${item.colorFilter};" />
                </div>
                
                <div class="flex-grow text-center sm:text-left">
                    <h3 class="font-display text-xl font-bold text-brand-black dark:text-white uppercase tracking-wide">${item.name}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Color: <span class="font-semibold text-brand-black dark:text-white">${item.colorName}</span></p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Talla: <span class="font-semibold text-brand-black dark:text-white">${item.size}</span></p>
                </div>
                
                <div class="flex flex-col items-center sm:items-end gap-3 shrink-0">
                    <span class="font-display font-bold text-2xl text-brand-black dark:text-brand-gold">$${item.price.toFixed(2)}</span>
                    <button class="remove-item-btn text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" data-index="${index}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Remover
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemHTML);
        });

        attachRemoveEvents();
        updateTotals();
    }

    function attachRemoveEvents() {
        const removeBtns = document.querySelectorAll('.remove-item-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                removeCartItem(index);
            });
        });
    }

    function removeCartItem(index) {
        const removedItemName = currentCartData[index].name;
        currentCartData.splice(index, 1); 
        saveCartData(currentCartData); 
        renderCart(); 
        showToast(`${removedItemName} eliminado de la bolsa.`, 'info');
    }

    function updateTotals() {
        let subtotal = 0;
        currentCartData.forEach(item => { subtotal += item.price; });

        let shipping = subtotal > 100 ? 0 : 15; 
        let discount = 0;

        // Aplicar 3% de descuento solo si el método es tarjeta
        if (currentPaymentMethod === 'card') {
            discount = subtotal * 0.03;
            summaryDiscountRow.classList.remove('hidden');
            summaryDiscount.textContent = `-$${discount.toFixed(2)}`;
        } else {
            summaryDiscountRow.classList.add('hidden');
        }
        
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
        
        const total = (subtotal + shipping) - discount;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    }

    // ===== LÓGICA DE MÉTODOS DE PAGO =====
    
    payMethodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Limpiar estilos activos
            payMethodBtns.forEach(b => {
                b.classList.remove('border-2', 'border-brand-black', 'dark:border-brand-gold', 'bg-brand-black/5', 'dark:bg-brand-gold/10', 'text-brand-black', 'dark:text-white');
                b.classList.add('border', 'border-gray-200', 'dark:border-white/10', 'text-gray-400');
            });

            // Aplicar estilo activo
            const selectedBtn = e.currentTarget;
            selectedBtn.classList.remove('border', 'border-gray-200', 'dark:border-white/10', 'text-gray-400');
            selectedBtn.classList.add('border-2', 'border-brand-black', 'dark:border-brand-gold', 'bg-brand-black/5', 'dark:bg-brand-gold/10', 'text-brand-black', 'dark:text-white');

            currentPaymentMethod = selectedBtn.getAttribute('data-method');

            // Mostrar/Ocultar formulario de tarjeta
            if (currentPaymentMethod === 'card') {
                cardForm.classList.remove('hidden');
            } else {
                cardForm.classList.add('hidden');
            }

            // Recalcular para aplicar o quitar descuento
            updateTotals();
        });
    });

    // ===== FORMATEO DEL FORMULARIO DE TARJETA =====
    
    cardNumber.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); 
        value = value.replace(/(.{4})/g, '$1 ').trim(); 
        e.target.value = value;
    });

    cardExpiry.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); 
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    cardCvv.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

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
        
        toast.className = `toast-in toast-glass dark:bg-brand-darkCard/90 dark:text-white ${borderColors[type] || borderColors.info} px-6 py-4 rounded-r-lg shadow-lg flex items-center justify-between gap-4 w-full z-50 relative`;
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

    // ===== PROCESO DE COMPRA (CHECKOUT) =====
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            
            // 1. Validar Datos de Envío
            if (!checkoutEmail.value || !checkoutDepto.value || !checkoutCity.value || !checkoutAddress.value) {
                showToast('Por favor, completa todos tus datos de envío', 'error');
                return;
            }

            // 2. Validar Datos de Tarjeta
            if (currentPaymentMethod === 'card') {
                if(cardNumber.value.length < 19 || cardExpiry.value.length < 5 || cardCvv.value.length < 3) {
                    showToast('Verifica los datos de tu tarjeta', 'error');
                    return;
                }
            }

            // Iniciar animación
            checkoutBtn.disabled = true;
            checkoutBtnText.textContent = 'PROCESANDO...';
            checkoutSpinner.classList.remove('hidden');
            
            setTimeout(() => {
                
                // Vaciar Carrito en LocalStorage
                localStorage.removeItem('urbanCart');
                
                // Ocultar todo el carrito y el título
                cartContainer.classList.add('hidden');
                cartContainer.classList.remove('grid');
                cartTitle.classList.add('hidden');
                
                // Mostrar pantalla de éxito
                successState.classList.remove('hidden');
                successState.classList.add('flex');
                
                showToast('¡Tu pago ha sido aprobado!', 'success');

                // Restaurar el botón
                checkoutBtn.disabled = false;
                checkoutBtnText.textContent = 'Proceder al Pago';
                checkoutSpinner.classList.add('hidden');

            }, 2500);
        });
    }

    // Ejecutar render inicial
    renderCart();
});