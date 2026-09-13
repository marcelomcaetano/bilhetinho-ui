import { listarEventosAtivos } from './api/eventos.js';

// Elementos da Página
const containerShowsAtivos = document.getElementById('containerShowsAtivos');
const badgeTotalAtivos = document.getElementById('badgeTotalAtivos');
const btnRecarregarAtivos = document.getElementById('btnRecarregarAtivos');

// Toasts de Notificação
const toastElement = document.getElementById('homeToast');
const toastMessage = document.getElementById('toastMessage');
let bsToast = null;

/**
 * Inicialização ao carregar a página inicial
 */
document.addEventListener('DOMContentLoaded', () => {
    if (toastElement) {
        bsToast = new bootstrap.Toast(toastElement);
    }

    if (btnRecarregarAtivos) {
        btnRecarregarAtivos.addEventListener('click', carregarShowsAtivos);
    }

    carregarShowsAtivos();
});

/**
 * Busca e renderiza todos os shows com status ATIVO
 */
async function carregarShowsAtivos() {
    if (!containerShowsAtivos) return;

    // Estado de carregamento
    containerShowsAtivos.innerHTML = `
        <div class="col-12 text-center py-5">
            <span class="spinner-border spinner-border-sm text-purple" role="status"></span>
            <span class="text-secondary small ms-2">Buscando shows ativos no momento...</span>
        </div>
    `;

    try {
        const eventos = await listarEventosAtivos();

        if (!eventos || eventos.length === 0) {
            if (badgeTotalAtivos) badgeTotalAtivos.textContent = '0 shows';
            containerShowsAtivos.innerHTML = `
                <div class="col-12">
                    <div class="card card-custom p-5 text-center">
                        <i class="bi bi-calendar-x fs-1 text-secondary mb-2"></i>
                        <h2 class="h5 fw-bold text-white mb-2">Nenhum show ativo no momento</h2>
                        <p class="text-secondary small mb-3">
                            No momento não há apresentações com status ativo no sistema. Assim que um músico iniciar um show, ele aparecerá aqui!
                        </p>
                        <div>
                            <a href="musico.html?v=2.0.1" class="btn btn-primary-gradient btn-sm">
                                <i class="bi bi-person-badge me-1"></i> Sou Músico e Quero Cadastrar Show
                            </a>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        if (badgeTotalAtivos) {
            badgeTotalAtivos.textContent = `${eventos.length} ${eventos.length === 1 ? 'show ativo' : 'shows ativos'}`;
        }

        // Renderiza cada show em card idêntico ao padrão visual da área do músico
        containerShowsAtivos.innerHTML = eventos.map(evento => {
            const dataFmt = formatarDataHora(evento.dataHora);
            const statusBadge = formatarStatusBadge(evento.status);
            const enderecoFmt = formatarEndereco(evento.endereco);
            const nomeMusico = evento.nomeMusico || 'Músico participante';

            return `
                <div class="col-12 col-md-6 col-lg-6">
                    <div class="card card-custom h-100 p-4">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                            <div>
                                <h2 class="h5 fw-bold text-white mb-1">${escapeHtml(evento.nome)}</h2>
                                <div class="text-purple small fw-semibold d-flex align-items-center gap-1 mb-1">
                                    <i class="bi bi-person-fill"></i>
                                    <span>${escapeHtml(nomeMusico)}</span>
                                </div>
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

                        <div class="pt-2">
                            <button class="btn btn-primary-gradient w-100 py-2 mb-2 btn-acessar-show" title="Acessar a página do show">
                                <i class="bi bi-box-arrow-in-right me-1"></i> Acessar Show
                            </button>
                            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-black bg-opacity-25 border border-secondary-subtle">
                                <div class="d-flex align-items-center gap-2 overflow-hidden me-2">
                                    <i class="bi bi-qr-code text-purple flex-shrink-0" title="Código do show"></i>
                                    <span class="text-secondary small text-nowrap">Código:</span>
                                    <code class="text-light small font-monospace text-truncate user-select-all" title="${escapeHtml(evento.codEvento)}">${escapeHtml(evento.codEvento)}</code>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary border-0 text-secondary btn-copiar-codigo flex-shrink-0" data-uuid="${escapeHtml(evento.codEvento)}" title="Copiar código do show">
                                    <i class="bi bi-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        configurarBotoesAcessarShow();
        configurarBotoesCopiarCodigo();

    } catch (error) {
        console.error('Erro ao carregar shows ativos:', error);
        containerShowsAtivos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Erro ao consultar shows ativos: ${escapeHtml(error.message)}</span>
                </div>
            </div>
        `;
    }
}

/**
 * Configura os botões para acessar a página inicial do bilhetinho
 */
function configurarBotoesAcessarShow() {
    const botoes = document.querySelectorAll('.btn-acessar-show');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'bilhetinho.html?v=2.0.1';
        });
    });
}

/**
 * Configura os botões para copiar o código do evento para a área de transferência
 */
function configurarBotoesCopiarCodigo() {
    const botoes = document.querySelectorAll('.btn-copiar-codigo');
    botoes.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const uuid = btn.getAttribute('data-uuid');
            if (!uuid) return;

            try {
                await navigator.clipboard.writeText(uuid);
                const icone = btn.querySelector('i');
                if (icone) {
                    icone.className = 'bi bi-check-lg text-success';
                    setTimeout(() => {
                        icone.className = 'bi bi-copy';
                    }, 2000);
                }
                exibirToast('Código do show copiado para a área de transferência!', 'success');
            } catch (err) {
                console.warn('Não foi possível copiar o código para a área de transferência:', err);
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
 * Mapeia o status do evento para classes de badges do Bootstrap
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
 * Escapa caracteres especiais para inserção segura no DOM
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
