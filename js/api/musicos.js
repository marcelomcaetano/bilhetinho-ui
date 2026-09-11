import { request } from './client.js';

/**
 * Módulo de integração com os endpoints de Músicos (/api/musicos).
 */

export async function listarMusicos() {
    return request('/musicos');
}

export async function cadastrarMusico(dadosMusico) {
    return request('/musicos', {
        method: 'POST',
        body: JSON.stringify(dadosMusico)
    });
}

export async function buscarMusicoPorId(id) {
    return request(`/musicos/${id}`);
}

export async function buscarMusicoPorEmail(email) {
    return request(`/musicos/email/${encodeURIComponent(email)}`);
}
