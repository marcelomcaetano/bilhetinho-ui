import { buscarMusicoPorEmail, cadastrarMusico } from './api/musicos.js';
import { listarEventosPorMusico, criarEvento, excluirEvento } from './api/eventos.js';
import { buscarEnderecoPorCep } from './api/enderecos.js';
import { listarBilhetinhosPorEvento, atualizarStatusBilhetinho } from './api/bilhetinhos.js';

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

// Modal de Confirmação de Exclusão de Show
const modalExcluirEventoElement = document.getElementById('modalExcluirEvento');
let bsModalExcluirEvento = null;
const nomeEventoExclusao = document.getElementById('nomeEventoExclusao');
const btnConfirmarExclusaoEvento = document.getElementById('btnConfirmarExclusaoEvento');
let eventoIdParaExcluir = null;

// Toasts de Feedback
const toastElement = document.getElementById('feedbackToast');
const toastMessage = document.getElementById('toastMessage');
let bsToast = null;

// Subseções de Gestão de Shows e de Bilhetinhos (Pedidos)
const subsecaoShowsMusico = document.getElementById('subsecaoShowsMusico');
const subsecaoBilhetinhosMusico = document.getElementById('subsecaoBilhetinhosMusico');
const tituloBilhetinhosEvento = document.getElementById('tituloBilhetinhosEvento');
const subtituloBilhetinhosEvento = document.getElementById('subtituloBilhetinhosEvento');
const btnVoltarParaShows = document.getElementById('btnVoltarParaShows');
const btnRecarregarBilhetinhos = document.getElementById('btnRecarregarBilhetinhos');
const tabelaPedidosPendentes = document.getElementById('tabelaPedidosPendentes');
const badgeTotalPendentes = document.getElementById('badgeTotalPendentes');
const tabelaPedidosFinalizados = document.getElementById('tabelaPedidosFinalizados');
const badgeTotalFinalizados = document.getElementById('badgeTotalFinalizados');

// Estado do Evento Selecionado para Gestão de Pedidos
let eventoSelecionadoId = null;
let eventoSelecionadoNome = '';

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

    if (modalExcluirEventoElement) {
        bsModalExcluirEvento = new bootstrap.Modal(modalExcluirEventoElement);
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
        voltarParaListaShows();
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

                        <div class="pt-2 d-flex gap-2">
                            <button type="button" class="btn btn-danger px-3 py-2 d-flex align-items-center justify-content-center gap-1 btn-excluir-evento" data-evento-id="${evento.id}" data-evento-nome="${escapeHtml(evento.nome)}" title="Excluir este show">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                            <button class="btn btn-primary-gradient flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 btn-ver-pedidos" data-evento-id="${evento.id}" data-evento-nome="${escapeHtml(evento.nome)}">
                                <i class="bi bi-envelope-paper-heart"></i>
                                <span>Ver Pedidos de Músicas</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        configurarBotoesVerPedidos();
        configurarBotoesExcluirEvento();

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
 * Configura os botões para abrir a listagem de pedidos de música do evento
 */
function configurarBotoesVerPedidos() {
    const botoes = document.querySelectorAll('.btn-ver-pedidos');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const eventoId = btn.getAttribute('data-evento-id');
            const eventoNome = btn.getAttribute('data-evento-nome') || 'Show';
            exibirBilhetinhosDoEvento(eventoId, eventoNome);
        });
    });
}

/**
 * Configura os botões para abrir o modal de confirmação de exclusão do show
 */
function configurarBotoesExcluirEvento() {
    const botoes = document.querySelectorAll('.btn-excluir-evento');
    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            eventoIdParaExcluir = btn.getAttribute('data-evento-id');
            const nome = btn.getAttribute('data-evento-nome') || 'este show';
            if (nomeEventoExclusao) {
                nomeEventoExclusao.textContent = `"${nome}"`;
            }
            if (bsModalExcluirEvento) {
                bsModalExcluirEvento.show();
            }
        });
    });
}

/**
 * Substitui a lista de shows pela lista de pedidos (bilhetinhos) do evento
 * @param {number|string} eventoId 
 * @param {string} eventoNome 
 */
