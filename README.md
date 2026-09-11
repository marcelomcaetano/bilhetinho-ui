# Bilhetinho — UI

> MVP desenvolvido para a disciplina de **Engenharia de Software**  
> Pós-Graduação em Engenharia de Software — PUC-Rio

---

## Autor

Marcelo M. Caetano  
[https://www.linkedin.com/in/marcelomcaetano/](https://www.linkedin.com/in/marcelomcaetano/)  

---

## Visão Geral da Aplicação

O **Bilhetinho UI** é o módulo de **Interface com o Usuário (Front-End)** do sistema Bilhetinho. Desenvolvido com **Vanilla JavaScript (ES6 Modules)**, **HTML5** e **Bootstrap 5.3 Dark Mode**, entrega uma experiência ágil, responsiva e moderna com separação clara de contextos por papéis e páginas dedicadas:

### 1. Página Inicial — Shows Ativos (`index.html` + `js/app.js`)
* **Barra de Navegação:** Logotipo do sistema no canto esquerdo e botão de navegação direta para a **Área do Músico** no canto direito.
* **Vitrine de Shows ao Vivo:** Apresenta todos os eventos com status `ATIVO` cadastrados no banco de dados (consumindo a rota `GET /api/eventos`).
* **Cards Informativos:** Exibição detalhada com nome do show, músico/artista participante, local, data/hora formatada no padrão brasileiro, endereço completo e badge de status ativo.
* **Ação "Acessar Show":** Cada card possui um botão de ação rápida que copia automaticamente o código UUID do evento para a área de transferência do usuário e o redireciona diretamente para a página de pedidos (`bilhetinho.html`).
* **Recarregamento Dinâmico:** Botão para atualizar a listagem e estado vazio (*empty state*) caso não haja apresentações ativas no momento.

### 2. Área do Músico — Palco & Gestão (`musico.html` + `js/musico.js`)
* **Identificação / Login por E-mail:** Autenticação simplificada por e-mail com persistência de sessão via `localStorage` (`bilhetinho_musico_ativo`). Redireciona automaticamente para a tela de cadastro caso o e-mail não exista na base de dados.
* **Painel do Músico:** Cabeçalho com dados do artista (nome, e-mail e estilo musical) e botão de desconexão seguro (`Sair`).
* **Gestão de Apresentações:** Listagem dinâmica dos eventos cadastrados do próprio músico logado (`GET /api/eventos/musico/{id}`).
* **Cadastro de Show com ViaCEP:** Modal integrado à API pública do **ViaCEP** com busca automática de endereço por CEP de 8 dígitos e preenchimento instantâneo de logradouro, bairro, cidade e UF.
* **Ciclo de Vida e Limpeza Automática:** Função de reset robusta que zera todos os campos e feedbacks em qualquer evento de abertura, cancelamento, fechamento ou após a conclusão com sucesso do cadastro do show.
* **Navegação Integrada:** Botão *"Shows Ativos"* no topo permitindo alternar de volta à página inicial a qualquer momento.

### 3. Área de Envio do Bilhetinho (`bilhetinho.html` + `js/bilhetinho.js`)
* **Experiência Mobile-First:** Interface focada e otimizada para smartphones e dispositivos móveis para o público presente no bar/show.
* **Localização do Evento:** 
  * Campo para digitar ou colar o código do show (UUID) lido a partir do QR Code.
  * Suporte nativo a acesso direto via leitura de QR Code através de parâmetros na URL (`/bilhetinho.html?evento=<UUID>`), carregando o show instantaneamente.
  * Bloqueio automático com aviso caso o show esteja com status `ENCERRADO`.
* **Integração com iTunes Search API (`js/api/itunes.js`):**
  * Busca de músicas em tempo real conforme o usuário digita (debounce de 300ms).
  * Exibição estrita apenas de **Nome da Faixa** e **Nome do Artista** (sem player de áudio e sem capas de álbum).
  * Algoritmo de **deduplicação inteligente** para evitar faixas repetidas do mesmo artista (coletâneas, ao vivo, etc.).
  * Seleção com um toque para preenchimento dos campos estruturados de música e artista.
* **Envio do Bilhetinho:** 
  * Nome do solicitante opcional (preenchimento automático como `"Anônimo"` caso não informado).
  * Mensagem/recado opcional para o artista (até 255 caracteres).
  * Disparo para `POST /api/bilhetinhos` e tela de confirmação de entrega com detalhes do pedido.
* **Navegação de Retorno:** Botão *"Acessar outro show"* que redireciona de volta à página inicial (`index.html`) para consulta da grade de eventos.

---

## Estrutura de Arquivos

```text
bilhetinho-ui/
├── index.html              # Página Inicial (Grade de Shows Ativos)
├── musico.html             # Área do Músico (Login, Perfil e Gestão de Shows)
├── bilhetinho.html         # Área de Envio do Bilhetinho (Mobile-First / QR Code)
├── css/
│   └── style.css           # Tema Dark, gradientes e estilos do autocomplete
└── js/
    ├── app.js              # Lógica da Página Inicial de Shows Ativos
    ├── musico.js           # Lógica da Área e Painel do Músico
    ├── bilhetinho.js       # Lógica da Área de Envio de Pedidos
    └── api/                # Camada modular de comunicação REST
        ├── client.js       # Wrapper Fetch base com tratamento de erros
        ├── musicos.js      # Integração com /api/musicos
        ├── eventos.js      # Integração com /api/eventos
        ├── enderecos.js    # Integração com /api/enderecos (ViaCEP)
        ├── bilhetinhos.js  # Integração com /api/bilhetinhos
        └── itunes.js       # Integração com a iTunes Search API
```

---

## Tecnologias Empregadas

* **HTML5 Semântico:** Estrutura acessível com metatags e viewport responsivo.
* **Vanilla JavaScript (ES6+):** Módulos nativos (`import`/`export`), sem necessidade de bundlers ou frameworks pesados.
* **Bootstrap 5.3:** Framework CSS com tema escuro nativo (`data-bs-theme="dark"`), sistema de grid e componentes modais/toasts.
* **Bootstrap Icons:** Biblioteca oficial de ícones vetoriais.
* **APIs Externas Integradas:**
  * **ViaCEP:** Preenchimento automático de logradouros a partir de CEP de 8 dígitos.
  * **iTunes Search API:** Sugestões e autocompletes de músicas e artistas em tempo real.

---

## Como Executar Localmente

Como a aplicação é estática e modular baseada em ES6 Modules, utilize qualquer servidor web estático local:

```bash
# A partir do diretório do front-end:
npx -y serve -p 3000
```

Rotas disponíveis no navegador:
* **Página Inicial (Shows Ativos):** [http://localhost:3000](http://localhost:3000) (ou `/index.html`)
* **Área do Músico:** [http://localhost:3000/musico.html](http://localhost:3000/musico.html)
* **Envio de Bilhetinho:** [http://localhost:3000/bilhetinho.html](http://localhost:3000/bilhetinho.html)
