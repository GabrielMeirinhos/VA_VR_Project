Instruction – Projeto CRUD em VR/AR com A-Frame + AR.js

Você é um engenheiro especialista em WebXR, A-Frame.js, AR.js e JavaScript.

Sua tarefa é criar um projeto de CRUD em Realidade Virtual e Realidade Aumentada, com interação por gaze (olhar fixo) e botões 3D dentro da cena.

⚠️ RESTRIÇÃO IMPORTANTE DE ARQUIVOS

Você DEVE criar e utilizar SOMENTE os seguintes arquivos:

index.html
ar.html
script.js
style.css
db.json
README.md

Não crie nenhum outro arquivo além desses, a menos que seja explicitamente solicitado.

Estrutura obrigatória do projeto
project/
│
├── index.html
├── ar.html
├── script.js
├── style.css
├── db.json
└── README.md
Tecnologias obrigatórias

Utilizar obrigatoriamente:

JavaScript

A-Frame.js

AR.js

Fetch API

JSON Server

Banco de dados

Arquivo:

db.json

Estrutura mínima:

{
  "items": []
}

Cada item deve possuir:

id
name
color
position

Exemplo:

{
  "items": [
    {
      "id": 1,
      "name": "Objeto 1",
      "color": "red",
      "position": "0 1 -3"
    }
  ]
}
API simulada

O projeto deve funcionar com JSON Server.

Instalação:

npm i -g json-server@0.17.4

Rodar:

json-server --watch db.json --port 3000

Endpoint:

http://localhost:3000/items
Lógica do CRUD

Toda lógica deve estar em:

script.js

Usar Fetch API.

Create
POST /items

Criar novo objeto e renderizar na cena.

Read
GET /items

Carregar todos os objetos e renderizar automaticamente.

Update
PUT ou PATCH /items/:id

Alterar propriedades do objeto (cor, nome ou posição).

Delete
DELETE /items/:id

Remover objeto da cena e do banco.

Interface em 3D

O CRUD não deve ser feito com botões HTML comuns.

Os botões devem ser objetos 3D dentro da cena A-Frame.

Criar pelo menos estes botões 3D:

Create
List
Update
Delete

Exemplo de objeto botão:

a-box
a-cylinder
a-plane

Cada botão deve possuir:

class="crud-button"

e um atributo:

data-action="create"
data-action="read"
data-action="update"
data-action="delete"
Cursor central (Gaze Cursor)

Criar um ponto fixo no centro da tela representando o olhar do usuário.

Este ponto deve funcionar como cursor de gaze.

Exemplo visual:

um pequeno círculo branco no centro da tela

Ele deve permanecer fixo no centro da câmera.

Sistema de ativação por olhar

Implementar um sistema de gaze interaction:

Quando o cursor central estiver apontando para um botão 3D:

iniciar um temporizador

se permanecer 5 segundos focado no botão

executar automaticamente a ação do botão

Ou seja:

olhar fixo = clique automático
Comportamento esperado

Se o usuário olhar para:

Botão CREATE

Após 5 segundos:

criar novo item

enviar POST

renderizar objeto na cena

Botão READ

Após 5 segundos:

listar todos os objetos da API

renderizar na cena

Botão UPDATE

Após 5 segundos:

alterar propriedades de um objeto existente

enviar PUT/PATCH

atualizar visualmente

Botão DELETE

Após 5 segundos:

remover objeto

enviar DELETE

remover da cena

index.html

Deve conter:

Cena VR completa

câmera

iluminação

chão

botões 3D

cursor central

objetos do CRUD

Interação com mouse e gaze.

ar.html

Deve conter:

Cena AR utilizando AR.js com:

marker Hiro

Os objetos do CRUD devem aparecer ancorados ao marcador.

Compatível com:

mobile
webcam
script.js

Responsável por:

comunicação com API

renderização de objetos

criação de botões

sistema de gaze

controle de temporizador de 5 segundos

atualização dinâmica da cena

Este arquivo deve funcionar tanto para VR quanto para AR.

style.css

Responsável por:

HUD

cursor central

possíveis indicadores de carregamento

estilo geral da interface

README.md

Deve conter:

1️⃣ descrição do projeto
2️⃣ tecnologias utilizadas
3️⃣ como instalar o JSON Server
4️⃣ como rodar o backend
5️⃣ como abrir VR
6️⃣ como abrir AR
7️⃣ explicação do sistema de gaze (5 segundos)

Requisitos importantes

✔ Todos os botões devem ser 3D
✔ O cursor central deve sempre ficar visível
✔ A ativação deve ocorrer após 5 segundos olhando
✔ CRUD funcional com Fetch API
✔ Cena atualiza automaticamente após mudanças
✔ Código bem organizado e comentado