function exibirBilhetinhosDoEvento(eventoId, eventoNome) {
    eventoSelecionadoId = Number(eventoId);
    eventoSelecionadoNome = eventoNome;

    // Oculta a listagem de shows e exibe a tela de pedidos
    if (subsecaoShowsMusico) subsecaoShowsMusico.classList.add('d-none');
    if (subsecaoBilhetinhosMusico) subsecaoBilhetinhosMusico.classList.remove('d-none');

    if (tituloBilhetinhosEvento) {
        tituloBilhetinhosEvento.textContent = `Pedidos de Músicas — ${eventoNome}`;
    }
    if (subtituloBilhetinhosEvento) {
        subtituloBilhetinhosEvento.textContent = `Fila de pedidos do show em tempo real`;
    }

    // Scroll suave para a visualização
    subsecaoBilhetinhosMusico?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    carregarBilhetinhosDoEvento(eventoSelecionadoId);
}

/**
 * Retorna para a listagem de shows do músico
 */
function voltarParaListaShows() {
    eventoSelecionadoId = null;
    eventoSelecionadoNome = '';

    if (subsecaoBilhetinhosMusico) subsecaoBilhetinhosMusico.classList.add('d-none');
    if (subsecaoShowsMusico) subsecaoShowsMusico.classList.remove('d-none');
}

/**
 * Carrega a fila e o histórico de bilhetinhos do evento e atualiza as duas tabelas:
 * 1 - Pedidos não atendidos (PENDENTE) ordenados da mais antiga para a mais recente (data_hora asc)
 * 2 - Pedidos já atendidos (ACEITO) e em seguida rejeitados (REJEITADO), ordenados por data_hora
 * @param {number} eventoId 
 */
async function carregarBilhetinhosDoEvento(eventoId) {
    if (!eventoId) return;

    if (tabelaPedidosPendentes) {
        tabelaPedidosPendentes.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-secondary">
                    <span class="spinner-border spinner-border-sm text-purple me-2"></span>
                    Carregando pedidos na fila...
                </td>
            </tr>
        `;
    }
    if (tabelaPedidosFinalizados) {
        tabelaPedidosFinalizados.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-secondary">
                    <span class="spinner-border spinner-border-sm text-purple me-2"></span>
                    Carregando histórico...
                </td>
            </tr>
        `;
    }

    try {
        const pedidos = await listarBilhetinhosPorEvento(eventoId);
        const listaPedidos = Array.isArray(pedidos) ? pedidos : [];

        // 1 - Pedidos que ainda não foram atendidos (status PENDENTE)
        // Ordenados pelo campo data_hora iniciando pela mais antiga para a mais recente (Ascendente)
        const pendentes = listaPedidos
            .filter(p => p.status === 'PENDENTE')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        // 2 - Pedidos que já foram tocados (ACEITO) e logo em seguida pelos REJEITADO, ordenados pela data_hora
        const aceitos = listaPedidos
            .filter(p => p.status === 'ACEITO')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        const rejeitados = listaPedidos
            .filter(p => p.status === 'REJEITADO')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        const finalizados = [...aceitos, ...rejeitados];

        renderizarTabelaPendentes(pendentes);
        renderizarTabelaFinalizados(finalizados);

    } catch (error) {
        console.error('Erro ao buscar bilhetinhos do evento:', error);
        if (tabelaPedidosPendentes) {
            tabelaPedidosPendentes.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                        Erro ao carregar fila de pedidos: ${escapeHtml(error.message)}
                    </td>
                </tr>
            `;
        }
        if (tabelaPedidosFinalizados) {
            tabelaPedidosFinalizados.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                        Erro ao carregar histórico: ${escapeHtml(error.message)}
                    </td>
                </tr>
            `;
        }
        exibirToast(`Erro ao carregar pedidos: ${error.message}`, 'danger');
    }
}

/**
 * Renderiza a listagem 1: Pedidos na fila (não atendidos / PENDENTE)
 * com botões de Aceitar e Rejeitar
 * @param {Array} pendentes 
 */
