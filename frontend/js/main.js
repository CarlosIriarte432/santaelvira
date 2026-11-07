// 1. Iniciar Animaciones (AOS) - Velocidad acelerada
AOS.init({ 
    once: true, 
    offset: 50, 
    duration: 400 
});

// 2. Comportamiento del Navbar y Logo
const navbar = document.getElementById('navbar');
const heroLogo = document.getElementById('hero-logo');

window.addEventListener('scroll', () => {
    let scrollY = window.scrollY;
    
    // Mostrar/Ocultar Navbar
    if (scrollY > 100) {
        navbar.classList.remove('-translate-y-full', 'opacity-0');
        navbar.classList.add('translate-y-0', 'opacity-100');
    } else {
        navbar.classList.add('-translate-y-full', 'opacity-0');
        navbar.classList.remove('translate-y-0', 'opacity-100');
    }
    
    // Difuminar Logo del Hero
    if (heroLogo) {
        let opacity = 1 - (scrollY / 250);
        heroLogo.style.opacity = Math.max(opacity, 0);
    }
});

// 3. Slider Híbrido Infinito
const sliderMarcas = document.getElementById('brands-slider');
if (sliderMarcas) {
    let isDown = false;
    let startX;
    let scrollLeftPos;
    let animationId;
    const autoScrollSpeed = 1;

    function startAutoScroll() {
        if (!isDown) {
            sliderMarcas.scrollLeft += autoScrollSpeed;
            checkLoop();
        }
        animationId = requestAnimationFrame(startAutoScroll);
    }

    function checkLoop() {
        if (sliderMarcas.scrollLeft >= sliderMarcas.scrollWidth / 2) {
            sliderMarcas.scrollLeft -= sliderMarcas.scrollWidth / 2;
        } else if (sliderMarcas.scrollLeft <= 0) {
            sliderMarcas.scrollLeft += sliderMarcas.scrollWidth / 2;
        }
    }

    sliderMarcas.addEventListener('mousedown', (e) => {
        isDown = true;
        sliderMarcas.classList.add('active');
        startX = e.pageX - sliderMarcas.offsetLeft;
        scrollLeftPos = sliderMarcas.scrollLeft;
        cancelAnimationFrame(animationId);
    });

    sliderMarcas.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        sliderMarcas.classList.remove('active');
        startAutoScroll();
    });

    sliderMarcas.addEventListener('mouseup', () => {
        isDown = false;
        sliderMarcas.classList.remove('active');
        startAutoScroll();
    });

    sliderMarcas.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderMarcas.offsetLeft;
        const walk = (x - startX) * 2;
        sliderMarcas.scrollLeft = scrollLeftPos - walk;
        checkLoop();
    });

    sliderMarcas.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - sliderMarcas.offsetLeft;
        scrollLeftPos = sliderMarcas.scrollLeft;
        cancelAnimationFrame(animationId);
    }, {passive: true});

    sliderMarcas.addEventListener('touchend', () => {
        isDown = false;
        startAutoScroll();
    });

    sliderMarcas.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - sliderMarcas.offsetLeft;
        const walk = (x - startX) * 2;
        sliderMarcas.scrollLeft = scrollLeftPos - walk;
        checkLoop();
    }, {passive: true});

    startAutoScroll();
}

// 4. Lógica de Pestañas y Envio de Formularios Multiples
const tabs = document.querySelectorAll('.form-tab');
const forms = document.querySelectorAll('.contact-form');
const statusDiv = document.getElementById('formStatus');

// Función para cambiar entre formularios
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Reset estilos de todas las tarjetas
        tabs.forEach(t => {
            t.classList.remove('border-brand-logoRed', 'bg-red-50', 'text-brand-logoRed');
            t.classList.add('border-stone-200', 'bg-white', 'text-stone-500');
        });

        // Activar la tarjeta clickeada
        tab.classList.remove('border-stone-200', 'bg-white', 'text-stone-500');
        tab.classList.add('border-brand-logoRed', 'bg-red-50', 'text-brand-logoRed');

        // Ocultar todos los formularios
        forms.forEach(f => {
            f.classList.add('hidden');
            f.classList.remove('block');
        });

        // Mostrar el formulario correspondiente
        const targetId = tab.id.replace('btn-', 'form-');
        const targetForm = document.getElementById(targetId);
        targetForm.classList.remove('hidden');
        targetForm.classList.add('block');
        
        // Limpiar mensajes de status anteriores
        statusDiv.classList.add('hidden');
    });
});

// Función centralizada para enviar cualquiera de los 3 formularios
forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.submitBtn');
        const originalBtnText = btn.textContent;
        btn.textContent = 'Procesando...';
        btn.disabled = true;
        statusDiv.classList.add('hidden');

        // Capturar todos los datos del formulario específico
        const formDataRaw = new FormData(form);
        const data = Object.fromEntries(formDataRaw.entries());

        // Empaquetar los datos extra en el formato que espera tu backend (nombre, email, asunto, mensaje)
        const asuntoFinal = data.asunto ? `[${data.tipoFormulario}] ${data.asunto}` : `[${data.tipoFormulario}] Solicitud de ${data.empresa}`;
        
        let mensajeFinal = `DATOS DEL CONTACTO:\n`;
        mensajeFinal += `- Empresa/Negocio: ${data.empresa || 'No especificado'}\n`;
        mensajeFinal += `- Teléfono: ${data.telefono}\n`;
        
        if (data.volumen) mensajeFinal += `- Volumen Estimado: ${data.volumen}\n`;
        if (data.referencia) mensajeFinal += `- Referencia/Lote/Pedido: ${data.referencia}\n`;
        
        mensajeFinal += `\nMENSAJE:\n${data.mensaje}`;

        const payload = {
            nombre: data.nombre,
            email: data.email,
            asunto: asuntoFinal,
            mensaje: mensajeFinal
        };

        try {
            // Envío a tu servidor actual en Render sin necesidad de alterar el backend
            const response = await fetch('https://santaelvira.onrender.com/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                statusDiv.textContent = '¡Mensaje enviado con éxito! Nuestro equipo lo revisará a la brevedad.';
                statusDiv.className = 'text-center text-sm font-bold p-3 rounded-lg bg-green-100 text-green-800 mt-4 block';
                form.reset();
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            statusDiv.textContent = 'Hubo un error al enviar el mensaje. Intenta nuevamente.';
            statusDiv.className = 'text-center text-sm font-bold p-3 rounded-lg bg-red-100 text-red-800 mt-4 block';
        } finally {
            btn.textContent = originalBtnText;
            btn.disabled = false;
        }
    });
});