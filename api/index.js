const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const perifericoRoutes = require('./routes/perifericoRoutes');

dotenv.config();

const app = express();

// Configuracao de CORS
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigin === '*' || !origin || allowedOrigin.split(',').includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem nao permitida pelo CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Assegurar conexao com MongoDB antes de atender as rotas da API
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    return res.status(500).json({ error: 'Falha na conexao com o banco de dados' });
  }
});

// Health check para monitoramento
app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas principais
app.use('/api/perifericos', perifericoRoutes);

// Tratamento de rota nao encontrada
app.use((req, res) => {
  return res.status(404).json({ error: 'Rota nao encontrada' });
});

// Tratamento centralizado de erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erro interno:', err.message);
  return res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
