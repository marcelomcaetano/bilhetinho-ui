import { request } from './client.js';

/**
 * Módulo de integração com os endpoints de Bilhetinhos (/api/bilhetinhos).
 */

/**
 * Envia um novo pedido de música (bilhetinho) para o evento.
 * @param {{ codEvento: string, musica: string, artista: string, nomeSolicitante: string, mensagem?: string }} dadosBilhetinho
 */
export async function criarBilhetinho(dadosBilhetinho) {
    return request('/bilhetinhos', {
        method: 'POST',
        body: JSON.stringify(dadosBilhetinho)
    });
}

/**
 * Consulta um bilhetinho pelo seu ID.
 * @param {number} id
 */
export async function buscarBilhetinhoPorId(id) {
    return request(`/bilhetinhos/${id}`);
}

/**
 * Lista a fila de pedidos de um evento específico.
 * @param {number} eventoId
 */
export async function listarBilhetinhosPorEvento(eventoId) {
    return request(`/bilhetinhos/evento/${eventoId}`);
}

/**
 * Atualiza o status de um bilhetinho (ex: PENDENTE, ATENDIDO, RECUSADO).
 * @param {number} id
 * @param {'PENDENTE' | 'ATENDIDO' | 'RECUSADO'} status
 */
export async function atualizarStatusBilhetinho(id, status) {
    return request(`/bilhetinhos/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}
