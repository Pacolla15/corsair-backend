# Documentacao da API REST - Gerenciamento de Perifericos Corsair

Esta documentacao detalha os endpoints, estruturas de requisicao, respostas esperadas e exemplos praticos de consumo da API.

## 1. URL Base
- Ambiente Local: `http://localhost:3000`
- Ambiente de Producao (Vercel): A definir apos implantacao (definido via variavel de ambiente ou URL da Vercel).

## 2. Configuracao Local

### Pre-requisitos
- Node.js (versao 18 ou superior)
- Gerenciador de pacotes npm
- Instancia MongoDB acessivel (MongoDB Atlas ou local)

### Passos para Execucao
1. Clonar o repositorio e acessar o diretorio raiz.
2. Instalar as dependencias necessarias:
   ```bash
   npm install
   ```
3. Criar o arquivo `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configurar a variavel `MONGODB_URI` no arquivo `.env`:
   - Para teste local imediato sem necessidade de MongoDB Atlas: use `MONGODB_URI=memory`
   - Para cluster externo: use sua connection string do MongoDB Atlas (ex: `mongodb+srv://...`)
5. Iniciar o servidor da API:
   - Modo com banco em memoria (pronto para teste local):
     ```bash
     npm run dev:memory
     ```
   - Modo padrao:
     ```bash
     npm run dev:api
     ```
6. O servidor estara disponivel em `http://localhost:3000`.

## 3. Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria | Padrao |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | URI de conexao com o MongoDB ou "memory" para banco embutido | Sim | - |
| `PORT` | Porta TCP para o servidor HTTP local | Nao | 3000 |
| `CORS_ORIGIN` | Origem autorizada para requisicoes CORS | Nao | * |
| `NODE_ENV` | Identificador do ambiente (development, test, production) | Nao | development |

## 4. Endpoints

### 4.1. Listar Perifericos
- Metodo: `GET`
- Caminho: `/api/perifericos`
- Descricao: Retorna todos os perifericos cadastrados ordenados pelos mais recentes.

#### Resposta de Sucesso (HTTP 200 OK)
```json
{
  "data": [
    {
      "_id": "651f1c9d2f8b2a001c8e4d1a",
      "marca": "Corsair",
      "modelo": "K70 RGB PRO",
      "preco": 899.90,
      "foto": "https://images.corsair.com/example-k70.jpg",
      "createdAt": "2026-10-12T10:00:00.000Z",
      "updatedAt": "2026-10-12T10:00:00.000Z"
    }
  ]
}
```

#### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/api/perifericos
```

---

### 4.2. Obter Periferico por ID
- Metodo: `GET`
- Caminho: `/api/perifericos/:id`
- Descricao: Retorna os detalhes de um periferico especifico.

#### Parametros de Rota
- `id` (string): Identificador unico (ObjectId) do periferico.

#### Resposta de Sucesso (HTTP 200 OK)
```json
{
  "data": {
    "_id": "651f1c9d2f8b2a001c8e4d1a",
    "marca": "Corsair",
    "modelo": "K70 RGB PRO",
    "preco": 899.90,
    "foto": "https://images.corsair.com/example-k70.jpg",
    "createdAt": "2026-10-12T10:00:00.000Z",
    "updatedAt": "2026-10-12T10:00:00.000Z"
  }
}
```

#### Respostas de Erro
- HTTP 400 Bad Request: ID invalido.
```json
{
  "error": "Identificador invalido"
}
```
- HTTP 404 Not Found: Periferico nao encontrado.
```json
{
  "error": "Periferico nao encontrado"
}
```

#### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/api/perifericos/651f1c9d2f8b2a001c8e4d1a
```

---

### 4.3. Cadastrar Periferico
- Metodo: `POST`
- Caminho: `/api/perifericos`
- Descricao: Cadastra um novo periferico Corsair.

#### Headers
- `Content-Type: application/json`

#### Corpo da Requisicao (JSON)
```json
{
  "marca": "Corsair",
  "modelo": "K70 RGB PRO",
  "preco": 899.90,
  "foto": "https://images.corsair.com/example-k70.jpg"
}
```

#### Regras de Validacao
- `marca`: Obrigatorio, deve ser "Corsair".
- `modelo`: Obrigatorio, string nao vazia.
- `preco`: Obrigatorio, valor numerico maior ou igual a zero.
- `foto`: Obrigatorio, string representando URL valida (http ou https).

#### Resposta de Sucesso (HTTP 201 Created)
```json
{
  "data": {
    "_id": "651f1c9d2f8b2a001c8e4d1a",
    "marca": "Corsair",
    "modelo": "K70 RGB PRO",
    "preco": 899.90,
    "foto": "https://images.corsair.com/example-k70.jpg",
    "createdAt": "2026-10-12T10:00:00.000Z",
    "updatedAt": "2026-10-12T10:00:00.000Z"
  }
}
```

#### Respostas de Erro
- HTTP 400 Bad Request: Dados invalidos ou ausentes.
```json
{
  "error": "Modelo e obrigatorio"
}
```

