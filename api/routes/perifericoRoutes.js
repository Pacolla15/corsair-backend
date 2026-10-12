const express = require('express');
const router = express.Router();
const {
  listarPerifericos,
  obterPerifericoPorId,
  cadastrarPeriferico,
  atualizarPeriferico,
  excluirPeriferico,
} = require('../controllers/perifericoController');

router.get('/', listarPerifericos);
router.get('/:id', obterPerifericoPorId);
router.post('/', cadastrarPeriferico);
router.put('/:id', atualizarPeriferico);
router.delete('/:id', excluirPeriferico);

module.exports = router;
