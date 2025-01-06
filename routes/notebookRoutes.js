const express = require('express');
const { createNotebook, getNotebooks, getNotebookById, updateNotebook, deleteNotebook } = require('../controllers/notebookController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createNotebook); // Créer un carnet
router.get('/', protect, getNotebooks); // Lire tous les carnets
router.get('/:id', getNotebookById); // Lire un carnet par ID
router.put('/:id', protect, updateNotebook); // Mettre à jour un carnet
router.delete('/:id', protect, deleteNotebook); // Supprimer un carnet

module.exports = router;
