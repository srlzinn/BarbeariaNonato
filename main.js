// ===== AGUARDAR CARREGAMENTO DO DOM =====
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== SISTEMA DE AGENDAMENTO COM REDIRECIONAMENTO DINÂMICO PARA WHATSAPP =====
    
    // Objeto com os dados dos profissionais disponíveis na barbearia
    const profissionais = {
        nonato: {
            nome: "Nonato",
            telefone: "5586999999999" // Telefone do Nonato
        },
        lailson: {
            nome: "Lailson",
            telefone: "5586988888888" // Telefone do Lailson
        },
        junior: {
            nome: "Junior",
            telefone: "5586812345678" // Telefone do Junior
        }
    };

    /**
     * Função responsável por gerar o link personalizado do WhatsApp
     * @param {string} profissionalId - ID do profissional (nonato, lailson, junior)
     * @param {string} servico - Serviço selecionado
     * @param {string} horario - Horário escolhido
     * @returns {string} Link formatado para WhatsApp
     */
    function gerarLinkAgendamento(profissionalId, servico, horario) {
        // Busca os dados do profissional no objeto profissionais
        const profissional = profissionais[profissionalId];
        
        // Valida se o profissional existe
        if (!profissional) {
            console.error('Profissional não encontrado:', profissionalId);
            return null;
        }

        // Cria a mensagem personalizada no formato solicitado
        const mensagem = `Olá ${profissional.nome}, gostaria de agendar:

Serviço: ${servico}
Horário: ${horario}`;

        // Codifica a mensagem para ser usada em URLs (substitui espaços, caracteres especiais, etc)
        const mensagemCodificada = encodeURIComponent(mensagem);
        
        // Gera o link completo do WhatsApp
        // Formato: https://wa.me/55DDDNUMERO?text=MENSAGEM_CODIFICADA
        const link = `https://wa.me/${profissional.telefone}?text=${mensagemCodificada}`;
        
        return link;
    }

    // ===== CONFIGURAR DATA MÍNIMA E IMPEDIR DATAS ANTERIORES =====
    const dataInput = document.getElementById('data');
    if (dataInput) {
        function getTodayDateFormatted() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }
        // Define o mínimo como hoje
        const todayFormatted = getTodayDateFormatted();
        dataInput.min = todayFormatted;

        // Impede datas menores que o mínimo
        dataInput.addEventListener('change', function() {
            if (dataInput.value < todayFormatted) {
                dataInput.value = todayFormatted;
                // Opcional: mostra uma notificação ou alerta
                if (typeof showNotification === 'function') {
                    showNotification('Não é possível agendar para dias anteriores ao atual.', 'error');
                } else {
                    alert('Não é possível agendar para dias anteriores ao atual.');
                }
            }
        });
    }

    // ===== AGENDAMENTO WHATSAPP PREMIUM DINÂMICO =====
    const btnAgendar = document.getElementById('agendar-whatsapp');
    if (btnAgendar) {
        btnAgendar.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Captura os valores dos campos do formulário
            const servico = document.getElementById('servico')?.value?.trim() || '';
            const data = document.getElementById('data')?.value || '';
            const horario = document.getElementById('horario')?.value?.trim() || '';
            const profissionalId = document.getElementById('profissional')?.value?.trim() || 'qualquer';
            
            // Verifica se a data selecionada não é anterior à data atual
            let isDataInvalida = false;
            if (data) {
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const dataSelecionada = new Date(data + 'T00:00:00');
                if (dataSelecionada < hoje) {
                    isDataInvalida = true;
                }
            }
            
            // Validação dos campos obrigatórios
            if (!servico || !data || !horario) {
                showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            // Validação de data anterior
            if (isDataInvalida) {
                showNotification('Não é possível agendar para dias anteriores ao atual.', 'error');
                return;
            }
            
            // Validação do profissional selecionado
            if (!profissionalId || profissionalId === 'qualquer') {
                showNotification('Por favor, selecione um profissional para o agendamento.', 'error');
                return;
            }

            // Formata a data para exibição (formato brasileiro)
            const dataObj = new Date(data + 'T12:00:00');
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            const ano = dataObj.getFullYear();
            const dataFormatada = `${dia}/${mes}/${ano}`;
            
            // Gera o link personalizado baseado no profissional selecionado
            const linkWhatsApp = gerarLinkAgendamento(profissionalId, servico, `${dataFormatada} às ${horario}`);
            
            // Verifica se o link foi gerado corretamente
            if (linkWhatsApp) {
                // Abre o link em uma nova aba
                window.open(linkWhatsApp, '_blank');
                
                // Notificação de sucesso
                showNotification('Redirecionando para o WhatsApp do profissional selecionado!', 'success');
            } else {
                // Notificação de erro
                showNotification('Erro ao gerar link de agendamento. Tente novamente.', 'error');
            }
        });
    }

    // ===== CURSOR PERSONALIZADO DINÂMICO =====
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower) {
        const setCursorPosition = (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        };
        document.addEventListener('mousemove', setCursorPosition);

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

    // ===== SCROLL REVEAL PREMIUM DINÂMICO =====
    const sections = document.querySelectorAll('.section');
    const header = document.getElementById('header');

    function revealSection() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < windowHeight - revealPoint) {
                section.classList.add('revealed');
            } else {
                section.classList.remove('revealed');
            }
        });
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
    revealSection();
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                revealSection();
                scrollTimeout = null;
            }, 10);
        }
    });

    // ===== MENU MOBILE PREMIUM DINÂMICO =====
    const hamburger = document.querySelector('.hamburger-premium');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    if (navLinks && hamburger && navMenu) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
    if (hamburger && navMenu) {
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // ===== ANIMAÇÃO DINÂMICA DE NÚMEROS (COUNTER) =====
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;
    function animateNumbers() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const current = parseInt(stat.innerText.replace(/\D/g, '')) || 0;
            const increment = Math.max(1, Math.ceil(target / 50));
            if (current < target) {
                stat.innerText = Math.min(current + increment, target);
                setTimeout(animateNumbers, 20);
            } else {
                stat.innerText = target;
            }
        });
    }
    const sobreSection = document.getElementById('sobre');
    function checkSobre() {
        if (!counterAnimated && sobreSection && sobreSection.getBoundingClientRect().top < window.innerHeight - 200) {
            animateNumbers();
            counterAnimated = true;
        }
    }
    window.addEventListener('scroll', checkSobre);
    checkSobre();

    // ===== NOVO: POLÍTICA DE AGENDAMENTO (BOTÃO) =====
    // Seleciona botão ou link com id "politica-agendamento"
    const btnPoliticaAgendamento = document.getElementById('politica-agendamento');
    if (btnPoliticaAgendamento) {
        btnPoliticaAgendamento.addEventListener('click', function(e) {
            e.preventDefault();
            // Exemplo: abre um modal se existir, ou abre um link/pop-up
            // Primeiro, tenta abrir um modal com o id "modal-politica-agendamento"
            const modalPolitica = document.getElementById('modal-politica-agendamento');
            if (modalPolitica) {
                modalPolitica.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Botão de fechar modal
                const btnClose = modalPolitica.querySelector('.modal-close');
                if (btnClose) {
                    btnClose.addEventListener('click', function() {
                        modalPolitica.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    });
                }
                // Fechar ao clicar fora do conteúdo
                modalPolitica.addEventListener('click', function(ev) {
                    if (ev.target === modalPolitica) {
                        modalPolitica.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                });
            } else {
                // Se não houver modal, abrir uma nova aba para política
                window.open('/politica-agendamento.html', '_blank');
            }
        });
    }

    // ===== NOTIFICAÇÃO PERSONALIZADA DINÂMICA =====
    function showNotification(message, type = 'info') {
        // Remove any existing notification first
        document.querySelectorAll('.notification').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '⚠️' : '✅'}</span>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== LIGHTBOX PARA GALERIA DINÂMICO =====
    const galeriaItems = document.querySelectorAll('.galeria-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentIndex = 0;
    let images = [];

    if (galeriaItems.length > 0) {
        images = Array.from(galeriaItems).map((item, index) => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.overlay-content h4')?.innerText || 'Barbearia do Nonato';
            item.addEventListener('click', () => openLightbox(index));
            return { src: img.src, caption };
        });
    }
    function openLightbox(index) {
        if (!images[index]) return;
        currentIndex = index;
        updateLightbox();
        if (lightbox) {
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    function updateLightbox() {
        if (lightboxImg && images[currentIndex]) {
            lightboxImg.src = images[currentIndex].src;
        }
        if (lightboxCaption && images[currentIndex]) {
            lightboxCaption.innerText = images[currentIndex].caption;
        }
    }
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            if (images.length > 0) {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateLightbox();
            }
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            if (images.length > 0) {
                currentIndex = (currentIndex + 1) % images.length;
                updateLightbox();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !images.length || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightbox();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightbox();
        }
    });

    // ===== SCROLL SUAVE DINÂMICO =====
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerEl = document.querySelector('header');
                const headerHeight = headerEl ? headerEl.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== EFECTO 3D NOS CARDS (TILT) DINÂMICO =====
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 20).toFixed(2);
            const rotateY = ((centerX - x) / 20).toFixed(2);
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ===== NEWSLETTER SUBMIT DINÂMICO =====
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (email) {
                showNotification('Obrigado por se inscrever! Em breve você receberá novidades.', 'success');
                newsletterForm.reset();
            } else {
                showNotification('Por favor, insira um e-mail válido.', 'error');
            }
        });
    }

    // ===== ANIMAÇÃO DE LOADING DO SITE DINÂMICO =====
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        images.forEach(img => {
            const preImg = new Image();
            preImg.src = img.src;
        });
    });

    // ===== DETECTAR TOUCH DEVICE DINÂMICO =====
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    }

    // ===== INTERSECTION OBSERVER PARA REVEAL =====
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
    }

    console.log('🚀 Barbearia do Nonato Premium carregada com sucesso!');
});