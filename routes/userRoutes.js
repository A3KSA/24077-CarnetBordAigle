const express = require('express');
const { registerUser, loginUser, updateUser, getUsers, getUserById, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Routes publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes protégées
router.get('/', protect, getUsers); // Lire tous les utilisateurs
router.put('/profile', protect, updateUser);
router.get('/:id', protect, getUserById); // Lire un utilisateur par ID
router.delete('/:id', protect, deleteUser); // Supprimer un utilisateur

module.exports = router;
