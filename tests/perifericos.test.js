const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../api/config/database');
const Periferico = require('../api/models/Periferico');
const app = require('../api/index');

describe('API REST - Perifericos Corsair', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await connectDB(uri);
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Periferico.deleteMany({});
  });

  test('GET /api/health - deve retornar status 200 ok', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  test('GET /api/rota-inexistente - deve retornar status 404 com erro padronizado', async () => {
    const res = await request(app).get('/api/rota-inexistente');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Rota nao encontrada');
  });

  test('GET /api/perifericos - deve retornar lista vazia inicialmente', async () => {
    const res = await request(app).get('/api/perifericos');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 0);
  });

  test('POST /api/perifericos - deve cadastrar periferico com dados validos', async () => {
    const payload = {
      marca: 'Corsair',
      modelo: 'K70 RGB MK.2',
      preco: 799.9,
      foto: 'https://images.corsair.com/k70-mk2.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data);
    assert.strictEqual(res.body.data.marca, 'Corsair');
    assert.strictEqual(res.body.data.modelo, 'K70 RGB MK.2');
    assert.strictEqual(res.body.data.preco, 799.9);
    assert.strictEqual(res.body.data.foto, 'https://images.corsair.com/k70-mk2.jpg');
    assert.ok(res.body.data._id);
  });

  test('POST /api/perifericos - deve rejeitar cadastro com marca diferente de Corsair', async () => {
    const payload = {
      marca: 'Logitech',
      modelo: 'G Pro X',
      preco: 600.0,
      foto: 'https://images.logitech.com/gpro.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Marca deve ser Corsair no escopo atual');
  });

  test('POST /api/perifericos - deve rejeitar cadastro sem modelo ou modelo vazio', async () => {
    const payload = {
      marca: 'Corsair',
      modelo: '   ',
      preco: 500.0,
      foto: 'https://images.corsair.com/item.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Modelo e obrigatorio');
  });

  test('POST /api/perifericos - deve rejeitar cadastro com preco negativo', async () => {
    const payload = {
      marca: 'Corsair',
      modelo: 'Dark Core RGB PRO',
      preco: -50,
      foto: 'https://images.corsair.com/darkcore.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Preco deve ser maior ou igual a zero');
  });

  test('POST /api/perifericos - deve rejeitar cadastro com preco nao numerico', async () => {
    const payload = {
      marca: 'Corsair',
      modelo: 'Scimitar RGB Elite',
      preco: 'cem_reais',
      foto: 'https://images.corsair.com/scimitar.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Preco deve ser um numero valido');
  });

  test('POST /api/perifericos - deve rejeitar cadastro com URL de foto invalida', async () => {
    const payload = {
      marca: 'Corsair',
      modelo: 'Virtuoso RGB Wireless',
      preco: 1299.9,
      foto: 'c:/imagens/virtuoso.jpg',
    };

    const res = await request(app)
      .post('/api/perifericos')
      .send(payload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(
      res.body.error,
      'Foto deve ser uma URL valida (iniciando com http:// ou https://)'
    );
  });

  test('GET /api/perifericos/:id - deve retornar periferico existente por ID', async () => {
    const criado = await Periferico.create({
      marca: 'Corsair',
      modelo: 'Ironclaw RGB',
      preco: 399.9,
      foto: 'https://images.corsair.com/ironclaw.jpg',
    });

    const res = await request(app).get(`/api/perifericos/${criado._id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data._id, criado._id.toString());
    assert.strictEqual(res.body.data.modelo, 'Ironclaw RGB');
  });

  test('GET /api/perifericos/:id - deve retornar 400 para ID com formato invalido', async () => {
    const res = await request(app).get('/api/perifericos/id-totalmente-invalido');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Identificador invalido');
  });

  test('GET /api/perifericos/:id - deve retornar 404 para ID inexistente', async () => {
    const idInexistente = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/perifericos/${idInexistente}`);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Periferico nao encontrado');
  });

  test('PUT /api/perifericos/:id - deve atualizar dados do periferico com sucesso', async () => {
    const criado = await Periferico.create({
      marca: 'Corsair',
      modelo: 'K65 RGB MINI',
      preco: 699.0,
      foto: 'https://images.corsair.com/k65.jpg',
    });

    const payloadAtualizacao = {
      marca: 'Corsair',
      modelo: 'K65 RGB MINI 60%',
      preco: 649.0,
      foto: 'https://images.corsair.com/k65-updated.jpg',
    };

    const res = await request(app)
      .put(`/api/perifericos/${criado._id}`)
      .send(payloadAtualizacao);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.modelo, 'K65 RGB MINI 60%');
    assert.strictEqual(res.body.data.preco, 649.0);
    assert.strictEqual(res.body.data.foto, 'https://images.corsair.com/k65-updated.jpg');
  });

  test('PUT /api/perifericos/:id - deve retornar 400 para ID invalido', async () => {
    const res = await request(app)
      .put('/api/perifericos/id-invalido')
      .send({
        marca: 'Corsair',
        modelo: 'K55 Core',
        preco: 299.0,
        foto: 'https://images.corsair.com/k55.jpg',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Identificador invalido');
  });

  test('PUT /api/perifericos/:id - deve retornar 404 para ID inexistente', async () => {
    const idInexistente = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .put(`/api/perifericos/${idInexistente}`)
      .send({
        marca: 'Corsair',
        modelo: 'K55 Core',
        preco: 299.0,
        foto: 'https://images.corsair.com/k55.jpg',
      });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Periferico nao encontrado');
  });

  test('DELETE /api/perifericos/:id - deve excluir periferico com sucesso (204)', async () => {
    const criado = await Periferico.create({
      marca: 'Corsair',
      modelo: 'Harpoon RGB Wireless',
      preco: 329.0,
      foto: 'https://images.corsair.com/harpoon.jpg',
    });

    const res = await request(app).delete(`/api/perifericos/${criado._id}`);
    assert.strictEqual(res.status, 204);

    const busca = await Periferico.findById(criado._id);
    assert.strictEqual(busca, null);
  });

  test('DELETE /api/perifericos/:id - deve retornar 400 para ID invalido', async () => {
    const res = await request(app).delete('/api/perifericos/id-invalido');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, 'Identificador invalido');
  });

  test('DELETE /api/perifericos/:id - deve retornar 404 para ID inexistente', async () => {
    const idInexistente = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/perifericos/${idInexistente}`);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Periferico nao encontrado');
  });
});
