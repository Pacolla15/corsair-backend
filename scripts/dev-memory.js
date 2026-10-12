process.env.MONGODB_URI = process.env.MONGODB_URI || 'memory';
require('../api/server');
