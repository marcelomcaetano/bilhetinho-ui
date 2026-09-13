# Bilhetinho — UI

> MVP desenvolvido para a disciplina de **Engenharia de Software**  
> Pós-Graduação em Engenharia de Software — PUC-Rio

---

## Autor

Marcelo M. Caetano  
[https://www.linkedin.com/in/marcelomcaetano/](https://www.linkedin.com/in/marcelomcaetano/)  

---

## O que este projeto representa

O **Bilhetinho UI** representa o módulo de **Interface com o Usuário (Front-End)** do ecossistema Bilhetinho. Ele é a camada visual e interativa responsável por conectar o público presente nos estabelecimentos aos músicos no palco, eliminando o uso de guardanapos de papel ou a intermediação de garçons para pedidos de música.

A aplicação foi construída com foco em simplicidade, velocidade e responsividade, utilizando **Vanilla JavaScript modular (ES6 Modules)**, **HTML5** e **Bootstrap 5.3 em modo escuro nativo (Dark Mode)**, sem dependência de frameworks compilados ou ferramentas pesadas de build.

---

## Estrutura de Visões e Papéis do Sistema

A experiência do usuário é distribuída em três visões com páginas HTML e scripts dedicados, garantindo o isolamento de responsabilidades e alta performance:

### 1. Página Inicial — Shows Ativos (`index.html` + `js/app.js`)

* **Propósito:** Atuar como a vitrine pública das apresentações ao vivo que estão ocorrendo no momento.
* **Barra de Navegação:** Logotipo do sistema à esquerda e botão de navegação direta para a **Área do Músico** (`musico.html`) à direita.
* **Vitrine Dinâmica de Shows:** Consulta em tempo real o endpoint `GET /api/eventos` do back-end e renderiza cada apresentação ativa em formato de card informativo.
* **Conteúdo dos Cards:** Nome do evento, artista/músico participante, nome do estabelecimento/local, data e hora formatadas no padrão brasileiro e endereço completo.
* **Botão "Acessar Show":** Cada card disponibiliza um botão que copia automaticamente o código identificador universal (UUID) do evento para a área de transferência do usuário e redireciona de imediato para a tela de envio de pedidos (`bilhetinho.html`).
* **Recarregamento e Estado Vazio:** Botão para atualizar a listagem e mensagem visual amigável quando não houver shows ativos cadastrados.

### 2. Área do Músico — Palco & Gestão (`musico.html` + `js/musico.js`)

* **Propósito:** Painel administrativo e operacional para o artista cadastrar shows e gerenciar pedidos de músicas em tempo real.
* **Identificação e Login por E-mail:** Entrada direta sem senha mediante verificação do e-mail no back-end (`GET /api/musicos/email/{email}`).
* **Cadastro Rápido de Perfil:** Caso o e-mail não seja localizado, o usuário é direcionado para a tela de criação de perfil de músico (nome artístico, e-mail e estilo musical).
* **Persistência de Sessão:** Utiliza o `localStorage` do navegador para manter o músico conectado após recarregamentos da página, com opção explícita de encerramento de sessão (`Sair`).
* **Listagem dos Shows do Artista:** Apresenta exclusivamente os eventos vinculados ao identificador do músico logado (`GET /api/eventos/musico/{id}`).
* **Acesso aos Pedidos de Cada Show:** Cada card de show possui o botão **"Ver Pedidos de Músicas"** (substituindo o antigo código UUID e botão de cópia).
* **Gestão de Pedidos (Bilhetinhos) do Show Inline (Sem Modal):**
  * Ao acionar o botão, a grade de shows é substituída diretamente na página pela tela de fila e histórico de bilhetinhos daquele evento.
  * **Botão "Meus Shows":** Permite retornar à listagem de shows a qualquer momento.
  * **Listagem 1 — Fila de Pedidos (Aguardando Atendimento):** Apresenta apenas pedidos com status `PENDENTE`, ordenados do mais antigo para o mais recente (FIFO) pelo campo `data_hora`. Cada item possui botões **Aceitar** e **Rejeitar**, que enviam a alteração de status em tempo real via `PUT /api/bilhetinhos/{id}/status`.
  * **Listagem 2 — Histórico de Pedidos Atendidos & Rejeitados:** Apresenta os pedidos finalizados com destaque visual, agrupando os pedidos `ACEITO` seguidos pelos `REJEITADO`, ordenados por horário.
  * **Atualização em Tempo Real:** Botão manual de recarregar e atualização instantânea de contadores e listas após qualquer ação.
* **Cadastro de Novo Show com ViaCEP:**
  * Modal com formulário para informações da apresentação (nome, data/hora, estabelecimento).
  * **Busca Automática de CEP:** Ao digitar 8 dígitos numéricos (ou clicar na lupa), consome a rota `/api/enderecos/cep/{cep}` e preenche automaticamente logradouro, bairro, cidade e UF.
* **Limpeza Automática de Formulários:** Ciclo de vida robusto que zera completamente todos os campos, estados de validação e textos informativos ao abrir o modal, ao fechar (botão fechar, cancelar, tecla ESC ou clique fora) e logo após o cadastro com sucesso do evento.
* **Navegação de Retorno:** Botão no topo para retorno à página inicial de shows ativos (`index.html`).

### 3. Área de Envio do Bilhetinho (`bilhetinho.html` + `js/bilhetinho.js`)

* **Propósito:** Interface *mobile-first* voltada para o público no bar/restaurante enviar pedidos de música para a apresentação ao vivo.
* **Acesso e Localização do Show:**
  * **Via Código / Área de Transferência:** Campo para digitar ou colar o UUID do evento lido do QR Code (ou copiado na página inicial).
  * **Via URL Direta (QR Code):** Ao escanear o QR Code que contém o parâmetro `?evento=<UUID>`, a página reconhece o código na URL e carrega os dados do show instantaneamente.
* **Validação de Status:** Se o show estiver marcado como `ENCERRADO`, a tela exibe um aviso e bloqueia novos envios de bilhetinhos.
* **Formulário de Envio do Bilhetinho:**
  * **Música e Artista (Obrigatórios):** Integração com a **iTunes Search API** (detalhada na seção de APIs externas). O usuário pode escolher uma das sugestões ou preencher os campos manualmente.
  * **Nome do Solicitante (Opcional):** Caso deixado em branco, o front-end envia o valor padrão `"Anônimo"`.
  * **Mensagem / Recado (Opcional):** Campo para dedicatórias ou observações para o músico (até 255 caracteres).
* **Tela de Sucesso e Feedback:** Confirmação visual informando que o bilhetinho foi entregue na fila do artista, com resumo do pedido e botão para pedir outra música.
* **Botão "Acessar outro show":** Tanto no formulário quanto na tela de confirmação, redireciona o usuário de volta à página inicial (`index.html`).

---

## Integração com APIs

### 1. Consumo de API Externa Pública — iTunes Search API (Apple)

Em conformidade com os critérios avaliativos de consumo de API externa do MVP, o front-end integra-se diretamente à **iTunes Search API**:

* **Endpoint Consumido:** `https://itunes.apple.com/search?term={termo}&entity=song&limit=15`
* **Módulo Implementado:** [`js/api/itunes.js`](js/api/itunes.js)
* **Diretrizes e Regras de Negócio do Projeto:**
  * **Exibição Estrita de Texto:** Apresenta apenas o **Nome da Faixa** e o **Nome do Artista** (sem inclusão de player de áudio e sem exibição de capas de álbum).
  * **Deduplicação Inteligente:** Filtra faixas idênticas do mesmo artista presentes em múltiplos álbuns (estúdio, ao vivo, coletâneas), assegurando que o dropdown de sugestões não apresente itens duplicados.
  * **Debounce de Digitação:** Temporizador de 300ms para evitar chamadas excessivas e garantir economia de requisições.

### 2. Consumo de API Externa — ViaCEP (via Back-End)

* **Finalidade:** Agilizar o preenchimento de endereço físico no cadastro de shows do músico.
* **Fluxo:** O front-end envia o CEP digitado para a rota `/api/enderecos/cep/{cep}` da `bilhetinho-api`, que atua como proxy normalizador consumindo o Web Service do [ViaCEP](https://viacep.com.br/).

### 3. Integração com a API Própria (`bilhetinho-api` na porta 8080)

A comunicação é encapsulada na pasta modular [`js/api/`](js/api/), com tratamento padronizado de erros e respostas JSON:

| Módulo | Endpoint / Rota | Descrição da Operação |
| --- | --- | --- |
| [`musicos.js`](js/api/musicos.js) | `GET /api/musicos/email/{email}` | Consulta músico para login direto |
| [`musicos.js`](js/api/musicos.js) | `POST /api/musicos` | Cadastro de novo perfil artístico |
| [`eventos.js`](js/api/eventos.js) | `GET /api/eventos` | Lista todos os shows com status `ATIVO` |
| [`eventos.js`](js/api/eventos.js) | `GET /api/eventos/musico/{id}` | Lista shows de um músico específico |
| [`eventos.js`](js/api/eventos.js) | `GET /api/eventos/codigo/{uuid}` | Localiza apresentação pelo código do QR Code |
| [`eventos.js`](js/api/eventos.js) | `POST /api/eventos` | Cria novo evento com endereço integrado |
| [`enderecos.js`](js/api/enderecos.js) | `GET /api/enderecos/cep/{cep}` | Consulta dados de endereço por CEP |
| [`bilhetinhos.js`](js/api/bilhetinhos.js) | `POST /api/bilhetinhos` | Envia pedido de música para o show ativo |
| [`bilhetinhos.js`](js/api/bilhetinhos.js) | `GET /api/bilhetinhos/evento/{eventoId}` | Lista a fila e o histórico de pedidos do show |
| [`bilhetinhos.js`](js/api/bilhetinhos.js) | `PUT /api/bilhetinhos/{id}/status` | Atualiza o status do pedido (`ACEITO`, `REJEITADO`) |

---

## Estrutura de Arquivos e Diretórios

```text
bilhetinho-ui/
├── index.html              # Página Inicial (Vitrine de Shows Ativos)
├── musico.html             # Área do Músico (Login, Cadastro e Gestão de Shows)
├── bilhetinho.html         # Área de Envio do Bilhetinho (Mobile-First / QR Code)
├── css/
│   └── style.css           # Estilos personalizados, gradientes e autocomplete
├── js/
│   ├── app.js              # Controlador da Página Inicial (Shows Ativos)
│   ├── musico.js           # Controlador da Área do Músico
│   ├── bilhetinho.js       # Controlador da Área de Envio de Bilhetinhos
│   └── api/                # Serviços modulares de comunicação REST (Fetch API)
│       ├── client.js       # Wrapper HTTP base com captura de status e erros
│       ├── musicos.js      # Operações de Músicos
│       ├── eventos.js      # Operações de Eventos e Shows
│       ├── enderecos.js    # Consulta de endereços via ViaCEP
│       ├── bilhetinhos.js  # Envio de pedidos e consulta de fila
│       └── itunes.js       # Integração direta com iTunes Search API
├── .gitignore              # Configuração de arquivos ignorados pelo Git
└── README.md               # Documentação técnica e operacional do front-end
```

---

## Tecnologias e Bibliotecas

* **HTML5:** Estruturação semântica, formulários acessíveis e suporte a viewport responsivo.
* **Vanilla JavaScript (ES6+):** Código modular baseado em ES Modules (`import`/`export`), assincronismo com `async/await`, Fetch API e manipulação eficiente do DOM.
* **Bootstrap 5.3 (Dark Mode):** Framework visual moderno configurado com tema escuro nativo (`data-bs-theme="dark"`), modais, componentes de grid e toasts de notificação.
* **Bootstrap Icons 1.11:** Biblioteca de ícones vetoriais em formato SVG/fonte.
* **Apple iTunes Search API:** API externa de busca de faixas musicais e artistas.
* **ViaCEP:** Web Service brasileiro de endereçamento postal por CEP.

---

## Como Executar Localmente

### Pré-requisitos

* A API do back-end (`bilhetinho-api`) deve estar em execução na porta `8080` (consulte a documentação em `bilhetinho-api/README.md`).
* Um servidor web para servir arquivos estáticos locais (necessário para que o navegador processe ES Modules sem bloqueios de CORS por protocolo `file://`).

### Passos para Execução

1. **Abra o terminal no diretório do front-end:**

   ```bash
   cd MVP/bilhetinho-webgui/bilhetinho-ui
   ```

2. **Inicie o servidor estático (usando o utilitário `serve` via npx):**

   ```bash
   npx -y serve -p 3000
   ```

   *(Ou utilize qualquer servidor estático de sua preferência, como a extensão Live Server do VS Code ou `python -m http.server 3000`)*.

3. **Acesse as páginas no navegador:**
   * **Página Inicial (Shows Ativos):** [http://localhost:3000](http://localhost:3000) (ou `http://localhost:3000/index.html`)
   * **Área do Músico (Palco & Gestão):** [http://localhost:3000/musico.html](http://localhost:3000/musico.html)
   * **Envio de Bilhetinho (Público):** [http://localhost:3000/bilhetinho.html](http://localhost:3000/bilhetinho.html)

---

## Execução via Docker

O módulo de interface possui containerização completa com **Nginx 1.27 Alpine**, configurado especialmente para servir os módulos ES6 com os tipos MIME adequados (`application/javascript`) e roteamento SPA.

### Construindo e Executando a Interface Web

1. **Construa a imagem Docker na raiz de `bilhetinho-ui`:**

   ```bash
   docker build -t bilhetinho-ui .
   ```

2. **Execute o container mapeando a porta 3000:**

   ```bash
   docker run -d -p 3000:80 --name bilhetinho-ui bilhetinho-ui
   ```

3. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

> [!TIP]
> Para executar a solução completa e integrada (Banco de Dados PostgreSQL + API Spring Boot + Interface Web Nginx) com um único comando, utilize o arquivo `docker-compose.yml` na raiz do repositório orquestrador **`bilhetinho-webgui`**:
>
> ```bash
> cd ../
> docker compose up --build
> ```
