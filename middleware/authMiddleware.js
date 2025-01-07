const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Utilise 'user' avec un "u" minuscule

exports.protect = async (req, res, next) => {
  let token;

  // Récupérer le token depuis les cookies
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, aucun token' });
  }

  try {
    // Décoder le token et récupérer l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // Exclure le mot de passe des données utilisateur

    if (!req.user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    next(); // Passer au middleware suivant ou à la route
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};