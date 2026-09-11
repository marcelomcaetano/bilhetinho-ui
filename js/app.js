import { buscarMusicoPorEmail, cadastrarMusico } from './api/musicos.js';
import { listarEventosPorMusico, criarEvento } from './api/eventos.js';
import { buscarEnderecoPorCep } from './api/enderecos.js';

// Chave utilizada no localStorage
const STORAGE_KEY_MUSICO = 'bilhetinho_musico_ativo';

// Estado local da aplicação
let musicoAtivo = null;

// Elementos de Visão
const secaoLoginMusico = document.getElementById('secaoLoginMusico');
const secaoCadastroMusico = document.getElementById('secaoCadastroMusico');
const secaoPainelMusico = document.getElementById('secaoPainelMusico');

// Formulário de Login / Identificação
const formLoginMusico = document.getElementById('formLoginMusico');
const inputLoginEmail = document.getElementById('inputLoginEmail');
const btnAcessar = document.getElementById('btnAcessar');
const linkIrParaCadastro = document.getElementById('linkIrParaCadastro');

// Formulário de Cadastro de Músico
const formCadastroMusico = document.getElementById('formCadastroMusico');
const inputCadastroNome = document.getElementById('inputCadastroNome');
const inputCadastroEmail = document.getElementById('inputCadastroEmail');
const inputCadastroEstilo = document.getElementById('inputCadastroEstilo');
const btnVoltarLogin = document.getElementById('btnVoltarLogin');

// Painel do Músico Ativo
const painelNome = document.getElementById('painelNome');
const painelEmail = document.getElementById('painelEmail');
const painelEstilo = document.getElementById('painelEstilo');
const btnNavSair = document.getElementById('btnNavSair');
const navMusicoStatus = document.getElementById('navMusicoStatus');

// Seção de Eventos do Músico
const containerListaEventos = document.getElementById('containerListaEventos');
const badgeTotalEventos = document.getElementById('badgeTotalEventos');
const btnRecarregarEventos = document.getElementById('btnRecarregarEventos');
const btnAbrirModalNovoEvento = document.getElementById('btnAbrirModalNovoEvento');

// Modal de Cadastro de Novo Evento / Show
const modalNovoEventoElement = document.getElementById('modalNovoEvento');
let bsModalNovoEvento = null;
const formNovoEvento = document.getElementById('formNovoEvento');
const inputEventoNome = document.getElementById('inputEventoNome');
const inputEventoDataHora = document.getElementById('inputEventoDataHora');
const inputEventoLocal = document.getElementById('inputEventoLocal');
const inputEventoCep = document.getElementById('inputEventoCep');
const btnBuscarCep = document.getElementById('btnBuscarCep');
const cepStatusFeedback = document.getElementById('cepStatusFeedback');
const inputEventoLogradouro = document.getElementById('inputEventoLogradouro');
const inputEventoNumero = document.getElementById('inputEventoNumero');
const inputEventoComplemento = document.getElementById('inputEventoComplemento');
const inputEventoBairro = document.getElementById('inputEventoBairro');
const inputEventoCidade = document.getElementById('inputEventoCidade');
const inputEventoUf = document.getElementById('inputEventoUf');
const btnSalvarNovoEvento = document.getElementById('btnSalvarNovoEvento');

// Toasts de Feedback
const toastElement = document.getElementById('feedbackToast');
const toastMessage = document.getElementById('toastMessage');
let bsToast = null;

/**
 * Inicialização ao carregar a página
 */
document.addEventListener('DOMContentLoaded', () => {
    if (toastElement) {
        bsToast = new bootstrap.Toast(toastElement);
    }

    if (modalNovoEventoElement) {
        bsModalNovoEvento = new bootstrap.Modal(modalNovoEventoElement);
    }

    configurarEventos();
    recuperarSessao();
});

/**
 * Alterna entre as telas da interface
 * @param {'login' | 'cadastro' | 'painel'} visao 
 */
function exibirVisao(visao) {
    if (secaoLoginMusico) secaoLoginMusico.classList.add('d-none');
    if (secaoCadastroMusico) secaoCadastroMusico.classList.add('d-none');
    if (secaoPainelMusico) secaoPainelMusico.classList.add('d-none');

    if (visao === 'login') {
        if (secaoLoginMusico) secaoLoginMusico.classList.remove('d-none');
        if (inputLoginEmail) inputLoginEmail.focus();
    } else if (visao === 'cadastro') {
        if (secaoCadastroMusico) secaoCadastroMusico.classList.remove('d-none');
        if (inputCadastroNome) inputCadastroNome.focus();
    } else if (visao === 'painel') {
        if (secaoPainelMusico) secaoPainelMusico.classList.remove('d-none');
    }
}

