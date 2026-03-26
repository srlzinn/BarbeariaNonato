// ===== AGUARDAR CARREGAMENTO DO DOM =====
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== CONFIGURAÇÕES GLOBAIS =====
    const profissionais = {
        nonato: {
            nome: "Nonato",
            telefone: "5586994645340",
            especialidade: "Barba",
            horariosDisponiveis: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
        },
        junior: {
            nome: "Junior",
            telefone: "5586994645340",
            especialidade: "Degradê",
            horariosDisponiveis: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
        },
        paulinho: {
            nome: "Paulinho",
            telefone: "5586994645340",
            especialidade: "Fade",
            horariosDisponiveis: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
        },
        irmao: {
            nome: "Irmão",
            telefone: "5586994645340",
            especialidade: "Cortes Clássicos",
            horariosDisponiveis: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
        }
    };

    // Horários indisponíveis por data e profissional (simulação - poderia vir de um banco de dados)
    const agendamentosExistentes = {
        '2026-03-25': {
            nonato: ['14:00', '15:00'],
            junior: ['10:00'],
            paulinho: ['16:00'],
            irmao: ['09:00']
        },
        '2026-03-26': {
            nonato: ['17:00'],
            junior: ['14:00', '15:00'],
            paulinho: ['11:00'],
            irmao: ['18:00']
        }
    };

    // Feriados (simulação)
    const feriados = [
        '2026-01-01', // Ano Novo
        '2026-04-21', // Tiradentes
        '2026-05-01', // Dia do Trabalhador
        '2026-09-07', // Independência
        '2026-10-12', // Nossa Senhora Aparecida
        '2026-11-02', // Finados
        '2026-11-15', // Proclamação da República
        '2026-12-25'  // Natal
    ];

    // ===== FUNÇÃO DE NOTIFICAÇÃO PERSONALIZADA =====
    function showNotification(message, type = 'info') {
        // Remove notificações existentes
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // ===== VALIDAÇÃO DE TELEFONE EM TEMPO REAL =====
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 11) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length >= 7) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
            }
            e.target.value = value;
            
            // Remove erro se o campo ficar válido
            const formGroup = e.target.closest('.form-group');
            if (formGroup && value.length >= 14) {
                formGroup.classList.remove('error');
            }
        });
    }

    // ===== VALIDAÇÃO DE NOME =====
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.addEventListener('input', function(e) {
            const value = e.target.value.trim();
            const formGroup = e.target.closest('.form-group');
            if (formGroup && value.length >= 3) {
                formGroup.classList.remove('error');
            }
        });
    }

    // ===== VERIFICAR HORÁRIO MÍNIMO DE ANTECEDÊNCIA =====
    function isHorarioValido(data, horario) {
        const now = new Date();
        const dataHoraAgendamento = new Date(`${data}T${horario}:00`);
        
        // Calcula diferença em horas
        const diffHoras = (dataHoraAgendamento - now) / (1000 * 60 * 60);
        
        // Se for hoje, precisa ter pelo menos 2 horas de antecedência
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataAgendamento = new Date(data);
        dataAgendamento.setHours(0, 0, 0, 0);
        
        if (dataAgendamento.getTime() === hoje.getTime()) {
            if (diffHoras < 2) {
                showNotification(`Agendamentos para hoje devem ser feitos com no mínimo 2 horas de antecedência. Horário ${horario} indisponível.`, 'error');
                return false;
            }
        }
        
        return true;
    }

    // ===== VERIFICAR SE É HORÁRIO DE ALMOÇO =====
    function isHorarioAlmoco(horario) {
        const hora = parseInt(horario.split(':')[0]);
        return hora >= 12 && hora < 14;
    }

    // ===== CONFIGURAR DATA MÍNIMA E VERIFICAR FERIADOS =====
    const dataInput = document.getElementById('data');
    const profissionalSelect = document.getElementById('profissional');
    
    if (dataInput) {
        function getTodayDateFormatted() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }
        
        const todayFormatted = getTodayDateFormatted();
        dataInput.min = todayFormatted;
        
        // Função para verificar se a data é feriado
        function isFeriado(date) {
            return feriados.includes(date);
        }
        
        // Função para verificar se é domingo (fechado)
        function isDomingo(date) {
            const dataObj = new Date(date + 'T12:00:00');
            return dataObj.getDay() === 0;
        }
        
        dataInput.addEventListener('change', function() {
            const selectedDate = dataInput.value;
            
            // Verificar data anterior
            if (selectedDate < todayFormatted) {
                dataInput.value = todayFormatted;
                showNotification('Não é possível agendar para dias anteriores ao atual.', 'error');
                return;
            }
            
            // Verificar feriado
            if (isFeriado(selectedDate)) {
                dataInput.value = '';
                showNotification('Não atendemos em feriados. Por favor, escolha outra data.', 'error');
                return;
            }
            
            // Verificar domingo
            if (isDomingo(selectedDate)) {
                dataInput.value = '';
                showNotification('A barbearia não funciona aos domingos. Escolha terça a sábado.', 'error');
                return;
            }
            
            // Atualizar horários disponíveis baseado na data e profissional selecionado
            const profissionalId = profissionalSelect?.value;
            if (profissionalId) {
                atualizarHorariosDisponiveis(selectedDate, profissionalId);
            }
        });
    }
    
    // ===== ATUALIZAR HORÁRIOS DISPONÍVEIS =====
    function atualizarHorariosDisponiveis(selectedDate, profissionalId) {
        const horarioSelect = document.getElementById('horario');
        if (!horarioSelect) return;
        
        // Salvar valor selecionado atual
        const valorAtual = horarioSelect.value;
        
        // Limpar opções existentes (manter a primeira opção placeholder)
        const opcoes = Array.from(horarioSelect.options);
        opcoes.forEach((opt, idx) => {
            if (idx > 0 && opt.value) {
                opt.remove();
            }
        });
        
        // Obter horários do profissional selecionado
        const profissional = profissionais[profissionalId];
        if (!profissional) return;
        
        const horariosDisponiveisProfissional = profissional.horariosDisponiveis || [];
        
        // Obter horários já agendados para esta data e profissional
        const horariosAgendados = agendamentosExistentes[selectedDate]?.[profissionalId] || [];
        
        // Adicionar horários disponíveis
        horariosDisponiveisProfissional.forEach(horario => {
            // Verificar se é horário de almoço
            if (isHorarioAlmoco(horario)) {
                // Pular horário de almoço
                return;
            }
            
            // Verificar se já está agendado
            const isAgendado = horariosAgendados.includes(horario);
            
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            
            if (isAgendado) {
                option.disabled = true;
                option.textContent = `${horario} (indisponível)`;
                option.style.backgroundColor = '#f0f0f0';
                option.style.color = '#999';
            }
            
            horarioSelect.appendChild(option);
        });
        
        // Verificar se há horários disponíveis
        const horariosDisponiveis = Array.from(horarioSelect.options).some(opt => opt.value && !opt.disabled);
        
        if (!horariosDisponiveis) {
            showNotification(`Não há horários disponíveis para ${profissional.nome} nesta data. Por favor, escolha outra data ou profissional.`, 'error');
        }
        
        // Restaurar valor anterior se ainda estiver disponível e não estiver desabilitado
        if (valorAtual && Array.from(horarioSelect.options).some(opt => opt.value === valorAtual && !opt.disabled)) {
            horarioSelect.value = valorAtual;
        } else if (horarioSelect.options.length > 1) {
            // Selecionar o primeiro horário disponível
            const primeiroDisponivel = Array.from(horarioSelect.options).find(opt => opt.value && !opt.disabled);
            if (primeiroDisponivel) {
                horarioSelect.value = primeiroDisponivel.value;
            }
        }
    }
    
    // ===== EVENTO PARA QUANDO O PROFISSIONAL É ALTERADO =====
    if (profissionalSelect) {
        profissionalSelect.addEventListener('change', function() {
            const profissionalId = this.value;
            const selectedDate = dataInput?.value;
            
            if (selectedDate && profissionalId) {
                atualizarHorariosDisponiveis(selectedDate, profissionalId);
            }
        });
    }
    
    // ===== EVENTO PARA QUANDO O HORÁRIO É ALTERADO =====
    const horarioSelect = document.getElementById('horario');
    if (horarioSelect) {
        horarioSelect.addEventListener('change', function() {
            const selectedHorario = this.value;
            const selectedDate = dataInput?.value;
            const profissionalId = profissionalSelect?.value;
            
            if (selectedDate && selectedHorario && profissionalId) {
                // Verificar horário de almoço
                if (isHorarioAlmoco(selectedHorario)) {
                    showNotification('Horário de almoço (12:00 às 14:00). Por favor, escolha outro horário.', 'error');
                    this.value = '';
                    return;
                }
                
                // Verificar antecedência mínima
                if (!isHorarioValido(selectedDate, selectedHorario)) {
                    this.value = '';
                    return;
                }
            }
        });
    }

    // ===== GERAR LINK DE AGENDAMENTO COMPLETO =====
    function gerarLinkAgendamentoCompleto(profissionalId, servico, data, horario, nome, telefone) {
        const profissional = profissionais[profissionalId];
        if (!profissional) return null;
        
        // Formatar data para brasileiro
        const [ano, mes, dia] = data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        
        // Limpar telefone (apenas números)
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        const mensagem = `Olá, *${profissional.nome}*! Meu nome é *${nome}* e gostaria de agendar um horário.

*Serviço:* ${servico}
*Data:* ${dataFormatada}
*Horário:* ${horario}
*Meu WhatsApp:* ${telefoneLimpo}

Aguardo sua confirmação. Obrigado!

— Enviado pelo site da Barbearia do Nonato`;
        
        return `https://wa.me/55${profissional.telefone}?text=${encodeURIComponent(mensagem)}`;
    }

    // ===== VALIDAÇÃO COMPLETA DO FORMULÁRIO =====
    function validarFormulario(servico, data, horario, profissionalId, nome, telefone) {
        let isValid = true;
        
        // Limpar erros anteriores
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        
        // Validar serviço
        if (!servico) {
            const servicoGroup = document.getElementById('servico')?.closest('.form-group');
            if (servicoGroup) servicoGroup.classList.add('error');
            showNotification('Por favor, selecione um serviço.', 'error');
            isValid = false;
        }
        
        // Validar data
        if (!data) {
            const dataGroup = document.getElementById('data')?.closest('.form-group');
            if (dataGroup) dataGroup.classList.add('error');
            showNotification('Por favor, selecione uma data.', 'error');
            isValid = false;
        } else {
            // Verificar se a data não é anterior a hoje
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataSelecionada = new Date(data + 'T00:00:00');
            if (dataSelecionada < hoje) {
                const dataGroup = document.getElementById('data')?.closest('.form-group');
                if (dataGroup) dataGroup.classList.add('error');
                showNotification('Não é possível agendar para datas passadas.', 'error');
                isValid = false;
            }
            
            // Verificar feriado
            if (feriados.includes(data)) {
                const dataGroup = document.getElementById('data')?.closest('.form-group');
                if (dataGroup) dataGroup.classList.add('error');
                showNotification('Não atendemos em feriados.', 'error');
                isValid = false;
            }
            
            // Verificar domingo
            const dataObj = new Date(data + 'T12:00:00');
            if (dataObj.getDay() === 0) {
                const dataGroup = document.getElementById('data')?.closest('.form-group');
                if (dataGroup) dataGroup.classList.add('error');
                showNotification('A barbearia não funciona aos domingos.', 'error');
                isValid = false;
            }
        }
        
        // Validar horário
        if (!horario) {
            const horarioGroup = document.getElementById('horario')?.closest('.form-group');
            if (horarioGroup) horarioGroup.classList.add('error');
            showNotification('Por favor, selecione um horário.', 'error');
            isValid = false;
        } else {
            // Verificar horário de almoço
            if (isHorarioAlmoco(horario)) {
                const horarioGroup = document.getElementById('horario')?.closest('.form-group');
                if (horarioGroup) horarioGroup.classList.add('error');
                showNotification('Horário de almoço (12:00 às 14:00). Por favor, escolha outro horário.', 'error');
                isValid = false;
            }
            
            // Verificar antecedência mínima
            if (data && !isHorarioValido(data, horario)) {
                const horarioGroup = document.getElementById('horario')?.closest('.form-group');
                if (horarioGroup) horarioGroup.classList.add('error');
                isValid = false;
            }
        }
        
        // Validar profissional
        if (!profissionalId) {
            const profGroup = document.getElementById('profissional')?.closest('.form-group');
            if (profGroup) profGroup.classList.add('error');
            showNotification('Por favor, selecione um profissional.', 'error');
            isValid = false;
        }
        
        // Validar nome (mínimo 3 caracteres)
        if (!nome || nome.trim().length < 3) {
            const nomeGroup = document.getElementById('nome')?.closest('.form-group');
            if (nomeGroup) nomeGroup.classList.add('error');
            showNotification('Por favor, digite seu nome completo (mínimo 3 caracteres).', 'error');
            isValid = false;
        }
        
        // Validar telefone (mínimo 14 caracteres com formatação)
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (!telefone || telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            const telefoneGroup = document.getElementById('telefone')?.closest('.form-group');
            if (telefoneGroup) telefoneGroup.classList.add('error');
            showNotification('Por favor, digite um telefone válido com DDD (ex: (86) 99999-9999).', 'error');
            isValid = false;
        }
        
        return isValid;
    }

   // ===== AGENDAMENTO WHATSAPP COM LOADING =====