function renderizarTabelaPendentes(pendentes) {
    if (badgeTotalPendentes) {
        badgeTotalPendentes.textContent = `${pendentes.length}`;
    }

    if (!tabelaPedidosPendentes) return;

    if (pendentes.length === 0) {
        tabelaPedidosPendentes.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-secondary py-4">
                    <i class="bi bi-inbox fs-4 d-block mb-1 text-secondary opacity-75"></i>
                    Nenhum pedido na fila aguardando atendimento.
                </td>
            </tr>
        `;
        return;
    }

    tabelaPedidosPendentes.innerHTML = pendentes.map(p => {
        const horaFmt = formatarHoraCurta(p.dataHora);
        const dataFmt = formatarDataCurta(p.dataHora);
        const mensagemFmt = p.mensagem && p.mensagem.trim()
            ? `<span class="text-light fst-italic">"${escapeHtml(p.mensagem)}"</span>`
            : `<span class="text-secondary">-</span>`;

        return `
            <tr data-pedido-id="${p.id}">
                <td>
                    <span class="fw-semibold text-white">${horaFmt}</span>
                    <span class="d-block text-secondary small">${dataFmt}</span>
                </td>
                <td>
                    <span class="fw-bold text-white">${escapeHtml(p.musica)}</span>
                </td>
                <td>
                    <span class="text-secondary">${escapeHtml(p.artista || '-')}</span>
                </td>
                <td>
                    <span class="fw-semibold text-light">${escapeHtml(p.nomeSolicitante)}</span>
                </td>
                <td>
                    ${mensagemFmt}
                </td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                        <button type="button" class="btn btn-success btn-sm px-2 py-1 btn-aceitar-pedido d-inline-flex align-items-center gap-1" data-id="${p.id}" title="Aceitar / Tocar música">
                            <i class="bi bi-check-circle"></i>
                            <span>Aceitar</span>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm px-2 py-1 btn-rejeitar-pedido d-inline-flex align-items-center gap-1" data-id="${p.id}" title="Rejeitar pedido">
                            <i class="bi bi-x-circle"></i>
                            <span>Rejeitar</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    configurarAcoesPedidosPendentes();
}

/**
 * Renderiza a listagem 2: Pedidos já tocados (ACEITO) e rejeitados (REJEITADO)
 * @param {Array} finalizados 
 */
function renderizarTabelaFinalizados(finalizados) {
    if (badgeTotalFinalizados) {
        badgeTotalFinalizados.textContent = `${finalizados.length}`;
    }

    if (!tabelaPedidosFinalizados) return;

    if (finalizados.length === 0) {
        tabelaPedidosFinalizados.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-secondary py-4">
                    <i class="bi bi-music-note-list fs-4 d-block mb-1 text-secondary opacity-75"></i>
                    Nenhum pedido atendido ou rejeitado ainda.
                </td>
            </tr>
        `;
        return;
    }

    tabelaPedidosFinalizados.innerHTML = finalizados.map(p => {
        const horaFmt = formatarHoraCurta(p.dataHora);
        const dataFmt = formatarDataCurta(p.dataHora);
        const isAceito = p.status === 'ACEITO';
        const badgeStatus = isAceito
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-check2-circle me-1"></i> ACEITO</span>`
            : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i class="bi bi-x-circle me-1"></i> REJEITADO</span>`;
        const mensagemFmt = p.mensagem && p.mensagem.trim()
            ? `<span class="text-secondary fst-italic">"${escapeHtml(p.mensagem)}"</span>`
            : `<span class="text-secondary">-</span>`;

        return `
            <tr>
                <td>${badgeStatus}</td>
                <td>
                    <span class="fw-semibold text-white">${horaFmt}</span>
                    <span class="d-block text-secondary small">${dataFmt}</span>
                </td>
                <td>
                    <span class="fw-semibold text-white">${escapeHtml(p.musica)}</span>
                </td>
                <td>
                    <span class="text-secondary">${escapeHtml(p.artista || '-')}</span>
                </td>
                <td>
                    <span class="text-light">${escapeHtml(p.nomeSolicitante)}</span>
                </td>
                <td>
                    ${mensagemFmt}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Configura os listeners dos botões Aceitar e Rejeitar da tabela de pendentes
 */
function configurarAcoesPedidosPendentes() {
    if (!tabelaPedidosPendentes) return;

    const botoesAceitar = tabelaPedidosPendentes.querySelectorAll('.btn-aceitar-pedido');
    botoesAceitar.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await alterarStatusDoPedido(id, 'ACEITO', btn);
        });
    });

    const botoesRejeitar = tabelaPedidosPendentes.querySelectorAll('.btn-rejeitar-pedido');
    botoesRejeitar.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await alterarStatusDoPedido(id, 'REJEITADO', btn);
        });
    });
}

/**
 * Executa a requisição de atualização de status do bilhetinho (ACEITO ou REJEITADO)
 * @param {number|string} pedidoId 
 * @param {'ACEITO' | 'REJEITADO'} novoStatus 
 * @param {HTMLElement} botaoElemento 
 */
