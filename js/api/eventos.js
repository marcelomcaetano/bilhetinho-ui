import { request } from './client.js';

/**
 * Módulo de integração com os endpoints de Eventos (/api/eventos).
 */

export async function listarEventosPorMusico(musicoId) {
    return request(`/eventos/musico/${musicoId}`);
}

export async function criarEvento(dadosEvento) {
    return request('/eventos', {
        method: 'POST',
        body: JSON.stringify(dadosEvento)
    });
}

export async function buscarEventoPorId(id) {
    return request(`/eventos/${id}`);
}

export async function buscarEventoPorCodigo(codEvento) {
    return request(`/eventos/codigo/${codEvento}`);
}

export async function atualizarStatusEvento(id, status) {
    return request(`/eventos/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}
