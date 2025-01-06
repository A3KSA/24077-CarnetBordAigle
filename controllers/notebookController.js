const Notebook = require('../models/notebook');
const Note = require('../models/note'); // Import du modèle Note
const Response = require('../models/response'); // Import du modèle Response
const logger = require('../utils/logger');

// Créer un carnet
exports.createNotebook = async (req, res) => {
    const { title, description, visibility } = req.body;
  
    try {
      const notebook = await Notebook.create({
        title,
        description,
        visibility: visibility || 'private',
        userId: req.user.id
      });
  
      logger.info(`Carnet créé : ${notebook._id} (visibilité : ${notebook.visibility}) par l'utilisateur ${req.user.id}`);
      res.status(201).json(notebook);
    } catch (error) {
      logger.error(`Erreur lors de la création du carnet : ${error.message}`);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  

// Lire tous les carnets de l'utilisateur connecté
exports.getNotebooks = async (req, res) => {
    try {
      const notebooks = await Notebook.find({
        $or: [
          { visibility: 'public' },
          { userId: req.user.id } // Carnets privés de l'utilisateur connecté
        ]
      });
  
      logger.info(`Carnets récupérés pour l'utilisateur ${req.user.id}`);
      res.status(200).json(notebooks);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des carnets : ${error.message}`);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  

// Lire un carnet par ID (sans restriction d'accès)
exports.getNotebookById = async (req, res) => {
  try {
    // Rechercher uniquement par l'ID du carnet
    const notebook = await Notebook.findById(req.params.id);

    // Si aucun carnet n'est trouvé, retourner une erreur 404
    if (!notebook) return res.status(404).json({ message: 'Carnet non trouvé' });

    logger.info(`Carnet récupéré : ${notebook._id}`);
    res.status(200).json(notebook); // Retourner le carnet
  } catch (error) {
    logger.error(`Erreur lors de la récupération du carnet : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


// Mettre à jour un carnet
exports.updateNotebook = async (req, res) => {
    const { title, description, visibility } = req.body;
  
    try {
      const notebook = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
      if (!notebook) return res.status(404).json({ message: 'Carnet non trouvé ou accès interdit' });
  
      notebook.title = title || notebook.title;
      notebook.description = description || notebook.description;
      notebook.visibility = visibility || notebook.visibility;
      await notebook.save();
  
      logger.info(`Carnet mis à jour : ${notebook._id}`);
      res.status(200).json(notebook);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du carnet : ${error.message}`);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  

// Supprimer un carnet
exports.deleteNotebook = async (req, res) => {
  try {
    // Rechercher le carnet
    const notebook = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notebook) return res.status(404).json({ message: 'Carnet non trouvé' });

    // Supprimer les réponses associées aux notes du carnet
    const notes = await Note.find({ notebookId: notebook._id });
    const noteIds = notes.map(note => note._id);
    await Response.deleteMany({ noteId: { $in: noteIds } });

    // Supprimer les notes associées au carnet
    await Note.deleteMany({ notebookId: notebook._id });

    // Supprimer le carnet
    await Notebook.deleteOne({ _id: notebook._id });

    logger.info(`Carnet et ses associations supprimés : ${notebook._id}`);
    res.status(200).json({ message: 'Carnet supprimé avec succès' });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du carnet : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