/**
 * Define o músico ativo na sessão, salva no localStorage e carrega seus eventos
 */
function definirMusicoAtivo(musico) {
    musicoAtivo = musico;
    localStorage.setItem(STORAGE_KEY_MUSICO, JSON.stringify(musico));

    if (painelNome) painelNome.textContent = musico.nome;
    if (painelEmail) painelEmail.textContent = musico.email;
    if (painelEstilo) painelEstilo.textContent = musico.estiloMusical || 'Estilo não informado';

    if (navMusicoStatus) {
        navMusicoStatus.className = 'badge bg-purple-subtle text-purple border border-purple-subtle px-3 py-2';
        navMusicoStatus.innerHTML = `<i class="bi bi-person-check me-1"></i> ${musico.nome}`;
    }

    if (btnNavSair) {
        btnNavSair.classList.remove('d-none');
    }

    exibirVisao('painel');

    // Carrega a lista de eventos do músico logado
    carregarEventosDoMusico(musico.id);
}

/**
 * Recupera sessão salva no localStorage
 */
function recuperarSessao() {
    const salvo = localStorage.getItem(STORAGE_KEY_MUSICO);
    if (salvo) {
        try {
            const musico = JSON.parse(salvo);
            if (musico && musico.id && musico.nome) {
                definirMusicoAtivo(musico);
                return;
            }
        } catch (e) {
            console.error('Erro ao ler dados de sessão salvos:', e);
            localStorage.removeItem(STORAGE_KEY_MUSICO);
        }
    }

    desconectar(false);
}

/**
 * Desconecta o músico, limpa o localStorage e redireciona para a tela de login
 * @param {boolean} notificar se deve emitir aviso visual toast
 */
function desconectar(notificar = true) {
    musicoAtivo = null;
    localStorage.removeItem(STORAGE_KEY_MUSICO);

    if (navMusicoStatus) {
        navMusicoStatus.className = 'badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2';
        navMusicoStatus.innerHTML = '<i class="bi bi-person-circle me-1"></i> Não identificado';
    }

    if (btnNavSair) {
        btnNavSair.classList.add('d-none');
    }

    if (formLoginMusico) formLoginMusico.reset();
    if (formCadastroMusico) formCadastroMusico.reset();
    limparFormularioNovoEvento();

    if (containerListaEventos) containerListaEventos.innerHTML = '';
    if (badgeTotalEventos) badgeTotalEventos.textContent = '0 shows';

    exibirVisao('login');

    if (notificar) {
        exibirToast('Você saiu da sua conta de músico.', 'info');
    }
}

/**
 * Limpa todos os campos, estados e feedbacks do formulário de novo evento
 */
function limparFormularioNovoEvento() {
    if (formNovoEvento) {
        formNovoEvento.reset();
        formNovoEvento.classList.remove('was-validated');
        const inputs = formNovoEvento.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            el.value = '';
            el.classList.remove('is-valid', 'is-invalid');
        });
    }

    if (inputEventoNome) inputEventoNome.value = '';
    if (inputEventoDataHora) inputEventoDataHora.value = '';
    if (inputEventoLocal) inputEventoLocal.value = '';
    if (inputEventoCep) inputEventoCep.value = '';
    if (inputEventoLogradouro) inputEventoLogradouro.value = '';
    if (inputEventoNumero) inputEventoNumero.value = '';
    if (inputEventoComplemento) inputEventoComplemento.value = '';
    if (inputEventoBairro) inputEventoBairro.value = '';
    if (inputEventoCidade) inputEventoCidade.value = '';
    if (inputEventoUf) inputEventoUf.value = '';

    if (cepStatusFeedback) {
        cepStatusFeedback.className = 'form-text text-secondary small';
        cepStatusFeedback.innerHTML = 'Digite o CEP e clique na lupa (ou pressione Enter).';
    }

    if (btnBuscarCep) {
        btnBuscarCep.disabled = false;
        btnBuscarCep.innerHTML = '<i class="bi bi-search"></i>';
    }

    if (btnSalvarNovoEvento) {
        btnSalvarNovoEvento.disabled = false;
        btnSalvarNovoEvento.innerHTML = '<i class="bi bi-save me-1"></i> Cadastrar Show';
    }
}


