# API de Gerenciamento de Perifericos Corsair

API REST desenvolvida em Node.js e MongoDB para cadastro, consulta, edicao e remocao de perifericos da Corsair. Estruturada para execucao local e deploy serverless na Vercel.

## 1. Stack Tecnologica
- Node.js (v18+)
- Express.js
- MongoDB / Mongoose (com cache de conexao serverless)
- Dotenv e CORS
- Node.js Test Runner (node:test, node:assert), Supertest e mongodb-memory-server

## 2. Estrutura de Arquivos do Repositorio
```
/
  .env.example
  .gitignore
  README.md
  api.md
  package.json
  vercel.json
  api/
    config/
      database.js
    controllers/
      perifericoController.js
    models/
      Periferico.js
    routes/
      perifericoRoutes.js
    index.js
    server.js
  scripts/
    dev-memory.js
  tests/
    database.test.js
    perifericos.test.js
```

## 3. Instalacao e Execucao Local

### 3.1. Instalar Dependencias
```bash
npm install
```

### 3.2. Variaveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
```bash
cp .env.example .env
```

Exemplo de configuracao:
```env
# String de conexao do MongoDB Atlas ou instancia local:
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.mongodb.net/corsair_db?retryWrites=true&w=majority

# Ou "memory" para testar localmente sem precisar de MongoDB externo:
# MONGODB_URI=memory

PORT=3000
CORS_ORIGIN=*
NODE_ENV=development
```

### 3.3. Iniciar Servidor Local
- Modo padrao (conecta ao MongoDB configurado no `.env`):
  ```bash
  npm run dev
  ```
- Modo em memoria (inicia banco local com dados de demonstracao sem necessidade de MongoDB externo):
  ```bash
  npm run dev:memory
  ```
O servidor ficara disponivel em `http://localhost:3000/api/perifericos`.

## 4. Testes Automatizados
Para executar a suíte completa de testes automatizados com banco isolado:
```bash
npm test
```

## 5. Endpoints Disponiveis
- `GET /api/perifericos` - Listagem de perifericos cadastrados (ordenados por data de criacao)
- `GET /api/perifericos/:id` - Detalhes de um periferico especifico
- `POST /api/perifericos` - Cadastro de novo periferico (valida marca Corsair, modelo, preco e foto)
- `PUT /api/perifericos/:id` - Atualizacao de periferico existente
- `DELETE /api/perifericos/:id` - Remocao de periferico (retorna HTTP 204)
- `GET /api/health` - Monitoramento e status da API

Consulte o arquivo `api.md` para documentacao completa de parâmetros, corpos JSON, codigos HTTP e exemplos cURL.

## 6. Deploy na Vercel
1. Conecte este repositorio a sua conta da Vercel.
2. Nas configuracoes do projeto na Vercel (*Settings* > *Environment Variables*), adicione:
   - `MONGODB_URI`: sua string de conexao com o cluster MongoDB Atlas.
   - `CORS_ORIGIN`: URL do frontend em producao ou `*`.
   - `NODE_ENV`: `production`.
3. O arquivo `vercel.json` ja esta configurado para direcionar todas as requisicoes `/api/(.*)` para `api/index.js`.
