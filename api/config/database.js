const mongoose = require('mongoose');
const dns = require('node:dns');

function configureDnsForSrv(uri) {
  if (typeof uri === 'string' && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {
      // Mantem servidores padrao caso nao seja possivel alterar
    }
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let inMemoryServer = null;

async function seedInitialDataIfEmpty() {
  try {
    const Periferico = require('../models/Periferico');
    const total = await Periferico.countDocuments();
    if (total === 0) {
      await Periferico.create([
        {
          marca: 'Corsair',
          modelo: 'K70 RGB PRO',
          preco: 899.9,
          foto: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        },
        {
          marca: 'Corsair',
          modelo: 'M65 RGB Ultra Wireless',
          preco: 549.9,
          foto: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        },
        {
          marca: 'Corsair',
          modelo: 'HS80 RGB Wireless',
          preco: 849.9,
          foto: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        },
      ]);
      console.log('Dados iniciais de demonstracao inseridos com sucesso.');
    }
  } catch (err) {
    console.error('Nao foi possivel inserir dados de seed:', err.message);
  }
}

async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI nao configurada nas variaveis de ambiente');
  }

  configureDnsForSrv(uri);

  if (cached.conn) {
    return cached.conn;
  }

  // Suporte a banco em memoria para desenvolvimento local sem necessidade de MongoDB Atlas
  let targetUri = uri;
  let isMemoryMode = false;
  if (uri === 'memory') {
    isMemoryMode = true;
    if (!inMemoryServer) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      inMemoryServer = await MongoMemoryServer.create();
    }
    targetUri = inMemoryServer.getUri();
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(targetUri, opts).then(async (m) => {
      if (isMemoryMode) {
        await seedInitialDataIfEmpty();
      }
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  if (inMemoryServer) {
    await inMemoryServer.stop();
    inMemoryServer = null;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};
