        // 1. Iniciar Animaciones
        AOS.init({ once: true, offset: 100, duration: 800 });

        // 2. Comportamiento del Navbar y Logo
        const navbar = document.getElementById('navbar');
        const heroLogo = document.getElementById('hero-logo');

        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY;
            if (scrollY > 100) {
                navbar.classList.remove('-translate-y-full', 'opacity-0');
                navbar.classList.add('translate-y-0', 'opacity-100');
            } else {
                navbar.classList.add('-translate-y-full', 'opacity-0');
                navbar.classList.remove('translate-y-0', 'opacity-100');
            }
            if (heroLogo) {
                let opacity = 1 - (scrollY / 250);
                heroLogo.style.opacity = Math.max(opacity, 0);
            }
        });

        // 3. Slider Híbrido Infinito
        const sliderMarcas = document.getElementById('brands-slider');
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

        // 4. Formulario de Contacto (Apunta a la API de Render)
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            const statusDiv = document.getElementById('formStatus');
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                asunto: document.getElementById('asunto').value,
                mensaje: document.getElementById('mensaje').value
            };

            try {
                // Aquí se envía al backend desplegado para usar Resend"
                const response = await fetch('https://santaelvira.onrender.com/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    statusDiv.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
                    statusDiv.className = 'text-center text-sm font-bold p-3 rounded-lg bg-green-100 text-green-800 mt-4 block';
                    document.getElementById('contactForm').reset();
                } else {
                    throw new Error('Error en el servidor');
                }
            } catch (error) {
                statusDiv.textContent = 'Hubo un error al enviar el mensaje. Intenta nuevamente.';
                statusDiv.className = 'text-center text-sm font-bold p-3 rounded-lg bg-red-100 text-red-800 mt-4 block';
            } finally {
                btn.textContent = 'Enviar Mensaje';
                btn.disabled = false;
            }
        });