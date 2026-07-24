// js/zhombres.js - Lógica para la colección de hombres con Modal y Carrito

document.addEventListener('DOMContentLoaded', async () => {
    
    // ===== ELEMENTOS DEL DOM =====
    const categoryContainer = document.getElementById('category-products');
    const cartBadge = document.getElementById('cart-badge');
    const toastContainer = document.getElementById('toast-container');
    
    // Elementos del Modal
    const productModal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const modalMainImg = document.getElementById('modal-main-img');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalPrice = document.getElementById('modal-price');
    const modalThumbnails = document.getElementById('modal-thumbnails');
    const modalColorsContainer = document.getElementById('modal-colors');

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

    themeToggleBtn.addEventListener('click', function() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons();
        showToast(isDark ? 'Modo Oscuro activado' : 'Modo Claro activado', 'info');
    });

    // ===== ESTADO GLOBAL =====
    let menShoesData = [];
    let modalCurrentShoe = null;
    let modalSelectedColor = null;

    // Leer el carrito guardado al cargar la página
    const savedCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
    if (cartBadge) cartBadge.textContent = savedCart.length;

    // Función auxiliar para ajustar rutas de imágenes desde la carpeta /pages/
    function fixPath(path) {
        if (!path) return '';
        return path.startsWith('./') ? path.replace('./', '../') : path;
    }

    // ===== FETCH DATA Y FILTRADO =====
    try {
        const response = await fetch('../data/data.json');
        const data = await response.json();
        
        // Filtrar exclusivamente los de categoría hombre
        menShoesData = data.shoes.filter(shoe => shoe.category === 'hombre');
        
        if (menShoesData.length === 0) {
            categoryContainer.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-12 uppercase tracking-widest">No hay productos disponibles en esta categoría.</p>';
            return;
        }

        categoryContainer.innerHTML = '';
        menShoesData.forEach((shoe) => {
            const card = document.createElement('div');
            card.className = 'group bg-gradient-to-br from-white to-gray-50 dark:from-[#181818] dark:to-[#0a0a0a] rounded-3xl p-8 border border-gray-200/60 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col justify-between cursor-pointer';
            
            const defaultColor = shoe.colors[0];
            const defaultImage = fixPath(shoe.baseImage);

            // Al hacer clic en la tarjeta (excepto en el botón), se abre el modal
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.quick-add-btn')) {
                    window.openModal(shoe.id);
                }
            });

            card.innerHTML = `
                <div class="relative overflow-hidden h-48 mb-6 flex items-center justify-center">
                    <img src="${defaultImage}" alt="${shoe.name}" class="w-full h-full object-contain transform -rotate-12 group-hover:scale-110 transition duration-700 drop-shadow-xl" style="filter: ${defaultColor.cssFilter};" />
                </div>
                <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-brand-gold">${defaultColor.colorName}</span>
                    <h3 class="font-display text-2xl font-bold text-brand-black dark:text-white tracking-wide mt-1">${shoe.name}</h3>
                    <p class="text-gray-400 text-sm font-medium">${shoe.subtitle}</p>
                </div>
                <div class="flex justify-between items-center mt-6 pt-6 border-t border-gray-200/60 dark:border-white/10">
                    <span class="font-display font-bold text-xl text-brand-black dark:text-white">$${shoe.price.toFixed(2)}</span>
                    <button class="quick-add-btn bg-brand-black dark:bg-brand-gold text-white dark:text-brand-black font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-md" data-id="${shoe.id}">
                        Comprar
                    </button>
                </div>
            `;
            categoryContainer.appendChild(card);
        });

        attachQuickAddEvents();

    } catch (error) {
        console.error("Error cargando los productos para hombre:", error);
        showToast('Error al cargar la colección', 'error');
    }

    // ===== ACCIÓN DE COMPRA RÁPIDA DESDE LA TARJETA =====
    function attachQuickAddEvents() {
        const buttons = document.querySelectorAll('.quick-add-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shoeId = e.currentTarget.getAttribute('data-id');
                const selectedShoe = menShoesData.find(s => s.id === shoeId);
                if (!selectedShoe) return;

                const defaultColor = selectedShoe.colors[0];
                const defaultSize = selectedShoe.availableSizes[2] || selectedShoe.availableSizes[0];
                const cleanImage = fixPath(selectedShoe.baseImage);

                const cartItem = {
                    id: `${selectedShoe.id}-${defaultColor.colorId}-${defaultSize}`,
                    name: selectedShoe.name,
                    price: selectedShoe.price,
                    image: cleanImage,
                    colorFilter: defaultColor.cssFilter,
                    colorName: defaultColor.colorName,
                    size: defaultSize
                };

                let currentCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
                currentCart.push(cartItem);
                localStorage.setItem('urbanCart', JSON.stringify(currentCart));

                if (cartBadge) {
                    cartBadge.textContent = currentCart.length;
                    cartBadge.classList.add('bump');
                    setTimeout(() => cartBadge.classList.remove('bump'), 300);
                }

                showToast(`${selectedShoe.name} añadido a tu bolsa.`, 'success');
            });
        });
    }

    // ===== LÓGICA DE LA VENTANA MODAL =====
    window.openModal = function(shoeId) {
        if (!productModal || !modalOverlay || !modalContent) return;

        modalCurrentShoe = menShoesData.find(s => s.id === shoeId);
        if (!modalCurrentShoe) return;

        modalSelectedColor = modalCurrentShoe.colors[0];

        if (modalTitle) modalTitle.textContent = modalCurrentShoe.name;
        if (modalSubtitle) modalSubtitle.textContent = modalCurrentShoe.subtitle;
        if (modalPrice) modalPrice.textContent = `$${modalCurrentShoe.price.toFixed(2)}`;

        // Cargar imagen y filtro inicial
        updateModalDisplay();

        // Renderizar selector de colores en el modal
        if (modalColorsContainer) {
            modalColorsContainer.innerHTML = '';
            modalCurrentShoe.colors.forEach(color => {
                const colorBtn = document.createElement('button');
                const isActive = modalSelectedColor.colorId === color.colorId;
                colorBtn.className = `w-8 h-8 rounded-full shadow-inner transition-all duration-300 hover:scale-110 border-2 ${isActive ? 'border-brand-black dark:border-white scale-110 ring-2 ring-brand-gold' : 'border-white/50'}`;
                colorBtn.style.backgroundColor = color.colorHex;
                colorBtn.title = color.colorName;

                colorBtn.addEventListener('click', () => {
                    modalSelectedColor = color;
                    updateModalDisplay();
                    // Actualizar bordes de botones de colores
                    Array.from(modalColorsContainer.children).forEach(b => b.classList.remove('scale-110', 'ring-2'));
                    colorBtn.classList.add('scale-110', 'ring-2');
                });
                modalColorsContainer.appendChild(colorBtn);
            });
        }

        // Renderizar miniaturas
        if (modalThumbnails) {
            modalThumbnails.innerHTML = '';
            if (modalCurrentShoe.images && modalCurrentShoe.images.length > 0) {
                modalCurrentShoe.images.forEach((imgSrc) => {
                    const thumb = document.createElement('button');
                    thumb.className = 'w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-2 hover:border-brand-gold transition';
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = fixPath(imgSrc);
                    imgElement.className = 'w-full h-full object-contain';
                    imgElement.style.filter = modalSelectedColor.cssFilter;
                    
                    thumb.appendChild(imgElement);
                    
                    thumb.addEventListener('click', () => {
                        modalMainImg.src = fixPath(imgSrc);
                    });
                    
                    modalThumbnails.appendChild(thumb);
                });
            }
        }

        // Mostrar Modal con animación
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
        
        setTimeout(() => {
            modalOverlay.classList.remove('opacity-0');
            modalOverlay.classList.add('opacity-100');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        document.body.style.overflow = 'hidden';
    };

    function updateModalDisplay() {
        if (!modalMainImg || !modalSelectedColor || !modalCurrentShoe) return;
        modalMainImg.src = fixPath(modalCurrentShoe.baseImage);
        modalMainImg.style.filter = modalSelectedColor.cssFilter;
    }

    function closeModal() {
        if (!productModal || !modalOverlay || !modalContent) return;

        modalOverlay.classList.remove('opacity-100');
        modalOverlay.classList.add('opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            productModal.classList.remove('flex');
            productModal.classList.add('hidden');
            document.body.style.overflow = ''; 
        }, 300); 
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal && !productModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // ===== AGREGAR AL CARRITO (Desde el Modal) =====
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (!modalCurrentShoe || !modalSelectedColor) return;

            const defaultSize = modalCurrentShoe.availableSizes[2] || modalCurrentShoe.availableSizes[0];
            const cleanImage = fixPath(modalCurrentShoe.baseImage);

            const cartItem = {
                id: `${modalCurrentShoe.id}-${modalSelectedColor.colorId}-${defaultSize}`, 
                name: modalCurrentShoe.name,
                price: modalCurrentShoe.price,
                image: cleanImage,
                colorFilter: modalSelectedColor.cssFilter,
                colorName: modalSelectedColor.colorName,
                size: defaultSize
            };

            let currentCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
            currentCart.push(cartItem);
            localStorage.setItem('urbanCart', JSON.stringify(currentCart));

            if (cartBadge) {
                cartBadge.textContent = currentCart.length;
                cartBadge.classList.add('bump');
                setTimeout(() => cartBadge.classList.remove('bump'), 300);
            }
            
            showToast(`${modalCurrentShoe.name} (${modalSelectedColor.colorName}) añadido a tu bolsa.`, 'success');
            
            const originalContent = modalAddToCartBtn.innerHTML;
            modalAddToCartBtn.innerHTML = '<span class="text-green-500 font-sans tracking-widest text-sm">¡AÑADIDO CON ÉXITO!</span>';
            
            setTimeout(() => {
                modalAddToCartBtn.innerHTML = originalContent;
                closeModal();
            }, 1200);
        });
    }

    // ===== TOAST NOTIFICATIONS =====
    function showToast(message, type = 'success') {
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
        }, 4000);
    }
});