import { request } from './client.js';

/**
 * Módulo de integração com os endpoints de Endereços e ViaCEP (/api/enderecos).
 */

export async function buscarEnderecoPorCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return request(`/enderecos/cep/${encodeURIComponent(cepLimpo)}`);
}

export async function buscarEnderecoPorLogradouro(uf, cidade, logradouro) {
    const params = new URLSearchParams({ uf, cidade, logradouro });
    return request(`/enderecos/busca?${params.toString()}`);
}
