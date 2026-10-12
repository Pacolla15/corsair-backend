const app = require('./index');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado com sucesso na porta ${PORT}`);
  console.log(`Endpoint da API: http://localhost:${PORT}/api/perifericos`);
});

// Encerramento gracioso
process.on('SIGTERM', () => {
  console.log('Sinal SIGTERM recebido. Encerrando servidor HTTP...');
  server.close(() => {
    console.log('Servidor HTTP encerrado.');
  });
});
