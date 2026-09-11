import { buscarEventoPorCodigo } from './api/eventos.js';
import { criarBilhetinho } from './api/bilhetinhos.js';
import { buscarMusicasItunes } from './api/itunes.js';

// Estado da página
let eventoAtual = null;
let timerDebounceItunes = null;

// Elementos - Seções
const secaoIdentificarEvento = document.getElementById('secaoIdentificarEvento');
const secaoFormularioBilhetinho = document.getElementById('secaoFormularioBilhetinho');
const secaoSucessoBilhetinho = document.getElementById('secaoSucessoBilhetinho');

// Elementos - Busca do Show (Etapa 1)
const formBuscarEvento = document.getElementById('formBuscarEvento');
const inputCodigoEvento = document.getElementById('inputCodigoEvento');
const btnBuscarEvento = document.getElementById('btnBuscarEvento');

// Elementos - Dados do Show (Etapa 2)
const showNome = document.getElementById('showNome');
const showMusico = document.getElementById('showMusico');
const showLocal = document.getElementById('showLocal');
const showData = document.getElementById('showData');
const showStatusBadge = document.getElementById('showStatusBadge');
const alertaShowEncerrado = document.getElementById('alertaShowEncerrado');
const containerFormulario = document.getElementById('containerFormulario');

// Elementos - Formulário do Bilhetinho
const formBilhetinho = document.getElementById('formBilhetinho');
const inputBuscaItunes = document.getElementById('inputBuscaItunes');
const btnLimparBuscaItunes = document.getElementById('btnLimparBuscaItunes');
const containerSugestoesItunes = document.getElementById('containerSugestoesItunes');
const inputMusica = document.getElementById('inputMusica');
const inputArtista = document.getElementById('inputArtista');
const inputNomeSolicitante = document.getElementById('inputNomeSolicitante');
const inputMensagem = document.getElementById('inputMensagem');
const btnEnviarBilhetinho = document.getElementById('btnEnviarBilhetinho');
const btnTrocarShow = document.getElementById('btnTrocarShow');

// Elementos - Sucesso (Etapa 3)
const sucessoMusica = document.getElementById('sucessoMusica');
const sucessoArtista = document.getElementById('sucessoArtista');
const sucessoSolicitante = document.getElementById('sucessoSolicitante');
const btnPedirOutra = document.getElementById('btnPedirOutra');
const btnVoltarInicio = document.getElementById('btnVoltarInicio');

// Elementos - Toast
const toastElement = document.getElementById('bilhetinhoToast');
const toastMessage = document.getElementById('toastMessage');
let bsToast = null;

/**
 * Inicialização ao carregar a página
 */
document.addEventListener('DOMContentLoaded', () => {
    if (toastElement) {
        bsToast = new bootstrap.Toast(toastElement);
    }

    configurarOuvintesEventos();
    verificarParametroUrl();
});

/**
 * Verifica se foi passado o parâmetro ?evento=UUID na URL (ex: via leitura de QR Code)
 */
function verificarParametroUrl() {
    const params = new URLSearchParams(window.location.search);
    const codUrl = params.get('evento');

    if (codUrl) {
        if (inputCodigoEvento) {
            inputCodigoEvento.value = codUrl.trim();
        }
        carregarEventoPorCodigo(codUrl.trim());
    }
}

/**
 * Alterna as seções da página de envio de bilhetinho
 * @param {'identificar' | 'formulario' | 'sucesso'} visao
 */
function exibirSecao(visao) {
    if (secaoIdentificarEvento) secaoIdentificarEvento.classList.add('d-none');
    if (secaoFormularioBilhetinho) secaoFormularioBilhetinho.classList.add('d-none');
    if (secaoSucessoBilhetinho) secaoSucessoBilhetinho.classList.add('d-none');

    if (visao === 'identificar') {
        if (secaoIdentificarEvento) secaoIdentificarEvento.classList.remove('d-none');
        if (inputCodigoEvento) inputCodigoEvento.focus();
    } else if (visao === 'formulario') {
        if (secaoFormularioBilhetinho) secaoFormularioBilhetinho.classList.remove('d-none');
        if (inputBuscaItunes) inputBuscaItunes.focus();
    } else if (visao === 'sucesso') {
        if (secaoSucessoBilhetinho) secaoSucessoBilhetinho.classList.remove('d-none');
    }
}

/**
 * Consulta e carrega os dados do evento pelo código UUID
 * @param {string} codEvento
 */
