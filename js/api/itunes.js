/**
 * Módulo de integração com a iTunes Search API pública da Apple.
 * Diretrizes do projeto:
 * - Apenas nome da faixa (música) e nome do artista.
 * - Sem player de áudio e sem capa de álbum.
 * - Deduplicação de faixas idênticas do mesmo artista (estúdio, ao vivo, coletâneas, etc.).
 */

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

/**
 * Busca sugestões de músicas pelo termo digitado.
 * @param {string} termo Texto digitado pelo usuário (música ou artista)
 * @param {number} limite Quantidade máxima de resultados brutos a consultar
 * @returns {Promise<Array<{ musica: string, artista: string }>>} Lista deduplicada
 */
export async function buscarMusicasItunes(termo, limite = 15) {
    const termoLimpo = termo ? termo.trim() : '';
    if (!termoLimpo || termoLimpo.length < 2) {
        return [];
    }

    const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(termoLimpo)}&entity=song&limit=${limite}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`iTunes API retornou status ${response.status}`);
            return [];
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.results)) {
            return [];
        }

        const conjuntoChaves = new Set();
        const resultadosDeduplicados = [];

        for (const item of data.results) {
            if (!item.trackName || !item.artistName) {
                continue;
            }

            const musica = item.trackName.trim();
            const artista = item.artistName.trim();

            // Chave normalizada para deduplicação (ex: 'evidencias:::chitaozinho & xororo')
            const chave = `${musica.toLowerCase()}:::${artista.toLowerCase()}`;

            if (!conjuntoChaves.has(chave)) {
                conjuntoChaves.add(chave);
                resultadosDeduplicados.push({
                    musica,
                    artista
                });
            }
        }

        return resultadosDeduplicados;

    } catch (error) {
        console.error('Erro na consulta à iTunes Search API:', error);
        return [];
    }
}