/**
 * Busca e renderiza os eventos cadastrados do músico ativo
 * @param {number} musicoId 
 */
async function carregarEventosDoMusico(musicoId) {
    if (!containerListaEventos) return;

    // Estado de carregamento
    containerListaEventos.innerHTML = `
        <div class="col-12 text-center py-4">
            <span class="spinner-border spinner-border-sm text-purple" role="status"></span>
            <span class="text-secondary small ms-2">Buscando seus shows...</span>
        </div>
    `;

    try {
        const eventos = await listarEventosPorMusico(musicoId);

        if (!eventos || eventos.length === 0) {
            if (badgeTotalEventos) badgeTotalEventos.textContent = '0 shows';
            containerListaEventos.innerHTML = `
                <div class="col-12">
                    <div class="card card-custom p-4 text-center">
                        <i class="bi bi-calendar-x fs-1 text-secondary mb-2"></i>
                        <h4 class="h6 fw-bold text-white mb-1">Nenhum show cadastrado ainda</h4>
                        <p class="text-secondary small mb-3">Você ainda não possui eventos registrados. Cadastre o seu primeiro show para começar a receber pedidos!</p>
                        <div>
                            <button class="btn btn-primary-gradient btn-sm" id="btnCadastrarPrimeiroShow" data-bs-toggle="modal" data-bs-target="#modalNovoEvento">
                                <i class="bi bi-plus-circle me-1"></i> Cadastrar Primeiro Show
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const btnPrimeiro = document.getElementById('btnCadastrarPrimeiroShow');
            if (btnPrimeiro) {
                btnPrimeiro.addEventListener('click', limparFormularioNovoEvento);
            }
            return;
        }

        if (badgeTotalEventos) {
            badgeTotalEventos.textContent = `${eventos.length} ${eventos.length === 1 ? 'show' : 'shows'}`;
        }

        // Renderiza cada show em um card moderno
        containerListaEventos.innerHTML = eventos.map(evento => {
            const dataFmt = formatarDataHora(evento.dataHora);
            const statusBadge = formatarStatusBadge(evento.status);
            const enderecoFmt = formatarEndereco(evento.endereco);

            return `
                <div class="col-12 col-lg-6">
                    <div class="card card-custom h-100 p-4">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                            <div>
                                <h4 class="h5 fw-bold text-white mb-1">${escapeHtml(evento.nome)}</h4>
                                <div class="text-secondary small d-flex align-items-center gap-2">
                                    <i class="bi bi-geo-alt text-purple"></i>
                                    <span class="fw-semibold text-light">${escapeHtml(evento.local)}</span>
                                </div>
                            </div>
                            <span class="badge ${statusBadge.classe} px-2 py-1">${statusBadge.texto}</span>
                        </div>

                        <div class="mb-3">
                            <p class="text-secondary small mb-1">
                                <i class="bi bi-calendar3 me-1 text-purple"></i> ${dataFmt}
                            </p>
                            <p class="text-secondary small mb-0">
                                <i class="bi bi-signpost-2 me-1 text-purple"></i> ${enderecoFmt}
                            </p>
                        </div>

                        <hr class="border-secondary-subtle my-2">

                        <div class="d-flex justify-content-between align-items-center pt-2">
                            <div class="small">
                                <span class="text-secondary me-1">Código do Show:</span>
                                <span class="badge bg-dark border border-secondary-subtle font-monospace text-purple">${evento.codEvento}</span>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm btn-copiar-uuid" data-uuid="${evento.codEvento}" title="Copiar código do evento">
                                <i class="bi bi-clipboard me-1"></i> Copiar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        configurarBotoesCopiarUuid();

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        containerListaEventos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Erro ao carregar a lista de eventos: ${escapeHtml(error.message)}</span>
                </div>
            </div>
        `;
    }
}

/**
 * Consulta o endereço na API do ViaCEP a partir do CEP informado
 */
async function consultarCepEvento() {
    if (!inputEventoCep) return;

    const valorCep = inputEventoCep.value.trim();
    const cepNumeros = valorCep.replace(/\D/g, '');

    if (cepNumeros.length !== 8) {
        if (cepStatusFeedback) {
            cepStatusFeedback.innerHTML = '<span class="text-warning"><i class="bi bi-exclamation-circle me-1"></i> O CEP deve conter 8 dígitos numéricos.</span>';
        }
        exibirToast('O CEP deve conter exatamente 8 dígitos numéricos.', 'warning');
        return;
    }

    if (btnBuscarCep) {
        btnBuscarCep.disabled = true;
        btnBuscarCep.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    }

    if (cepStatusFeedback) {
        cepStatusFeedback.innerHTML = '<span class="text-secondary"><i class="bi bi-hourglass-split me-1"></i> Consultando ViaCEP...</span>';
    }

    try {
        const end = await buscarEnderecoPorCep(cepNumeros);

        if (inputEventoLogradouro && end.logradouro) inputEventoLogradouro.value = end.logradouro;
        if (inputEventoBairro && end.bairro) inputEventoBairro.value = end.bairro;
        if (inputEventoCidade && end.cidade) inputEventoCidade.value = end.cidade;
        if (inputEventoUf && end.uf) inputEventoUf.value = end.uf;

        if (cepStatusFeedback) {
            cepStatusFeedback.innerHTML = `<span class="text-success"><i class="bi bi-check-circle me-1"></i> Endereço localizado (${end.cidade}/${end.uf})!</span>`;
        }

        exibirToast(`Endereço localizado para o CEP ${end.cep}!`, 'success');

        if (inputEventoNumero) {
            inputEventoNumero.focus();
        }

    } catch (error) {
        console.error('Erro na consulta do CEP:', error);
        if (cepStatusFeedback) {
            cepStatusFeedback.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle me-1"></i> ${escapeHtml(error.message)}</span>`;
        }
        exibirToast(error.message || 'Erro ao consultar o CEP informado.', 'danger');
    } finally {
        if (btnBuscarCep) {
            btnBuscarCep.disabled = false;
            btnBuscarCep.innerHTML = '<i class="bi bi-search"></i>';
        }
    }
}