async function carregarEventoPorCodigo(codEvento) {
    const codigo = codEvento ? codEvento.trim() : '';

    if (!codigo) {
        exibirToast('Por favor, informe o código do show.', 'warning');
        return;
    }

    if (btnBuscarEvento) {
        btnBuscarEvento.disabled = true;
        btnBuscarEvento.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Localizando...';
    }

    try {
        const evento = await buscarEventoPorCodigo(codigo);
        eventoAtual = evento;

        // Preenche os dados do show no cabeçalho
        if (showNome) showNome.textContent = evento.nome;
        if (showMusico) showMusico.textContent = evento.nomeMusico || 'Músico não identificado';
        if (showLocal) showLocal.textContent = evento.local || 'Local não informado';
        if (showData) showData.textContent = formatarDataHora(evento.dataHora);

        // Atualiza status do show
        const statusBadge = formatarStatusBadge(evento.status);
        if (showStatusBadge) {
            showStatusBadge.className = `badge ${statusBadge.classe} px-2 py-1`;
            showStatusBadge.textContent = statusBadge.texto;
        }

        // Se o evento estiver encerrado, bloqueia envio
        const showEncerrado = (evento.status === 'ENCERRADO');
        if (alertaShowEncerrado) {
            alertaShowEncerrado.classList.toggle('d-none', !showEncerrado);
        }
        if (containerFormulario) {
            containerFormulario.classList.toggle('d-none', showEncerrado);
        }

        limparFormularioBilhetinho();
        exibirSecao('formulario');

    } catch (error) {
        console.error('Erro ao buscar show:', error);
        exibirToast(error.message || 'Show não localizado para o código informado.', 'danger');
    } finally {
        if (btnBuscarEvento) {
            btnBuscarEvento.disabled = false;
            btnBuscarEvento.innerHTML = '<i class="bi bi-search me-1"></i> Acessar';
        }
    }
}

/**
 * Limpa todos os campos do formulário de bilhetinho
 */
function limparFormularioBilhetinho() {
    if (formBilhetinho) formBilhetinho.reset();
    if (inputBuscaItunes) inputBuscaItunes.value = '';
    if (inputMusica) inputMusica.value = '';
    if (inputArtista) inputArtista.value = '';
    if (inputNomeSolicitante) inputNomeSolicitante.value = '';
    if (inputMensagem) inputMensagem.value = '';
    esconderSugestoesItunes();
    if (btnLimparBuscaItunes) btnLimparBuscaItunes.classList.add('d-none');
}

/**
 * Submete o envio do bilhetinho
 */
async function enviarNovoBilhetinho() {
    if (!eventoAtual || !eventoAtual.codEvento) {
        exibirToast('Nenhum show ativo localizado. Acesso inválido.', 'danger');
        exibirSecao('identificar');
        return;
    }

    if (eventoAtual.status === 'ENCERRADO') {
        exibirToast('Este show já foi encerrado e não recebe mais bilhetinhos.', 'warning');
        return;
    }

    const musica = inputMusica ? inputMusica.value.trim() : '';
    const artista = inputArtista ? inputArtista.value.trim() : '';
    // Regra do refinamento: nome é opcional, se não informado envia "Anônimo"
    const nomeInformado = inputNomeSolicitante ? inputNomeSolicitante.value.trim() : '';
    const nomeSolicitante = nomeInformado || 'Anônimo';
    const mensagem = inputMensagem ? inputMensagem.value.trim() : null;

    if (!musica || !artista) {
        exibirToast('Por favor, informe o nome da música e do artista.', 'warning');
        if (!musica && inputMusica) inputMusica.focus();
        else if (!artista && inputArtista) inputArtista.focus();
        return;
    }

    if (btnEnviarBilhetinho) {
        btnEnviarBilhetinho.disabled = true;
        btnEnviarBilhetinho.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando Bilhetinho...';
    }

    const payload = {
        codEvento: eventoAtual.codEvento,
        musica: musica,
        artista: artista,
        nomeSolicitante: nomeSolicitante,
        mensagem: mensagem || null
    };

    try {
        const bilhetinhoCriado = await criarBilhetinho(payload);

        // Preenche dados da tela de sucesso
        if (sucessoMusica) sucessoMusica.textContent = bilhetinhoCriado.musica;
        if (sucessoArtista) sucessoArtista.textContent = bilhetinhoCriado.artista;
        if (sucessoSolicitante) sucessoSolicitante.textContent = `Pedido por: ${bilhetinhoCriado.nomeSolicitante}`;

        exibirToast('Bilhetinho entregue com sucesso para o músico!', 'success');
        limparFormularioBilhetinho();
        exibirSecao('sucesso');

    } catch (error) {
        console.error('Erro ao enviar bilhetinho:', error);
        exibirToast(error.message || 'Erro ao enviar o bilhetinho.', 'danger');
    } finally {
        if (btnEnviarBilhetinho) {
            btnEnviarBilhetinho.disabled = false;
            btnEnviarBilhetinho.innerHTML = '<i class="bi bi-send-fill me-2"></i> Enviar Bilhetinho';
        }
    }
}

/**
 * Busca sugestões de faixas na iTunes Search API conforme o usuário digita
 */
