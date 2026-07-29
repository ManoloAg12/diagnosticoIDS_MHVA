# Urban Kicks - Tienda Premium de Calzado Urbano 👟

Urban Kicks es una plataforma web moderna, interactiva y responsiva para una tienda de calzado urbano multimarca. El proyecto cuenta con un diseño de alta gama (*Dark/Light mode*), un visor de productos dinámico con carrusel de imágenes, vistas dedicadas por categorías y un sistema completo de carrito de compras y checkout integrado.

## 🚀 Características Principales

*   **Catálogo Dinámico:** Carga de productos estructurada a través de un archivo centralizado `data.json`. Las rutas de las imágenes están organizadas por marca para un fácil mantenimiento.
*   **Componentización (Layout Dinámico):** Un único archivo `layout.js` inyecta dinámicamente el Header, Footer, Modal y las notificaciones Toast en todas las páginas. Esto mantiene el código HTML extremadamente limpio, modular y fácil de actualizar en toda la plataforma.
*   **Modo Oscuro y Claro:** Sistema de cambio de tema persistente mediante `localStorage` con detección automática de las preferencias del sistema y protección anti-parpadeo (*FOUC*) al cargar la página.
*   **Visor Interactivo y Carrusel 3D:** Rotación automática de imágenes por producto y aplicación dinámica de filtros de color CSS en tiempo real sin necesidad de recargar la página.
*   **Ventana Modal Premium:** Vista rápida emergente al hacer clic en los productos. Permite explorar miniaturas, cambiar entre los colores disponibles y agregar al carrito al instante.
*   **Sistema de Carrito de Compras (LocalStorage):**
    *   Gestión de estado del carrito persistente (agregar/remover productos).
    *   Contador dinámico en la barra de navegación con efecto visual de rebote (*bump*).
    *   Notificaciones flotantes (*Toasts*) personalizadas para acciones de éxito, error o información.
*   **Checkout y Pasarela de Pago Simulada:**
    *   **Formulario de Envío Dinámico:** Incluye un selector anidado para el Departamento y Ciudad específico para **El Salvador**, donde la ciudad se actualiza según el departamento seleccionado.
    *   **Selector de Método de Pago:** Opciones para Tarjeta de Crédito, PayPal y Bitcoin.
    *   **Descuento Dinámico:** Aplicación automática de un 3% de descuento en el total si el usuario selecciona pago con Tarjeta.
    *   **Formateo de Tarjeta:** Inputs interactivos que formatean en tiempo real el número de tarjeta (espacios cada 4 dígitos), fecha de expiración (MM/YY) y limitan el CVV a números.
    *   **Animación de Compra:** Proceso simulado de validación con *spinner* de carga y pantalla final de éxito animada que vacía automáticamente el carrito.
*   **Información Localizada:** Footer adaptado con datos de contacto y dirección ficticia en **Santa Ana, El Salvador**.

## 📂 Arquitectura de Archivos

La estructura del proyecto se encuentra organizada y modularizada de la siguiente manera:

```text
urban-kicks/
│
├── assets/
│   ├── icons/       # Iconos y elementos gráficos (SVG)
│   └── img/         # Imágenes de productos estructuradas por marca
│       ├── airmax/
│       ├── DUNK LOW/
│       ├── JORDAN 1/
│       ├── NEW BALANCE/
│       └── YEEZY BOOST/
│
├── css/
│   └── style.css    # Estilos personalizados, animaciones y scrollbars
│
├── data/
│   └── data.json    # Base de datos centralizada (zapatos, precios, stock, colores y banderas de oferta)
│
├── js/
│   ├── layout.js    # ⚡ Inyector global de componentes (Header, Footer, Modal, Toasts)
│   ├── main.js      # Lógica del visor 3D en la página principal
│   ├── zhombres.js  # Filtrado y renderizado para la colección de hombres
│   ├── zmujeres.js  # Filtrado y renderizado para la colección de mujeres
│   ├── zofertas.js  # Filtrado de productos en oferta con cálculo de precios rebajados
│   └── cart.js      # Motor del carrito, checkout, lógica de pagos y selects dinámicos
│
├── pages/
│   ├── cart.html    # Interfaz del carrito y proceso de checkout
│   ├── hombre.html  # Vista inyectada de calzado para hombres
│   ├── mujer.html   # Vista inyectada de calzado para mujeres
│   └── ofertas.html # Vista inyectada de rebajas y ofertas especiales
│
└── index.html       # Página principal (Home / Visor 3D)