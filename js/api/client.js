/**
 * Cliente HTTP base para comunicação com a bilhetinho-api.
 */
const BASE_URL = 'http://localhost:8080/api';

export async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const mensagem = (data && data.message) ? data.message : `Erro na requisição (${response.status})`;
            const erro = new Error(mensagem);
            erro.status = response.status;
            throw erro;
        }

        return data;
    } catch (error) {
        console.error(`Erro na comunicação com a API [${url}]:`, error);
        throw error;
    }
}