function manipularBuscaItunes(texto) {
    const termo = texto ? texto.trim() : '';

    if (btnLimparBuscaItunes) {
        btnLimparBuscaItunes.classList.toggle('d-none', termo.length === 0);
    }

    clearTimeout(timerDebounceItunes);

    if (termo.length < 2) {
        esconderSugestoesItunes();
        return;
    }

    // Exibe indicador temporário enquanto digita
    if (containerSugestoesItunes) {
        containerSugestoesItunes.innerHTML = `
            <div class="p-3 text-center text-secondary small">
                <span class="spinner-border spinner-border-sm text-purple me-1"></span> Buscando músicas no iTunes...
            </div>
        `;
        containerSugestoesItunes.classList.remove('d-none');
    }

    timerDebounceItunes = setTimeout(async () => {
        const sugestoes = await buscarMusicasItunes(termo);
        renderizarSugestoesItunes(sugestoes);
    }, 300);
}

/**
 * Renderiza a lista deduplicada de sugestões do iTunes
 * @param {Array<{ musica: string, artista: string }>} sugestoes
 */
function renderizarSugestoesItunes(sugestoes) {
    if (!containerSugestoesItunes) return;

    if (!sugestoes || sugestoes.length === 0) {
        containerSugestoesItunes.innerHTML = `
            <div class="p-3 text-secondary small text-center">
                <i class="bi bi-search me-1"></i> Nenhuma sugestão encontrada. Digite o nome da música e artista abaixo.
            </div>
        `;
        containerSugestoesItunes.classList.remove('d-none');
        return;
    }

    containerSugestoesItunes.innerHTML = sugestoes.map(item => `
        <div class="sugestao-item" data-musica="${escapeHtml(item.musica)}" data-artista="${escapeHtml(item.artista)}">
            <div class="sugestao-musica"><i class="bi bi-music-note me-1 text-purple"></i> ${escapeHtml(item.musica)}</div>
            <div class="sugestao-artista">${escapeHtml(item.artista)}</div>
        </div>
    `).join('');

    containerSugestoesItunes.classList.remove('d-none');

    // Associa clique em cada item
    const itens = containerSugestoesItunes.querySelectorAll('.sugestao-item');
    itens.forEach(el => {
        el.addEventListener('click', () => {
            const m = el.getAttribute('data-musica');
            const a = el.getAttribute('data-artista');

            if (inputMusica) inputMusica.value = m;
            if (inputArtista) inputArtista.value = a;
            if (inputBuscaItunes) inputBuscaItunes.value = `${m} - ${a}`;

            esconderSugestoesItunes();

            // Foco vai para o nome do solicitante
            if (inputNomeSolicitante) inputNomeSolicitante.focus();
        });
    });
}

/**
 * Esconde o container de sugestões do iTunes
 */
function esconderSugestoesItunes() {
    if (containerSugestoesItunes) {
        containerSugestoesItunes.classList.add('d-none');
        containerSugestoesItunes.innerHTML = '';
    }
}

/**
 * Configura os ouvintes de eventos da página
 */
function configurarOuvintesEventos() {

    // Submissão da Etapa 1: Localizar Evento
    if (formBuscarEvento) {
        formBuscarEvento.addEventListener('submit', (e) => {
            e.preventDefault();
            const cod = inputCodigoEvento ? inputCodigoEvento.value.trim() : '';
            carregarEventoPorCodigo(cod);
        });
    }

    // Input de busca do iTunes
    if (inputBuscaItunes) {
        inputBuscaItunes.addEventListener('input', (e) => {
            manipularBuscaItunes(e.target.value);
        });
    }

    // Botão Limpar busca do iTunes
    if (btnLimparBuscaItunes) {
        btnLimparBuscaItunes.addEventListener('click', () => {
            if (inputBuscaItunes) inputBuscaItunes.value = '';
            btnLimparBuscaItunes.classList.add('d-none');
            esconderSugestoesItunes();
            if (inputBuscaItunes) inputBuscaItunes.focus();
        });
    }

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#containerSugestoesItunes') && !e.target.closest('#inputBuscaItunes')) {
            esconderSugestoesItunes();
        }
    });

    // Submissão do Formulário de Bilhetinho
    if (formBilhetinho) {
        formBilhetinho.addEventListener('submit', (e) => {
            e.preventDefault();
            enviarNovoBilhetinho();
        });
    }

    // Ação: Trocar de Show (voltar para Etapa 1)
    if (btnTrocarShow) {
        btnTrocarShow.addEventListener('click', () => {
            eventoAtual = null;
            limparFormularioBilhetinho();
            exibirSecao('identificar');
        });
    }

    // Ação: Pedir outra música para o mesmo show
    if (btnPedirOutra) {
        btnPedirOutra.addEventListener('click', () => {
            limparFormularioBilhetinho();
            exibirSecao('formulario');
        });
    }

    // Ação: Trocar de show a partir da tela de sucesso
    if (btnVoltarInicio) {
        btnVoltarInicio.addEventListener('click', () => {
            eventoAtual = null;
            if (inputCodigoEvento) inputCodigoEvento.value = '';
            limparFormularioBilhetinho();
            exibirSecao('identificar');
        });
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
 * Mapeia o status do evento para badges visuais
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
