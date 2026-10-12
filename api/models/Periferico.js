const mongoose = require('mongoose');

function isValidUrl(val) {
  if (typeof val !== 'string' || !val.trim()) {
    return false;
  }
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const perifericoSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'Marca e obrigatoria'],
      trim: true,
      validate: {
        validator: function (v) {
          return v === 'Corsair';
        },
        message: 'Marca deve ser Corsair no escopo atual',
      },
    },
    modelo: {
      type: String,
      required: [true, 'Modelo e obrigatorio'],
      trim: true,
      validate: {
        validator: function (v) {
          return typeof v === 'string' && v.trim().length > 0;
        },
        message: 'Modelo nao pode ser vazio',
      },
    },
    preco: {
      type: Number,
      required: [true, 'Preco e obrigatorio'],
      min: [0, 'Preco deve ser maior ou igual a zero'],
      validate: {
        validator: function (v) {
          return typeof v === 'number' && !Number.isNaN(v);
        },
        message: 'Preco deve ser um numero valido',
      },
    },
    foto: {
      type: String,
      required: [true, 'Foto e obrigatoria'],
      trim: true,
      validate: {
        validator: isValidUrl,
        message: 'Foto deve ser uma URL valida (iniciando com http:// ou https://)',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Evitar recriacao do modelo em recargas ou ambientes serverless
const Periferico =
  mongoose.models.Periferico || mongoose.model('Periferico', perifericoSchema);

module.exports = Periferico;
