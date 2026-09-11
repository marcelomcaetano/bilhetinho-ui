# Bilhetinho — UI

> MVP desenvolvido para a disciplina de **Engenharia de Software**  
> Pós-Graduação em Engenharia de Software — PUC-Rio

---

## Autor

Marcelo M. Caetano  
[https://www.linkedin.com/in/marcelomcaetano/](https://www.linkedin.com/in/marcelomcaetano/)  

---

## Visão Geral da Aplicação

O **Bilhetinho UI** é o módulo de **Interface com o Usuário (Front-End)** do sistema Bilhetinho. Desenvolvido com **Vanilla JavaScript (ES6 Modules)**, **HTML5** e **Bootstrap 5.3 Dark Mode**, entrega uma experiência ágil, responsiva e moderna com separação limpa de contextos:

### 1. Área do Músico (`index.html` + `js/app.js`)
* **Identificação / Login direto por e-mail:** Com persistência de sessão via `localStorage` e redirecionamento para cadastro de novo perfil caso não localizado.
* **Gestão de Shows:** Listagem dos eventos do artista com status visual, data formatada, endereço completo e código UUID do evento com botão de cópia com um clique.
* **Cadastro de Show:** Modal integrado à API pública do **ViaCEP** com busca automática de endereço por CEP de 8 dígitos e preenchimento dos campos de logradouro, bairro, cidade e UF.
* **Limpeza Automática:** Ciclo de vida robusto com reset completo dos campos em qualquer abertura, fechamento ou após conclusão com sucesso de cadastro.

### 2. Área de Envio do Bilhetinho (`bilhetinho.html` + `js/bilhetinho.js`)
* **Experiência Mobile-First:** Projetada especificamente para acesso rápido pelo público presente no show.
* **Localização do Evento:** Acesso via digitação/cola do código UUID ou leitura direta de QR Code (`/bilhetinho.html?evento=<UUID>`).
* **Integração com iTunes Search API (`js/api/itunes.js`):**
  * Sugestões em tempo real conforme o usuário digita (debounce de 300ms).
  * Exibição estrita apenas de **Nome da Faixa** e **Nome do Artista** (sem player e sem capa de álbum).
  * Algoritmo de **deduplicação inteligente** para músicas de mesmo título e artista.
* **Envio de Pedidos:** Campo de solicitante opcional (default `"Anônimo"`), mensagem/recado opcional para o artista e tela de confirmação imediata.

---

## Estrutura do Projeto

```text
bilhetinho-ui/
├── index.html              # Área do Músico (Login e Gestão de Shows)
├── bilhetinho.html         # Área de Envio do Bilhetinho (Mobile-First / QR Code)
├── css/
│   └── style.css           # Tema Dark, gradientes e estilos do autocomplete
└── js/
    ├── app.js              # Lógica de interface da Área do Músico
    ├── bilhetinho.js       # Lógica de interface da Área de Pedidos
    └── api/                # Serviços modulares de comunicação REST
        ├── client.js       # Wrapper HTTP base para a API (porta 8080)
        ├── musicos.js      # Operações de Músicos
        ├── eventos.js      # Operações de Eventos / Shows
        ├── enderecos.js    # Consulta de endereços / ViaCEP
        ├── bilhetinhos.js  # Envio e gestão de Bilhetinhos
        └── itunes.js       # Integração com a iTunes Search API
```

---

## Como Executar Localmente

O front-end é uma aplicação estática modular baseada em ES6 Modules, necessitando apenas de um servidor web estático:

```bash
# A partir da pasta do front-end:
npx -y serve -p 3000
```

Acesse no navegador:
* **Área do Músico:** [http://localhost:3000](http://localhost:3000) (ou `/index.html`)
* **Envio de Bilhetinho:** [http://localhost:3000/bilhetinho.html](http://localhost:3000/bilhetinho.html)
