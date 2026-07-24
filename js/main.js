// js/main.js - Lógica interactiva con Paleta Black, Carrusel 3D y Ventana Modal Premium

document.addEventListener('DOMContentLoaded', async () => {
    
    // ===== ELEMENTOS DEL DOM (Principal) =====
    const productTitle = document.getElementById('product-title');
    const productSubtitle = document.getElementById('product-subtitle');
    const productPrice = document.getElementById('product-price');
    const mainShoeImg = document.getElementById('main-shoe-img');
    const modelsSidebar = document.getElementById('models-sidebar');
    const colorSelector = document.getElementById('color-selector');
    const sizeSelector = document.getElementById('size-selector');
    const bgWatermark = document.getElementById('bg-watermark');
    const bodyBg = document.getElementById('body-bg');
    const cartCount = document.getElementById('cart-count');
    const cartBadge = document.getElementById('cart-badge');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const toastContainer = document.getElementById('toast-container');
    const productBadge = document.getElementById('product-badge');

    // ===== ELEMENTOS DEL DOM (Modal) =====
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
        
        // El fondo oscuro principal ahora es Negro Absoluto (#000000)
        if (currentColor) {
            bodyBg.style.backgroundColor = isDark ? '#000000' : `${currentColor.colorHex}15`;
        }
        
        showToast(isDark ? 'Modo Oscuro activado' : 'Modo Claro activado', 'info');
    });

    // ===== ESTADO GLOBAL DE LA APP =====
    let shoesData = [];
    let currentModel = null;
    let currentColor = null;
    let cartItems = 0;
    let selectedSize = null;
    
    // Variables para el Carrusel de Imágenes
    let imageInterval = null;
    let currentImageIndex = 0;

    // Variable para la ventana modal
    let modalCurrentShoe = null;

    // Leer el carrito guardado al cargar la página principal
    const savedCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
    cartItems = savedCart.length;
    if (cartBadge) cartBadge.textContent = cartItems;

    // ===== FETCH DATA =====
    try {
        const response = await fetch('./data/data.json');
        const data = await response.json();
        shoesData = data.shoes;
        
        if(shoesData.length > 0) {
            initApp(shoesData[0]);
            renderModelsSidebar();
        }
    } catch (error) {
        console.error("Error cargando el JSON:", error);
        showToast('Error al cargar catálogo', 'error');
    }

    // ===== INICIALIZAR APP =====
    function initApp(model) {
        currentModel = model;
        currentColor = model.colors[0];
        selectedSize = model.availableSizes[2] || model.availableSizes[0];
        updateUI();
        renderColorSelector();
        renderSizeSelector();
        updateBadge();
    }

    // ===== ACTUALIZAR UI CON ANIMACIÓN Y CARRUSEL =====
    function updateUI() {
        // Limpiar el carrusel anterior si existe
        if (imageInterval) {
            clearInterval(imageInterval);
        }
        currentImageIndex = 0;

        mainShoeImg.classList.add('opacity-0', 'scale-90');
        productTitle.classList.add('opacity-0', 'translate-y-4');
        productPrice.classList.add('opacity-0', 'translate-y-4');
        
        setTimeout(() => {
            productTitle.textContent = currentModel.name;
            productSubtitle.textContent = currentModel.subtitle;
            productPrice.textContent = `$${currentModel.price.toFixed(2)}`;
            bgWatermark.textContent = currentModel.name.split(' ')[0];
            
            // Determinar si hay arreglo de imágenes o usar la base
            const imagesArray = currentModel.images && currentModel.images.length > 0 
                                ? currentModel.images 
                                : [currentModel.baseImage];
            
            // Cargar la primera imagen
            mainShoeImg.src = imagesArray[0];
            mainShoeImg.style.filter = currentColor.cssFilter;
            
            const isDark = document.documentElement.classList.contains('dark');
            bodyBg.style.backgroundColor = isDark ? '#000000' : `${currentColor.colorHex}15`;
            bodyBg.style.transition = 'background-color 0.8s ease';
            
            if (currentModel.colors.length > 1) {
                productBadge.textContent = `${currentModel.colors.length} opciones`;
                productBadge.classList.remove('hidden');
            } else {
                productBadge.classList.add('hidden');
            }
            
            setTimeout(() => {
                mainShoeImg.classList.remove('opacity-0', 'scale-90');
                mainShoeImg.classList.add('opacity-100', 'scale-100');
                productTitle.classList.remove('opacity-0', 'translate-y-4');
                productPrice.classList.remove('opacity-0', 'translate-y-4');

                // === INICIAR CARRUSEL SI HAY MÁS DE 1 IMAGEN ===
                if (imagesArray.length > 1) {
                    imageInterval = setInterval(() => {
                        mainShoeImg.classList.add('opacity-0'); 
                        
                        setTimeout(() => {
                            currentImageIndex = (currentImageIndex + 1) % imagesArray.length;
                            mainShoeImg.src = imagesArray[currentImageIndex];
                            mainShoeImg.classList.remove('opacity-0'); 
                        }, 300); 
                    }, 3500); 
                }
            }, 50);
            
        }, 400);
    }

    // ===== RENDER MODELOS (SIDEBAR) =====
    function renderModelsSidebar() {
        modelsSidebar.innerHTML = '';
        shoesData.forEach((model, index) => {
            const btn = document.createElement('div');
            
            const activeClasses = currentModel?.id === model.id ? 'border-brand-black dark:border-white shadow-md bg-white dark:bg-brand-darkCard' : 'border-transparent dark:bg-brand-darkCard/50';
            btn.className = `w-full h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md bg-white/60 dark:bg-brand-darkCard hover:bg-white dark:hover:bg-brand-darkCard/80 border p-2 ${activeClasses}`;
            btn.style.transitionDelay = `${index * 30}ms`;
            
            const img = document.createElement('img');
            img.src = model.baseImage;
            img.className = 'h-full object-contain drop-shadow-md transform -rotate-12';
            img.style.filter = model.colors[0].cssFilter;
            img.alt = model.name;
            
            const label = document.createElement('span');
            label.className = 'text-[10px] font-bold uppercase tracking-wider text-brand-black dark:text-gray-300 ml-2 hidden lg:block';
            label.textContent = model.name.split(' ')[0];
            
            btn.appendChild(img);
            btn.appendChild(label);
            btn.addEventListener('click', () => {
                if (currentModel?.id !== model.id) {
                    initApp(model);
                    renderModelsSidebar();
                }
            });
            modelsSidebar.appendChild(btn);
        });
    }

    // ===== RENDER COLORES =====
    function renderColorSelector() {
        colorSelector.innerHTML = '';
        currentModel.colors.forEach((color) => {
            const btn = document.createElement('button');
            const isActive = currentColor.colorId === color.colorId;
            btn.className = `w-8 h-8 rounded-full shadow-inner transition-all duration-300 hover:scale-110 border-2 ${isActive ? 'border-brand-black dark:border-white scale-110 ring-4 ring-white dark:ring-brand-darkBg' : 'border-white/50 dark:border-white/10'}`;
            btn.style.backgroundColor = color.colorHex;
            btn.title = color.colorName;
            
            btn.addEventListener('click', () => {
                currentColor = color;
                updateUI();
                renderColorSelector();
            });
            colorSelector.appendChild(btn);
        });
    }

    // ===== RENDER TALLAS =====
    function renderSizeSelector() {
        sizeSelector.innerHTML = '';
        currentModel.availableSizes.forEach((size) => {
            const btn = document.createElement('button');
            const isActive = size === selectedSize;
            
            const activeClasses = isActive 
                ? 'border-brand-black dark:border-brand-gold bg-brand-black dark:bg-brand-gold text-white dark:text-brand-black shadow-md scale-105' 
                : 'border-brand-black/20 dark:border-white/20 hover:border-brand-black dark:hover:border-white text-brand-black dark:text-gray-300 hover:bg-brand-black/5 dark:hover:bg-white/5';
                
            btn.className = `py-2 px-3 text-center border rounded-md transition-all duration-300 font-semibold text-xs ${activeClasses}`;
            btn.textContent = size;
            
            btn.addEventListener('click', () => {
                selectedSize = size;
                renderSizeSelector();
            });
            sizeSelector.appendChild(btn);
        });
    }

    // ===== BADGE DE PRODUCTO =====
    function updateBadge() {
        if (!productBadge) return;
        if (currentModel && currentModel.colors.length > 1) {
            productBadge.textContent = `${currentModel.colors.length} opciones`;
            productBadge.classList.remove('hidden');
        } else {
            productBadge.classList.add('hidden');
        }
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

    // ===== AGREGAR AL CARRITO (Desde Visor Principal) =====
    if(addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!selectedSize) {
                showToast('Selecciona una talla para continuar.', 'error');
                return;
            }
            
            const cartItem = {
                id: `${currentModel.id}-${currentColor.colorId}-${selectedSize}`, 
                name: currentModel.name,
                price: currentModel.price,
                image: currentModel.baseImage,
                colorFilter: currentColor.cssFilter,
                colorName: currentColor.colorName,
                size: selectedSize
            };

            let currentCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
            currentCart.push(cartItem);
            localStorage.setItem('urbanCart', JSON.stringify(currentCart));

            cartItems = currentCart.length;
            if (cartBadge) {
                cartBadge.textContent = cartItems;
                cartBadge.classList.add('bump');
                setTimeout(() => cartBadge.classList.remove('bump'), 300);
            }
            
            showToast(`${currentModel.name} añadido a tu bolsa.`, 'success');
            
            const originalContent = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<span class="relative z-10 font-sans tracking-widest text-green-500">AÑADIDO CON ÉXITO</span>';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = originalContent;
            }, 2000);
        });
    }

    // ===== SCROLL REVEAL =====
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    
    const elementInView = (el, percentageScroll = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100)));
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 85)) {
                el.classList.add('active');
            }
        });
    };

    // ===== EFECTO TILT 3D =====
    const shoeContainer = document.querySelector('.shoe-container');
    if (shoeContainer) {
        shoeContainer.addEventListener('mousemove', (e) => {
            const rect = shoeContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            const rotateY = x * 20;
            const rotateX = -y * 20;
            
            mainShoeImg.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
        });
        
        shoeContainer.addEventListener('mouseleave', () => {
            mainShoeImg.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
        });
    }

    // ===== LÓGICA DE LA VENTANA MODAL (PREMIUM) =====
    
    // Hacer openModal global para que el HTML pueda llamarla
    window.openModal = function(shoeId) {
        if(!productModal || !modalOverlay || !modalContent) return;

        modalCurrentShoe = shoesData.find(s => s.id === shoeId);
        if(!modalCurrentShoe) return;

        // Poblar textos
        if(modalTitle) modalTitle.textContent = modalCurrentShoe.name;
        if(modalSubtitle) modalSubtitle.textContent = modalCurrentShoe.subtitle;
        if(modalPrice) modalPrice.textContent = `$${modalCurrentShoe.price.toFixed(2)}`;
        
        // Colores y Filtros base
        const baseImg = modalCurrentShoe.baseImage;
        const defaultFilter = modalCurrentShoe.colors[0].cssFilter;
        
        if(modalMainImg) {
            modalMainImg.src = baseImg;
            modalMainImg.style.filter = defaultFilter;
        }

        // Miniaturas
        if(modalThumbnails) {
            modalThumbnails.innerHTML = '';
            if(modalCurrentShoe.images && modalCurrentShoe.images.length > 0) {
                modalCurrentShoe.images.forEach((imgSrc) => {
                    const thumb = document.createElement('button');
                    thumb.className = 'w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-2 hover:border-brand-gold transition';
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = imgSrc;
                    imgElement.className = 'w-full h-full object-contain';
                    imgElement.style.filter = defaultFilter;
                    
                    thumb.appendChild(imgElement);
                    
                    thumb.addEventListener('click', () => {
                        modalMainImg.src = imgSrc;
                    });
                    
                    modalThumbnails.appendChild(thumb);
                });
            }
        }

        // Animar entrada del modal
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
        
        setTimeout(() => {
            modalOverlay.classList.remove('opacity-0');
            modalOverlay.classList.add('opacity-100');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        // Bloquear scroll
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        if(!productModal || !modalOverlay || !modalContent) return;

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

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal && !productModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // ===== AGREGAR AL CARRITO (Desde el Modal) =====
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (!modalCurrentShoe) return;

            // Tomar el color y talla por defecto del modelo abierto
            const defaultColor = modalCurrentShoe.colors[0];
            const defaultSize = modalCurrentShoe.availableSizes[2] || modalCurrentShoe.availableSizes[0];

            const cartItem = {
                id: `${modalCurrentShoe.id}-${defaultColor.colorId}-${defaultSize}`, 
                name: modalCurrentShoe.name,
                price: modalCurrentShoe.price,
                image: modalCurrentShoe.baseImage,
                colorFilter: defaultColor.cssFilter,
                colorName: defaultColor.colorName,
                size: defaultSize
            };

            let currentCart = JSON.parse(localStorage.getItem('urbanCart')) || [];
            currentCart.push(cartItem);
            localStorage.setItem('urbanCart', JSON.stringify(currentCart));

            cartItems = currentCart.length;
            if (cartBadge) {
                cartBadge.textContent = cartItems;
                cartBadge.classList.add('bump');
                setTimeout(() => cartBadge.classList.remove('bump'), 300);
            }
            
            showToast(`${modalCurrentShoe.name} añadido a tu bolsa.`, 'success');
            
            const originalContent = modalAddToCartBtn.innerHTML;
            modalAddToCartBtn.innerHTML = '<span class="text-green-500 font-sans tracking-widest text-sm">¡AÑADIDO!</span>';
            
            setTimeout(() => {
                modalAddToCartBtn.innerHTML = originalContent;
                closeModal();
            }, 1200);
        });
    }

    // ===== EVENT LISTENERS GENERALES =====
    window.addEventListener('scroll', () => handleScrollAnimation());
    setTimeout(handleScrollAnimation, 400);

});