/**
 * Submete a criação de um novo show / evento
 */
async function salvarNovoEvento() {
    if (!musicoAtivo || !musicoAtivo.id) {
        exibirToast('Nenhum músico conectado. Faça login novamente.', 'danger');
        desconectar(false);
        return;
    }

    const nome = inputEventoNome ? inputEventoNome.value.trim() : '';
    const dataHora = inputEventoDataHora ? inputEventoDataHora.value : '';
    const local = inputEventoLocal ? inputEventoLocal.value.trim() : '';
    const cep = inputEventoCep ? inputEventoCep.value.trim() : '';
    const logradouro = inputEventoLogradouro ? inputEventoLogradouro.value.trim() : '';
    const numero = inputEventoNumero ? inputEventoNumero.value.trim() : '';
    const complemento = inputEventoComplemento ? inputEventoComplemento.value.trim() : '';
    const bairro = inputEventoBairro ? inputEventoBairro.value.trim() : '';
    const cidade = inputEventoCidade ? inputEventoCidade.value.trim() : '';
    const uf = inputEventoUf ? inputEventoUf.value.trim().toUpperCase() : '';

    if (!nome || !dataHora || !local || !cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        exibirToast('Por favor, preencha todos os campos obrigatórios do show e do endereço.', 'warning');
        return;
    }

    if (btnSalvarNovoEvento) {
        btnSalvarNovoEvento.disabled = true;
        btnSalvarNovoEvento.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Cadastrando...';
    }

    const payload = {
        idMusico: musicoAtivo.id,
        nome: nome,
        dataHora: dataHora,
        local: local,
        endereco: {
            cep: cep,
            logradouro: logradouro,
            numero: numero,
            complemento: complemento || null,
            bairro: bairro,
            cidade: cidade,
            uf: uf
        }
    };

    try {
        const novoEvento = await criarEvento(payload);
        exibirToast(`Show "${novoEvento.nome}" cadastrado com sucesso!`, 'success');

        // Limpa os campos do formulário imediatamente após cadastro com sucesso
        limparFormularioNovoEvento();

        // Fecha o modal com segurança
        const modalInstance = bootstrap.Modal.getInstance(modalNovoEventoElement) || bsModalNovoEvento;
        if (modalInstance) {
            modalInstance.hide();
        }

        // Recarrega imediatamente a lista de eventos
        await carregarEventosDoMusico(musicoAtivo.id);

    } catch (error) {
        console.error('Erro ao cadastrar evento:', error);
        exibirToast(error.message || 'Erro ao cadastrar o show.', 'danger');
    } finally {
        if (btnSalvarNovoEvento) {
            btnSalvarNovoEvento.disabled = false;
            btnSalvarNovoEvento.innerHTML = '<i class="bi bi-save me-1"></i> Cadastrar Show';
        }
    }
}

