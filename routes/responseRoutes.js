const express = require('express');
const { createResponse, getResponsesByNote, deleteResponse } = require('../controllers/responseController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createResponse); // Créer une réponse
router.get('/note/:noteId', protect, getResponsesByNote); // Lire toutes les réponses d'une note
router.delete('/:id', protect, deleteResponse); // Supprimer une réponse

module.exports = router;
