# Manual de Usuario y Documentación Técnica
## Plataforma E-commerce

---

## 1. Introducción
¡Bienvenido a tu nueva tienda en línea! Esta plataforma ha sido diseñada a medida para ofrecer una experiencia de compra rápida, moderna y segura para tus clientes, al mismo tiempo que te proporciona a ti (el administrador) un panel de control intuitivo para gestionar todo tu catálogo sin necesidad de conocimientos técnicos.

---

## 2. Características y Funcionalidades Implementadas

Se ha desarrollado una solución "Full-Stack" (tecnología de punta tanto visual como detrás de escena) para garantizar rendimiento y seguridad:

### 🛍️ Experiencia del Cliente (Frontend)
*   **Diseño Moderno y Rápido:** Interfaz de usuario fluida creada con React, que permite a los usuarios navegar entre productos sin tiempos de carga molestos.
*   **Catálogo Dinámico:** Visualización atractiva de productos con soporte para mostrar "Precios de Descuento" (ofertas destacadas).
*   **Carrito de Compras Integrado:** Los clientes pueden agregar productos, revisar su selección y ver el total a pagar en tiempo real.
*   **Checkout Simplificado:** Formulario de finalización de compra optimizado para no perder ventas.

### 🛡️ Administración y Gestión (Backend)
*   **Panel de Administración Privado:** Un área segura y protegida por contraseña exclusiva para el dueño de la tienda.
*   **Base de Datos en la Nube (Supabase):** Todos los productos, precios y datos están sincronizados globalmente y respaldados de forma segura.
*   **Gestión de Inventario (CRUD):** 
    *   **Crear:** Añadir nuevos productos fácilmente.
    *   **Leer:** Visualizar el inventario actual.
    *   **Actualizar:** Modificar precios, nombres o imágenes con un par de clics.
    *   **Eliminar:** Quitar productos que ya no estén en stock.
*   **Almacenamiento de Imágenes Avanzado:** Subida de imágenes de alta calidad directamente a la nube de Supabase (Storage), garantizando que las fotos carguen rápido para los clientes.

### 💳 Pagos y Seguridad
*   **Integración Oficial con Mercado Pago:** Conexión segura mediante servidores (Edge Functions) para procesar pagos.
*   **Soporte para Cuotas:** Tus clientes tienen la facilidad de pagar hasta en 3 cuotas (o lo configurado) directamente desde el checkout.
*   **Despliegue Global (Netlify):** La página está alojada en servidores de alto rendimiento, garantizando que tu tienda esté abierta las 24 horas del día, los 7 días de la semana.

---

## 3. Guía de Uso: Panel de Administración

Esta sección te enseñará cómo mantener tu tienda actualizada.

### A. ¿Cómo ingresar al Panel?
1. Ingresa a la dirección de tu tienda y añade `/admin` al final de la URL (Ejemplo: `www.tutienda.com/admin`).
2. El sistema te pedirá una **contraseña de seguridad**. 
3. Ingresa la contraseña asignada para acceder al panel de control.

### B. ¿Cómo agregar un nuevo producto?
1. Dentro del panel de administración, localiza el formulario de **Nuevo Producto**.
2. Completa los siguientes campos:
   *   **Nombre del producto:** Ej. "Zapatillas Deportivas".
   *   **Precio Original:** El precio base del producto.
   *   **Precio con Descuento (Opcional):** Si el producto está en oferta, ingresa el precio menor aquí. El sistema automáticamente mostrará el descuento a los clientes.
   *   **Categoría:** Para organizar tu tienda.
   *   **Imagen:** Haz clic en subir archivo y selecciona la foto desde tu computadora o celular.
3. Haz clic en el botón **"Guardar / Agregar Producto"**. El producto aparecerá instantáneamente en la tienda pública.

### C. ¿Cómo editar o actualizar un producto?
1. En el panel de administración, verás la lista de todos tus productos actuales.
2. Busca el producto que deseas cambiar y haz clic en el botón **"Editar"** (ícono de lápiz o botón similar).
3. Modifica el precio, el nombre o sube una nueva imagen.
4. Guarda los cambios.

### D. ¿Cómo eliminar un producto?
1. En la lista de productos del panel, localiza el ítem que ya no vendes.
2. Haz clic en el botón **"Eliminar"** (ícono de papelera).
3. El sistema te pedirá confirmación. Al aceptar, el producto desaparecerá de la base de datos y de la vista de los clientes.

---

## 4. Guía de Uso: Proceso de Compra (Clientes)

Así es como comprarán tus clientes:
1. **Explorar:** El cliente entra a la página web y navega por el catálogo.
2. **Seleccionar:** Al ver un producto que le gusta, hace clic en "Ver detalles" o "Agregar al carrito".
3. **Revisar Carrito:** El cliente revisa los productos seleccionados y el total de la compra.
4. **Checkout:** Proporciona sus datos básicos de contacto/envío.
5. **Pago Seguro:** Al hacer clic en "Pagar", se abre la pasarela segura de Mercado Pago. El cliente elige su método de pago (tarjeta de crédito, débito, dinero en cuenta) y las cuotas deseadas.
6. **Confirmación:** Una vez aprobado el pago, la orden se registra exitosamente.

---
*Documentación generada para la entrega final del proyecto.*