#### Exemplo com cURL
```bash
curl -X POST http://localhost:3000/api/perifericos \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Corsair",
    "modelo": "K70 RGB PRO",
    "preco": 899.90,
    "foto": "https://images.corsair.com/example-k70.jpg"
  }'
```

---

### 4.4. Atualizar Periferico
- Metodo: `PUT`
- Caminho: `/api/perifericos/:id`
- Descricao: Atualiza as informacoes de um periferico existente.

#### Parametros de Rota
- `id` (string): Identificador unico (ObjectId) do periferico.

#### Corpo da Requisicao (JSON)
```json
{
  "marca": "Corsair",
  "modelo": "K70 RGB PRO Wireless",
  "preco": 1099.90,
  "foto": "https://images.corsair.com/example-k70-wireless.jpg"
}
```

#### Resposta de Sucesso (HTTP 200 OK)
```json
{
  "data": {
    "_id": "651f1c9d2f8b2a001c8e4d1a",
    "marca": "Corsair",
    "modelo": "K70 RGB PRO Wireless",
    "preco": 1099.90,
    "foto": "https://images.corsair.com/example-k70-wireless.jpg",
    "createdAt": "2026-10-12T10:00:00.000Z",
    "updatedAt": "2026-10-12T10:05:00.000Z"
  }
}
```

#### Respostas de Erro
- HTTP 400 Bad Request: Identificador ou campos invalidos.
- HTTP 404 Not Found: Periferico nao localizado para atualizacao.

#### Exemplo com cURL
```bash
curl -X PUT http://localhost:3000/api/perifericos/651f1c9d2f8b2a001c8e4d1a \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Corsair",
    "modelo": "K70 RGB PRO Wireless",
    "preco": 1099.90,
    "foto": "https://images.corsair.com/example-k70-wireless.jpg"
  }'
```

---

### 4.5. Excluir Periferico
- Metodo: `DELETE`
- Caminho: `/api/perifericos/:id`
- Descricao: Remove permanentemente um periferico cadastrado.

#### Parametros de Rota
- `id` (string): Identificador unico (ObjectId) do periferico.

#### Resposta de Sucesso (HTTP 204 No Content)
Corpo vazio.

#### Respostas de Erro
- HTTP 400 Bad Request: Identificador invalido.
- HTTP 404 Not Found: Periferico nao localizado para exclusao.

#### Exemplo com cURL
```bash
curl -X DELETE http://localhost:3000/api/perifericos/651f1c9d2f8b2a001c8e4d1a
```

---

## 5. Codigos de Retorno Padronizados

| Codigo | Significado | Situacao |
| :--- | :--- | :--- |
| `200 OK` | Requisicao atendida com sucesso | Consultas e atualizacoes bem-sucedidas |
| `201 Created` | Recurso criado com sucesso | Cadastro de periferico realizado |
| `204 No Content` | Sucesso sem conteudo no corpo | Remocao realizada com sucesso |
| `400 Bad Request` | Parametros ou corpo invalidos | Falha nas validacoes de regras de negocio |
| `404 Not Found` | Recurso nao encontrado | Identificador inexistente no banco de dados |
| `500 Internal Server Error` | Erro interno do servidor | Falha de infraestrutura ou comunicacao com banco |

---

## 6. Execucao do Frontend e Testes Locais

### 6.1. Executando o Frontend Localmente
Para servir os arquivos estaticos do frontend em porta dedicada (`http://localhost:5000`):
```bash
npm run dev:front
```
Acesse no navegador:
```
http://localhost:5000
```

### 6.2. Executando os Testes Automatizados
O projeto utiliza o test runner nativo do Node.js integrado com `supertest` e `mongodb-memory-server` para isolamento total:
```bash
npm test
```
Todas as suítes (database, integracao da API, integridade do frontend, fluxo ponta a ponta e smoke tests) serao executadas.

---

## 7. Preparacao e Deploy na Vercel

### 7.1. Arquitetura Serverless
A API foi projetada para execucao serverless:
- O arquivo `vercel.json` roteia todas as chamadas `/api/(.*)` para `api/index.js`.
- O modulo `api/config/database.js` mantem cache de conexao do Mongoose para reutilizacao eficiente entre invocacoes concorrentes.
- O aplicativo Express e exportado diretamente via `module.exports = app`.

### 7.2. Configuracao de Variaveis de Ambiente na Vercel
Ao importar o repositorio na Vercel, defina as seguintes variaveis de ambiente:
- `MONGODB_URI`: String de conexao com o cluster MongoDB (ex: MongoDB Atlas).
- `CORS_ORIGIN`: URL do frontend em producao ou `*`.
- `NODE_ENV`: `production`.

### 7.3. URL de Producao
URL de producao:
*(Apos a realizacao do deploy atraves do painel ou CLI da Vercel, a URL real gerada devera ser registrada aqui, por exemplo: `https://seu-projeto.vercel.app/api/perifericos`)*
