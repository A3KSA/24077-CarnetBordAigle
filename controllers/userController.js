const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Inscription d'un nouvel utilisateur
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`Tentative d'inscription avec un email déjà utilisé : ${email}`);
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({ name, email, password, role });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    logger.info(`Utilisateur créé avec succès : ${user._id} (${email}) avec le rôle de '${email}'`);
    res.status(201).json({ user, token });
  } catch (error) {
    logger.error(`Erreur lors de l'inscription d'un utilisateur : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Connexion d'un utilisateur
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Tentative de connexion avec un email inexistant : ${email}`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn(`Mot de passe incorrect pour l'utilisateur ${email}`);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    logger.info(`Utilisateur connecté : ${user._id} (${email})`);
    res.status(200).json({ user, token });
  } catch (error) {
    logger.error(`Erreur lors de la connexion d'un utilisateur : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
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