/**
 * Ativa os botões de copiar o UUID do evento para a área de transferência
 */
function configurarBotoesCopiarUuid() {
    const botoes = document.querySelectorAll('.btn-copiar-uuid');
    botoes.forEach(btn => {
        btn.addEventListener('click', async () => {
            const uuid = btn.getAttribute('data-uuid');
            if (!uuid) return;

            try {
                await navigator.clipboard.writeText(uuid);
                const originalHtml = btn.innerHTML;
                btn.className = 'btn btn-success btn-sm';
                btn.innerHTML = '<i class="bi bi-check2 me-1"></i> Copiado!';

                setTimeout(() => {
                    btn.className = 'btn btn-outline-secondary btn-sm btn-copiar-uuid';
                    btn.innerHTML = originalHtml;
                }, 2000);
            } catch (err) {
                exibirToast('Não foi possível copiar o código.', 'warning');
            }
        });
    });
}

/**
 * Formata data e hora no padrão brasileiro
 */
function formatarDataHora(dataHoraString) {
    if (!dataHoraString) return 'Data não informada';
    try {
        const data = new Date(dataHoraString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataHoraString;
    }
}

/**
 * Formata o endereço completo do evento
 */
function formatarEndereco(end) {
    if (!end) return 'Endereço não informado';
    const partes = [];
    if (end.logradouro) partes.push(end.logradouro);
    if (end.numero) partes.push(`nº ${end.numero}`);
    if (end.complemento) partes.push(`(${end.complemento})`);
    if (end.bairro) partes.push(end.bairro);
    if (end.cidade && end.uf) partes.push(`${end.cidade}/${end.uf}`);
    if (end.cep) partes.push(`CEP: ${end.cep}`);
    return escapeHtml(partes.join(', '));
}

/**
 * Mapeia o status do evento para classes do Bootstrap
 */
function formatarStatusBadge(status) {
    switch (status) {
        case 'ATIVO':
            return { classe: 'bg-success-subtle text-success border border-success-subtle', texto: 'Ativo' };
        case 'PENDENTE':
            return { classe: 'bg-warning-subtle text-warning border border-warning-subtle', texto: 'Pendente' };
        case 'ENCERRADO':
            return { classe: 'bg-secondary-subtle text-secondary border border-secondary-subtle', texto: 'Encerrado' };
        default:
            return { classe: 'bg-secondary-subtle text-secondary border border-secondary-subtle', texto: status || 'Indefinido' };
    }
}

/**
 * Escapa strings para inserção segura no HTML
 */
function escapeHtml(texto) {
    if (!texto) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Configuração de todos os ouvintes de eventos da página
 */
function configurarEventos() {

    // Submissão da tela de identificação (Login por e-mail)
    if (formLoginMusico) {
        formLoginMusico.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = inputLoginEmail ? inputLoginEmail.value.trim() : '';

            if (!email) {
                exibirToast('Por favor, informe seu e-mail.', 'warning');
                return;
            }

            if (btnAcessar) {
                btnAcessar.disabled = true;
                btnAcessar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Verificando...';
            }

            try {
                const musico = await buscarMusicoPorEmail(email);
                definirMusicoAtivo(musico);
                exibirToast(`Bem-vindo(a) de volta, ${musico.nome}!`, 'success');
            } catch (error) {
                if (error.status === 404 || (error.message && error.message.toLowerCase().includes('não encontrado'))) {
                    exibirToast('E-mail não cadastrado. Complete seu cadastro abaixo.', 'info');
                    if (inputCadastroEmail) inputCadastroEmail.value = email;
                    exibirVisao('cadastro');
                } else {
                    exibirToast(error.message || 'Erro ao consultar e-mail.', 'danger');
                }
            } finally {
                if (btnAcessar) {
                    btnAcessar.disabled = false;
                    btnAcessar.innerHTML = '<i class="bi bi-arrow-right-circle me-1"></i> Continuar';
                }
            }
        });
    }

    // Submissão do formulário de cadastro de músico
    if (formCadastroMusico) {
        formCadastroMusico.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = inputCadastroNome ? inputCadastroNome.value.trim() : '';
            const email = inputCadastroEmail ? inputCadastroEmail.value.trim() : '';
            const estiloMusical = inputCadastroEstilo ? inputCadastroEstilo.value.trim() : '';

            if (!nome || !email) {
                exibirToast('Nome e e-mail são campos obrigatórios.', 'warning');
                return;
            }

            const btnConcluir = document.getElementById('btnConcluirCadastro');
            if (btnConcluir) {
                btnConcluir.disabled = true;
                btnConcluir.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Cadastrando...';
            }

            try {
                const novoMusico = await cadastrarMusico({ nome, email, estiloMusical });
                definirMusicoAtivo(novoMusico);
                exibirToast(`Perfil criado com sucesso! Bem-vindo(a), ${novoMusico.nome}.`, 'success');
                formCadastroMusico.reset();
            } catch (error) {
                exibirToast(error.message || 'Erro ao realizar cadastro.', 'danger');
            } finally {
                if (btnConcluir) {
                    btnConcluir.disabled = false;
                    btnConcluir.innerHTML = '<i class="bi bi-check-circle me-1"></i> Concluir Cadastro';
                }
            }
        });
    }

    // Navegação: Ir para tela de cadastro a partir do login
    if (linkIrParaCadastro) {
        linkIrParaCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            if (inputCadastroEmail && inputLoginEmail) {
                inputCadastroEmail.value = inputLoginEmail.value.trim();
            }
            exibirVisao('cadastro');
        });
    }

    // Navegação: Voltar para login a partir do cadastro
    if (btnVoltarLogin) {
        btnVoltarLogin.addEventListener('click', () => {
            exibirVisao('login');
        });
    }

    // Botão de Sair / Desconectar no topo (Navbar)
    if (btnNavSair) {
        btnNavSair.addEventListener('click', () => desconectar(true));
    }

    // Botão de Recarregar Eventos
    if (btnRecarregarEventos) {
        btnRecarregarEventos.addEventListener('click', () => {
            if (musicoAtivo && musicoAtivo.id) {
                carregarEventosDoMusico(musicoAtivo.id);
            }
        });
    }

    // Botão "Novo Show" no topo da lista
    if (btnAbrirModalNovoEvento) {
        btnAbrirModalNovoEvento.addEventListener('click', limparFormularioNovoEvento);
    }

    // Delegação para qualquer botão que acione o cadastro de novo evento (ex: estado vazio, topo, etc.)
    document.addEventListener('click', (e) => {
        const gatilho = e.target.closest('#btnAbrirModalNovoEvento, #btnCadastrarPrimeiroShow, [data-bs-target="#modalNovoEvento"]');
        if (gatilho) {
            limparFormularioNovoEvento();
        }
    });

    // Eventos do ciclo de vida do modal (Bootstrap) para garantir limpeza total
    if (modalNovoEventoElement) {
        modalNovoEventoElement.addEventListener('show.bs.modal', limparFormularioNovoEvento);
        modalNovoEventoElement.addEventListener('shown.bs.modal', () => {
            if (inputEventoNome) inputEventoNome.focus();
        });
        modalNovoEventoElement.addEventListener('hidden.bs.modal', limparFormularioNovoEvento);
    }


    // Busca de CEP no modal de novo evento (botão lupa e tecla Enter)
    if (btnBuscarCep) {
        btnBuscarCep.addEventListener('click', consultarCepEvento);
    }
    if (inputEventoCep) {
        inputEventoCep.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                consultarCepEvento();
            }
        });
        // Dispara busca automática ao preencher 8 números
        inputEventoCep.addEventListener('input', (e) => {
            const digits = e.target.value.replace(/\D/g, '');
            if (digits.length === 8) {
                consultarCepEvento();
            }
        });
    }

    // Botão Salvar Show no Modal
    if (btnSalvarNovoEvento) {
        btnSalvarNovoEvento.addEventListener('click', salvarNovoEvento);
    }
    if (formNovoEvento) {
        formNovoEvento.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarNovoEvento();
        });
    }
}

/**
 * Exibe notificação Toast na tela
 */
function exibirToast(mensagem, tipo = 'success') {
    if (!toastElement || !bsToast) return;

    let icon = 'bi-check-circle-fill text-success';
    if (tipo === 'danger') icon = 'bi-exclamation-triangle-fill text-danger';
    if (tipo === 'warning') icon = 'bi-exclamation-circle-fill text-warning';
    if (tipo === 'info') icon = 'bi-info-circle-fill text-purple';

    if (toastMessage) {
        toastMessage.innerHTML = `<i class="bi ${icon} fs-5"></i> <span>${mensagem}</span>`;
    }
    bsToast.show();
}
