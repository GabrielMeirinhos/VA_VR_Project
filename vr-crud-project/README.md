# Projeto CRUD em Realidade Virtual (VR)

Este é um projeto de CRUD (Create, Read, Update, Delete) integrado a um ambiente 3D interativo usando **A-Frame** e um backend simulado com **JSON Server**.

Os objetos criados são renderizados na cena 3D, e interações via UI ou cliques nos objetos atualizam o banco de dados em tempo real.

## 📋 Pré-requisitos

- **Node.js**: Para rodar o servidor JSON.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para iniciar a aplicação.

### 1. Instalar o JSON Server

Se ainda não tiver o `json-server` instalado globalmente, execute:

```bash
npm install -g json-server@0.17.4
```

### 2. Iniciar a API Simulada

No terminal, navegue até a pasta do projeto `vr-crud-project` e inicie o servidor observando o arquivo `db.json`:

```bash
cd vr-crud-project
json-server --watch db.json --port 3000
```

Isso criará uma API REST em `http://localhost:3000/items`.

### 3. Rodar a Aplicação

Abra o arquivo `index.html` usando um Servidor Local (Live Server no VS Code).

O projeto não usa `npm start` pois o arquivo `package.json` foi removido para conformidade com as restrições.

### 3. Rodar a Aplicação

Como o projeto utiliza ES Modules e Fetch API, é recomendado rodar através de um servidor local simples (como o Live Server do VS Code) para evitar erros de CORS ou políticas de segurança de arquivo local `file://`.

**Usando VS Code:**
1. Instale a extensão "Live Server".
2. Clique com o botão direito em `index.html`.
3. Escolha "Open with Live Server".

A aplicação abrirá no seu navegador.

## 🎮 Como Usar

### Interação (Gaze & Controls)
- **Cursor de Mão (✋)**: O cursor central interage automaticamente com objetos e botões ao olhar para eles por **0.3 segundos**.
- **Movimentação da Câmera**:
  - **W, A, S, D**: Mover-se pelo cenário.
  - **Espaço**: Subir (Voar).
  - **Shift**: Descer.
- **Segurar Objetos**:
  - Selecione um objeto (olhe para ele).
  - Olhe para o botão **"MOVER"**.
  - O objeto será atraído para sua "mão" (posição do cursor) e ficará preso a você.
- **Soltar Objetos**:
  - Pressione a tecla **Q** para soltar o objeto que está segurando.
  - A física (gravidade) será ativada e o objeto cairá realisticamente no chão.

### Operações CRUD (Botões 3D)

O painel de controle flutuante permite gerenciar os objetos:

1.  **CRIAR (Create)**:
    - Gera um novo cubo com cor aleatória em uma posição aleatória.
    - O objeto nasce com física e cai no chão.
2.  **COR (Update)**:
    - Altera a cor e o nome do objeto selecionado.
3.  **MOVER (Move)**:
    - "Pega" o objeto selecionado. O objeto perde a física temporariamente e segue a sua câmera.
4.  **DELETAR (Delete)**:
    - Remove o objeto selecionado da cena e do banco de dados.
5.  **LISTAR (List)**:
    - Organiza **todos** os objetos da cena em uma pilha ordenada (torre) na frente do container.
    - Salva automaticamente a nova organização no banco de dados.

## 🛠 Tecnologias

- **A-Frame**: Framework WebVR para criar cenas 3D com HTML.
- **A-Frame Physics System**: Motor de física para gravidade e colisões.
- **AR.js**: Suporte para Realidade Aumentada.
- **JavaScript (Vanilla)**: Lógica de frontend e manipulação do DOM.
- **Fetch API**: Comunicação HTTP com o backend.
- **JSON Server**: Simulação de API REST completa.

## 📂 Arquivos

*   `index.html`: Cena VR com física e controles completos.
*   `ar.html`: Versão para Realidade Aumentada (Marker-based Hiro).
*   `script.js`: Toda a lógica da aplicação (CRUD, Física, Movimentação, Gaze).
*   `db.json`: Banco de dados dos objetos.
*   `style.css`: Estilos globais simples.