const btnAgendar = document.getElementById('agendar-whatsapp');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.querySelector('.btn-spinner');

if (btnAgendar) {
    btnAgendar.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Capturar valores
        const servicoSelect = document.getElementById('servico');
        const servico = servicoSelect?.value?.trim() || '';
        const data = document.getElementById('data')?.value || '';
        const horario = document.getElementById('horario')?.value?.trim() || '';
        const profissionalSelect = document.getElementById('profissional');
        const profissionalId = profissionalSelect?.value?.trim() || '';
        const nome = document.getElementById('nome')?.value?.trim() || '';
        const telefone = document.getElementById('telefone')?.value?.trim() || '';
        
        // REMOVIDA a validação da política de agendamento
        
        // Validar formulário
        if (!validarFormulario(servico, data, horario, profissionalId, nome, telefone)) {
            return;
        }
        
        // Verificar novamente se o horário está disponível (evitar agendamentos duplicados após validação)
        const horariosAgendados = agendamentosExistentes[data]?.[profissionalId] || [];
        if (horariosAgendados.includes(horario)) {
            showNotification('Este horário já foi agendado. Por favor, escolha outro horário.', 'error');
            return;
        }
        
        // Mostrar loading
        const originalText = btnText?.innerText || 'Agendar via WhatsApp';
        if (btnText) btnText.innerText = 'Processando...';
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
        btnAgendar.disabled = true;
        
        // Simular pequeno delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Gerar link
        const linkWhatsApp = gerarLinkAgendamentoCompleto(profissionalId, servico, data, horario, nome, telefone);
        
        // Restaurar botão
        if (btnText) btnText.innerText = originalText;
        if (btnSpinner) btnSpinner.style.display = 'none';
        btnAgendar.disabled = false;
        
        // Abrir WhatsApp
        if (linkWhatsApp) {
            window.open(linkWhatsApp, '_blank');
            showNotification('Redirecionando para o WhatsApp!', 'success');
            
            // Opcional: limpar formulário após sucesso
            // document.getElementById('agendamento-form')?.reset();
        } else {
            showNotification('Erro ao gerar link de agendamento. Tente novamente.', 'error');
        }
    });
}

    // ===== CURSOR PERSONALIZADO =====
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower && window.innerWidth > 768) {
        const setCursorPosition = (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        };
        document.addEventListener('mousemove', setCursorPosition);
        
        const hoverElements = document.querySelectorAll('a, button, .servico-card, .galeria-item, .filtro-btn');
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
    
    // ===== SCROLL REVEAL =====
    const sections = document.querySelectorAll('.section');
    const header = document.getElementById('header');
    
    function revealSection() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < windowHeight - revealPoint) {
                section.classList.add('revealed');
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
    
    // ===== MENU MOBILE =====
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        function toggleMenu() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            const isExpanded = hamburger.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        }
        
        hamburger.addEventListener('click', toggleMenu);
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }
    
    // ===== ANIMAÇÃO DE NÚMEROS (COUNTER) =====
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;
    
    function animateNumbers() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const current = parseInt(stat.innerText.replace(/\D/g, '')) || 0;
            const increment = Math.max(1, Math.ceil(target / 40));
            if (current < target) {
                stat.innerText = Math.min(current + increment, target);
                setTimeout(animateNumbers, 25);
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
    
    // ===== MODAL POLÍTICA DE AGENDAMENTO =====
    const modalPolitica = document.getElementById('modal-politica-agendamento');
    const politicaLinks = document.querySelectorAll('#politica-agendamento, #politica-link-footer');
    
    function openModal() {
        if (modalPolitica) {
            modalPolitica.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal() {
        if (modalPolitica) {
            modalPolitica.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    politicaLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
    });
    
    if (modalPolitica) {
        const closeButtons = modalPolitica.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        modalPolitica.addEventListener('click', (e) => {
            if (e.target === modalPolitica) {
                closeModal();
            }
        });
    }
    
    // ===== GALERIA COM FILTROS =====
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');
    
    if (filtroBtns.length && galeriaItems.length) {
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Atualizar botão ativo
                filtroBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filtro = btn.getAttribute('data-filtro');
                
                // Filtrar itens
                galeriaItems.forEach(item => {
                    const categoria = item.getAttribute('data-categoria');
                    if (filtro === 'todos' || categoria === filtro) {
                        item.classList.remove('hide');
                        // Adicionar animação suave
                        item.style.animation = 'fadeIn 0.3s ease';
                        setTimeout(() => {
                            item.style.animation = '';
                        }, 300);
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }
    
    // ===== LIGHTBOX PARA GALERIA =====
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
            return { src: img?.src || '', caption };
        });
    }
    
    function openLightbox(index) {
        if (!images[index] || !lightbox) return;
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
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
    
    // ===== SCROLL SUAVE =====
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
    
    // ===== EFEITO 3D NOS CARDS (TILT) =====
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
    
    // ===== ANIMAÇÃO DE CARREGAMENTO =====
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        images.forEach(img => {
            if (img.src) {
                const preImg = new Image();
                preImg.src = img.src;
            }
        });
        console.log('🚀 Barbearia do Nonato Premium carregada com sucesso!');
    });
    
    // ===== DETECTAR TOUCH DEVICE =====
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
    
    // ===== NEWSLETTER (se existir no futuro) =====
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (email && email.includes('@')) {
                showNotification('Obrigado por se inscrever! Em breve você receberá novidades.', 'success');
                newsletterForm.reset();
            } else {
                showNotification('Por favor, insira um e-mail válido.', 'error');
            }
        });
    }
    
    // ===== ANIMAÇÃO DE ENTRADA PARA CARDS (STAGGER) =====
    const servicoCards = document.querySelectorAll('.servico-card');
    if (servicoCards.length && window.IntersectionObserver) {
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        servicoCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            staggerObserver.observe(card);
        });
    }
    
    console.log('✅ Todas as melhorias foram implementadas com sucesso!');
});