const Note = require('../models/note');
const Response = require('../models/response'); // Importer le modèle Response
const Notebook = require('../models/notebook'); // Ajustez le chemin si nécessaire
const logger = require('../utils/logger');

// Créer une nouvelle note (utilisateur connecté)
exports.createNote = async (req, res) => {
  const { title, content, notebookId } = req.body;

  try {
    const note = await Note.create({ title, content, userId: req.user.id, notebookId });

    logger.info(`Note créée : ${note._id} dans le carnet ${notebookId}`);
    res.status(201).json(note);
  } catch (error) {
    logger.error(`Erreur lors de la création de la note : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Lire toutes les notes d'un carnet (utilisateur connecté)
exports.getNotesByNotebook = async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.notebookId,
      $or: [
        { visibility: 'public' },
        { userId: req.user.id }
      ]
    });

    if (!notebook) return res.status(404).json({ message: 'Carnet non trouvé ou accès interdit' });

    const notes = await Note.find({ notebookId: notebook._id });
    logger.info(`Notes récupérées pour le carnet ${notebook._id}`);
    res.status(200).json(notes);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des notes : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


// Lire une note par ID (utilisateur connecté)
exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id });
        if (!note) {
            logger.warn(`Note non trouvée : ${req.params.id}`);
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        logger.info(`Note récupérée : ${note._id}`);
        res.status(200).json(note);
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la note ${req.params.id} : ${error.message}`);
        res.status(500).json({ message: 'Erreur lors de la récupération de la note', error });
    }
};

exports.deleteNote = async (req, res) => {
  try {
    // Rechercher la note à supprimer
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      logger.warn(`Tentative de suppression d'une note non trouvée : ${req.params.id} par l'utilisateur ${req.user.id}`);
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    // Supprimer les réponses associées à la note
    await Response.deleteMany({ noteId: note._id });

    // Supprimer la note
    await Note.deleteOne({ _id: req.params.id, userId: req.user.id });

    logger.info(`Note et ses réponses supprimées : ${note._id} par l'utilisateur ${req.user.id}`);
    res.status(200).json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la note ${req.params.id} pour l'utilisateur ${req.user.id} : ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la suppression de la note', error });
  }
};