async function alterarStatusDoPedido(pedidoId, novoStatus, botaoElemento) {
    if (!pedidoId || !eventoSelecionadoId) return;

    // Desabilita os botões da linha para evitar requisições concorrentes
    const tr = botaoElemento ? botaoElemento.closest('tr') : null;
    const botoesTr = tr ? tr.querySelectorAll('button') : [];
    botoesTr.forEach(b => { b.disabled = true; });

    const originalContent = botaoElemento ? botaoElemento.innerHTML : '';
    if (botaoElemento) {
        botaoElemento.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    }

    try {
        await atualizarStatusBilhetinho(Number(pedidoId), novoStatus);
        const mensagemFeedback = novoStatus === 'ACEITO'
            ? 'Música aceita com sucesso!'
            : 'Pedido rejeitado.';
        exibirToast(mensagemFeedback, novoStatus === 'ACEITO' ? 'success' : 'warning');

        // Atualiza ambas as listagens da tela
        await carregarBilhetinhosDoEvento(eventoSelecionadoId);
    } catch (error) {
        console.error('Erro ao alterar status do bilhetinho:', error);
        exibirToast(`Erro ao alterar status: ${error.message}`, 'danger');
        if (botaoElemento) {
            botaoElemento.innerHTML = originalContent;
        }
        botoesTr.forEach(b => { b.disabled = false; });
    }
}

/**
 * Formata apenas a hora no padrão HH:mm
 */
function formatarHoraCurta(dataHoraString) {
    if (!dataHoraString) return '-';
    try {
        const data = new Date(dataHoraString);
        if (isNaN(data.getTime())) return dataHoraString;
        return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dataHoraString;
    }
}

/**
 * Formata apenas o dia/mês no padrão DD/MM
 */
function formatarDataCurta(dataHoraString) {
    if (!dataHoraString) return '';
    try {
        const data = new Date(dataHoraString);
        if (isNaN(data.getTime())) return '';
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
        return '';
    }
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

    // Botão Voltar para a lista de shows (a partir da tela de bilhetinhos)
    if (btnVoltarParaShows) {
        btnVoltarParaShows.addEventListener('click', voltarParaListaShows);
    }

    // Botão de recarregar bilhetinhos da tela
    if (btnRecarregarBilhetinhos) {
        btnRecarregarBilhetinhos.addEventListener('click', async () => {
            if (eventoSelecionadoId) {
                const icon = btnRecarregarBilhetinhos.querySelector('i');
                btnRecarregarBilhetinhos.disabled = true;
                if (icon) icon.className = 'spinner-border spinner-border-sm me-1';
                await carregarBilhetinhosDoEvento(eventoSelecionadoId);
                btnRecarregarBilhetinhos.disabled = false;
                if (icon) icon.className = 'bi bi-arrow-clockwise me-1';
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

    // Botão Confirmar Exclusão de Show no Modal
    if (btnConfirmarExclusaoEvento) {
        btnConfirmarExclusaoEvento.addEventListener('click', async () => {
            if (!eventoIdParaExcluir) return;

            btnConfirmarExclusaoEvento.disabled = true;
            btnConfirmarExclusaoEvento.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Excluindo...';

            try {
                await excluirEvento(Number(eventoIdParaExcluir));
                if (bsModalExcluirEvento) {
                    bsModalExcluirEvento.hide();
                }
                exibirToast('Show e todos os pedidos relacionados foram excluídos com sucesso!', 'success');

                // Se o show excluído estiver atualmente aberto na gestão de pedidos, volta para a lista
                if (eventoSelecionadoId && Number(eventoSelecionadoId) === Number(eventoIdParaExcluir)) {
                    voltarParaListaShows();
                }

                eventoIdParaExcluir = null;

                if (musicoAtivo && musicoAtivo.id) {
                    await carregarEventosDoMusico(musicoAtivo.id);
                }
            } catch (err) {
                console.error('Erro ao excluir show:', err);
                exibirToast(err.message || 'Erro ao excluir o show.', 'danger');
            } finally {
                btnConfirmarExclusaoEvento.disabled = false;
                btnConfirmarExclusaoEvento.innerHTML = '<i class="bi bi-trash3-fill me-2"></i> Confirmar Exclusão';
            }
        });
    }

    if (modalExcluirEventoElement) {
        modalExcluirEventoElement.addEventListener('hidden.bs.modal', () => {
            eventoIdParaExcluir = null;
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
