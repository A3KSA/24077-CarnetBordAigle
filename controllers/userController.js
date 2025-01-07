const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const cookieOptions = {
  httpOnly: true,       // Empêche l'accès côté client (JavaScript)
  secure: process.env.NODE_ENV === 'production', // Utilisez HTTPS en production
  sameSite: 'Strict',   // Empêche les requêtes inter-domaines
  maxAge: 30 * 24 * 60 * 60 * 1000, // Durée de validité : 30 jours
};

// Inscription d'un nouvel utilisateur
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('authToken', token, cookieOptions); // Stocke le token dans un cookie
    res.status(201).json({ message: 'Inscription réussie', user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Connexion d'un utilisateur
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.cookie('authToken', token, cookieOptions); // Stocke le token dans un cookie
    res.status(200).json({ message: 'Connexion réussie', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.logoutUser = (req, res) => {
  try {
    // Supprimer le cookie en le vidant
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la déconnexion', error });
  }
};

// Mise à jour d'un utilisateur
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn(`Utilisateur non trouvé lors de la mise à jour : ${req.params.id}`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    logger.info(`Utilisateur mis à jour : ${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id} : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error });
  }
};

// Suppression d'un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn(`Tentative de suppression d'un utilisateur inexistant : ${req.params.id}`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer les réponses associées à la note
    await User.deleteMany({ userId: user._id });
    // Supprimer la note
    await User.deleteOne({ _id: req.params.id});

    logger.info(`Utilisateur supprimé : ${user._id}`);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id} : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
  }
};

// Récupération de tous les utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    logger.info(`Liste des utilisateurs récupérée (${users.length} utilisateurs trouvés)`);
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des utilisateurs : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
};

// Récupération d'un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      logger.warn(`Utilisateur non trouvé : ${req.params.id}`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    logger.info(`Utilisateur récupéré : ${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id} : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    // `req.user` est défini par le middleware `protect`
    const user = await User.findById(req.user.id).select('-password'); // Exclure le mot de passe
    if (!user) {
      logger.warn(`Utilisateur connecté non trouvé : ${req.user.id}`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    logger.info(`Utilisateur connecté récupéré : ${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'utilisateur connecté : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur connecté', error });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie('authToken', cookieOptions); // Supprime le cookie
  res.status(200).json({ message: 'Déconnexion réussie' });
};

