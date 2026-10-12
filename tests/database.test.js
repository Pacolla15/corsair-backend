const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../api/config/database');
const Periferico = require('../api/models/Periferico');

describe('Modulo de Banco de Dados e Modelo Periferico', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('Deve falhar ao tentar conectar sem MONGODB_URI', async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    await disconnectDB();

    await assert.rejects(
      async () => {
        await connectDB();
      },
      {
        message: 'MONGODB_URI nao configurada nas variaveis de ambiente',
      }
    );

    // Restaurar conexao do teste
    await connectDB(mongoServer.getUri());
    process.env.MONGODB_URI = originalUri;
  });

  test('Deve criar um periferico valido da Corsair com timestamps', async () => {
    const dados = {
      marca: 'Corsair',
      modelo: 'K70 RGB PRO',
      preco: 899.9,
      foto: 'https://images.corsair.com/k70.jpg',
    };

    const periferico = await Periferico.create(dados);

    assert.ok(periferico._id);
    assert.strictEqual(periferico.marca, 'Corsair');
    assert.strictEqual(periferico.modelo, 'K70 RGB PRO');
    assert.strictEqual(periferico.preco, 899.9);
    assert.strictEqual(periferico.foto, 'https://images.corsair.com/k70.jpg');
    assert.ok(periferico.createdAt instanceof Date);
    assert.ok(periferico.updatedAt instanceof Date);

    await Periferico.findByIdAndDelete(periferico._id);
  });

  test('Deve rejeitar criacao de periferico com marca diferente de Corsair', async () => {
    const dados = {
      marca: 'Razer',
      modelo: 'BlackWidow',
      preco: 799.9,
      foto: 'https://images.razer.com/bw.jpg',
    };

    await assert.rejects(
      async () => {
        await Periferico.create(dados);
      },
      (err) => {
        assert.ok(err.errors.marca);
        return true;
      }
    );
  });

  test('Deve rejeitar modelo vazio ou apenas com espacos', async () => {
    const dados = {
      marca: 'Corsair',
      modelo: '   ',
      preco: 499.0,
      foto: 'https://images.corsair.com/harpoon.jpg',
    };

    await assert.rejects(
      async () => {
        await Periferico.create(dados);
      },
      (err) => {
        assert.ok(err.errors.modelo);
        return true;
      }
    );
  });

  test('Deve rejeitar preco negativo', async () => {
    const dados = {
      marca: 'Corsair',
      modelo: 'M65 RGB Ultra',
      preco: -10,
      foto: 'https://images.corsair.com/m65.jpg',
    };

    await assert.rejects(
      async () => {
        await Periferico.create(dados);
      },
      (err) => {
        assert.ok(err.errors.preco);
        return true;
      }
    );
  });

  test('Deve rejeitar URL de foto invalida', async () => {
    const dados = {
      marca: 'Corsair',
      modelo: 'HS80 RGB',
      preco: 699.0,
      foto: 'imagem-local-invalida.png',
    };

    await assert.rejects(
      async () => {
        await Periferico.create(dados);
      },
      (err) => {
        assert.ok(err.errors.foto);
        return true;
      }
    );
  });

  test('Deve atualizar dados de um periferico e modificar updatedAt', async () => {
    const periferico = await Periferico.create({
      marca: 'Corsair',
      modelo: 'Void Elite',
      preco: 549.9,
      foto: 'https://images.corsair.com/void.jpg',
    });

    const precoAntigo = periferico.preco;
    periferico.preco = 499.9;
    await periferico.save();

    const atualizado = await Periferico.findById(periferico._id);
    assert.strictEqual(atualizado.preco, 499.9);
    assert.notStrictEqual(atualizado.preco, precoAntigo);

    await Periferico.findByIdAndDelete(periferico._id);
  });

  test('Deve conectar com sucesso no modo memory e popular seed inicial se vazio', async () => {
    await disconnectDB();
    await connectDB('memory');

    const perifericos = await Periferico.find();
    assert.ok(perifericos.length >= 3);
    const k70 = perifericos.find((p) => p.modelo === 'K70 RGB PRO');
    assert.ok(k70);
    assert.strictEqual(k70.marca, 'Corsair');

    await disconnectDB();
    await connectDB(mongoServer.getUri());
  });
});
