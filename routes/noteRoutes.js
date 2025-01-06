const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createNote, getNotesByNotebook, getNoteById, deleteNote } = require('../controllers/noteController');

// route protégée
router.post('/', protect, createNote); // Créer une note
router.get('/notebook/:notebookId', protect, getNotesByNotebook); // Lire toutes les notes d’un carnet
router.get('/:id', getNoteById); // Lire une note par ID
router.delete('/:id', protect, deleteNote); // Supprimer une note

module.exports = router;
