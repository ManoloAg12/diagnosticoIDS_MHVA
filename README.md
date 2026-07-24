# Urban Kicks - Interfaz de Usuario (UI)

Este proyecto contiene la estructura y el diseño base de la interfaz para la tienda de calzado Urban Kicks. Actualmente se encuentra en fase de maquetación y diseño visual. 

> **Nota sobre el estado del desarrollo:** Las lógicas complejas de compra y el carrito aún están en proceso de construcción. Por el momento, el funcionamiento principal se centra exclusivamente en la experiencia visual, la estructura y el modo oscuro.

## Arquitectura de Archivos

Se ha establecido la siguiente organización para mantener el proyecto modular:

* **`assets/`**: Nuevo directorio para almacenar recursos estáticos, subdividido en carpetas para iconos (`icons/`) e imágenes (`img/`).
* **`css/`**: Contiene el archivo `style.css` modificado con estilos personalizados, efectos visuales y animaciones.
* **`data/`**: Aloja el archivo `data.json`, preparado para simular la carga de datos del catálogo.
* **`js/`**: Contiene la lógica de la interfaz. Incluye el archivo principal modificado `main.js` y la preparación del nuevo archivo `cart.js`.
* **`pages/`**: Directorio creado para manejar las vistas secundarias de la tienda, comenzando con la maquetación de `cart.html`.

## Avances Implementados

* **Catálogo Dinámico:** Carga de productos estructurada a través de un archivo centralizado `data.json`.
* **Modo Oscuro y Claro:** Sistema de cambio de tema persistente mediante `localStorage` con detección automática de las preferencias del sistema y anti-parpadeo al cargar.
* **Visor Interactivo y Carrusel 3D:** Rotación automática de imágenes por producto y aplicación dinámica de filtros de color en tiempo real.
* **Páginas por Categorías:** Vistas especializadas para **Hombre**, **Mujer** y **Ofertas** (con precios rebajados y etiquetas dinámicas), manteniendo un diseño consistente en todo el sitio.
* **Ventana Modal Premium:** Vista rápida emergente al hacer clic en los productos, permitiendo explorar miniaturas, cambiar entre colores disponibles y agregar al carrito al instante.
* **Sistema de Carrito de Compras:** Gestión de compras con almacenamiento local (`localStorage`), contador dinámico con efecto visual de rebote (*bump*) y notificaciones flotantes (*Toasts*).
* **Información Localizada:** Footer adaptado con datos de contacto y dirección ficticia en **Santa Ana, El Salvador**.