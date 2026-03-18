// ===== AGUARDAR CARREGAMENTO DO DOM =====
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ===== CURSOR PERSONALIZADO =====
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', function(e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        });
        
        // Efeito hover em links e botões
        const hoverElements = document.querySelectorAll('a, button, .servico-card, .galeria-item');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorFollower.style.opacity = '0.8';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorFollower.style.opacity = '0.5';
            });
        });
    }
    
    // ===== SCROLL REVEAL PREMIUM =====
    const sections = document.querySelectorAll('.section');
    const header = document.getElementById('header');
    
    const revealSection = function() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < windowHeight - revealPoint) {
                section.classList.add('revealed');
            }
        });
        
        // Efeito no header ao rolar
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Verificar elementos visíveis no carregamento
    revealSection();
    
    // Adicionar evento de scroll com throttling para performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                revealSection();
                scrollTimeout = null;
            }, 10);
        }
    });
    
    // ===== MENU MOBILE PREMIUM =====
    const hamburger = document.querySelector('.hamburger-premium');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // ===== ANIMAÇÃO DE NÚMEROS (COUNTER) =====
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateNumbers = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const current = parseInt(stat.innerText);
            const increment = target / 50;
            
            if (current < target) {
                stat.innerText = Math.ceil(current + increment);
                setTimeout(animateNumbers, 20);
            } else {
                stat.innerText = target;
            }
        });
    };
    
    // Iniciar contagem quando a seção estiver visível
    const sobreSection = document.getElementById('sobre');
    let animated = false;
    
    const checkSobre = () => {
        if (!animated && sobreSection.getBoundingClientRect().top < window.innerHeight - 200) {
            animateNumbers();
            animated = true;
        }
    };
    
    window.addEventListener('scroll', checkSobre);
    checkSobre(); // Verificar no carregamento
    
    // ===== CONFIGURAR DATA MÍNIMA =====
    const dataInput = document.getElementById('data');
    
    if (dataInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        dataInput.min = todayFormatted;
    }
    
    // ===== AGENDAMENTO WHATSAPP PREMIUM =====
    const btnAgendar = document.getElementById('agendar-whatsapp');
    
    if (btnAgendar) {
        btnAgendar.addEventListener('click', function(e) {
            e.preventDefault();
            
            const servico = document.getElementById('servico').value;
            const data = document.getElementById('data').value;
            const horario = document.getElementById('horario').value;
            const profissional = document.getElementById('profissional')?.value || 'Não especificado';
            
            if (!servico || !data || !horario) {
                // Notificação personalizada
                showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            // Formatar data
            const dataObj = new Date(data + 'T12:00:00');
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            const ano = dataObj.getFullYear();
            const dataFormatada = `${dia}/${mes}/${ano}`;
            
            // Número do WhatsApp
            const numero = '5586994645340';
            
            // Montar mensagem premium
            let mensagem = `Olá! \n\n`;
            mensagem += `Gostaria de agendar um horário na Barbearia do Nonato.\n\n`;
            mensagem += `*Serviço:* ${servico}\n`;
            mensagem += `*Data:* ${dataFormatada}\n`;
            mensagem += `*Horário:* ${horario}\n`;
            mensagem += `*Profissional:* ${profissional}\n\n`;
            mensagem += `Agradeço a atenção e aguardo confirmação.`;
            
            // Codificar para URL
            const mensagemCodificada = encodeURIComponent(mensagem);
            
            // Criar link do WhatsApp
            const whatsappLink = `https://wa.me/${numero}?text=${mensagemCodificada}`;
            
            // Abrir link
            window.open(whatsappLink, '_blank');
        });
    }
    
    // ===== NOTIFICAÇÃO PERSONALIZADA =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '⚠️' : '✅'}</span>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // ===== LIGHTBOX PARA GALERIA =====
    const galeriaItems = document.querySelectorAll('.galeria-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const images = [];
    
    if (galeriaItems.length > 0) {
        galeriaItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.overlay-content h4')?.innerText || 'Barbearia do Nonato';
            
            images.push({
                src: img.src,
                caption: caption
            });
            
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        });
    }
    
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function updateLightbox() {
        lightboxImg.src = images[currentIndex].src;
        lightboxCaption.innerText = images[currentIndex].caption;
    }
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox();
        });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox();
        });
    }
    
    // Fechar lightbox com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox();
        }
        
        if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox();
        }
    });
    
    // ===== SCROLL SUAVE PREMIUM =====
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== EFECTO 3D NOS CARDS (TILT) =====
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // ===== NEWSLETTER SUBMIT =====
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            
            if (email) {
                showNotification('Obrigado por se inscrever! Em breve você receberá novidades.', 'success');
                newsletterForm.reset();
            }
        });
    }
    
    // ===== ANIMAÇÃO DE LOADING DO SITE =====
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Pré-carregar imagens da galeria
        images.forEach(img => {
            const image = new Image();
            image.src = img.src;
        });
    });
    
    // ===== DETECTAR TOUCH DEVICE =====
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // ===== INTERSEÇÃO OBSERVER PARA ANIMAÇÕES (fallback) =====
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    console.log('🚀 Barbearia do Nonato Premium carregada com sucesso!');
});