const mongoose = require('mongoose');
const Periferico = require('../models/Periferico');

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

function validarDadosPeriferico(dados, isUpdate = false) {
  const { marca, modelo, preco, foto } = dados;

  // Marca
  if (marca === undefined || marca === null || marca === '') {
    return { valido: false, mensagem: 'Marca e obrigatoria' };
  }
  if (marca !== 'Corsair') {
    return { valido: false, mensagem: 'Marca deve ser Corsair no escopo atual' };
  }

  // Modelo
  if (typeof modelo !== 'string' || !modelo.trim()) {
    return { valido: false, mensagem: 'Modelo e obrigatorio' };
  }

  // Preco
  const precoNum = Number(preco);
  if (preco === undefined || preco === null || preco === '' || Number.isNaN(precoNum)) {
    return { valido: false, mensagem: 'Preco deve ser um numero valido' };
  }
  if (precoNum < 0) {
    return { valido: false, mensagem: 'Preco deve ser maior ou igual a zero' };
  }

  // Foto
  if (typeof foto !== 'string' || !isValidUrl(foto)) {
    return { valido: false, mensagem: 'Foto deve ser uma URL valida (iniciando com http:// ou https://)' };
  }

  return {
    valido: true,
    dadosSanitizados: {
      marca: marca.trim(),
      modelo: modelo.trim(),
      preco: precoNum,
      foto: foto.trim(),
    },
  };
}

async function listarPerifericos(req, res, next) {
  try {
    const perifericos = await Periferico.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: perifericos });
  } catch (error) {
    return next(error);
  }
}

async function obterPerifericoPorId(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Identificador invalido' });
    }

    const periferico = await Periferico.findById(id);
    if (!periferico) {
      return res.status(404).json({ error: 'Periferico nao encontrado' });
    }

    return res.status(200).json({ data: periferico });
  } catch (error) {
    return next(error);
  }
}

async function cadastrarPeriferico(req, res, next) {
  try {
    const validacao = validarDadosPeriferico(req.body);
    if (!validacao.valido) {
      return res.status(400).json({ error: validacao.mensagem });
    }

    const novoPeriferico = await Periferico.create(validacao.dadosSanitizados);
    return res.status(201).json({ data: novoPeriferico });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const primeiroErro = Object.values(error.errors)[0]?.message || 'Dados invalidos';
      return res.status(400).json({ error: primeiroErro });
    }
    return next(error);
  }
}

async function atualizarPeriferico(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Identificador invalido' });
    }

    const validacao = validarDadosPeriferico(req.body, true);
    if (!validacao.valido) {
      return res.status(400).json({ error: validacao.mensagem });
    }

    const perifericoAtualizado = await Periferico.findByIdAndUpdate(
      id,
      validacao.dadosSanitizados,
      { new: true, runValidators: true }
    );

    if (!perifericoAtualizado) {
      return res.status(404).json({ error: 'Periferico nao encontrado' });
    }

    return res.status(200).json({ data: perifericoAtualizado });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const primeiroErro = Object.values(error.errors)[0]?.message || 'Dados invalidos';
      return res.status(400).json({ error: primeiroErro });
    }
    return next(error);
  }
}

async function excluirPeriferico(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Identificador invalido' });
    }

    const perifericoRemovido = await Periferico.findByIdAndDelete(id);
    if (!perifericoRemovido) {
      return res.status(404).json({ error: 'Periferico nao encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarPerifericos,
  obterPerifericoPorId,
  cadastrarPeriferico,
  atualizarPeriferico,
  excluirPeriferico,
};
