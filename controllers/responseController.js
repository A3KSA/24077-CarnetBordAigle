const Response = require('../models/response');
const Note = require('../models/note');
const logger = require('../utils/logger');

exports.createResponse = async (req, res) => {
  const { content, noteId } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note non trouvée' });

    const response = await Response.create({
      content,
      noteId,
      userId: req.user.id
    });

    logger.info(`Réponse créée : ${response._id} pour la note ${noteId}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error(`Erreur lors de la création de la réponse : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.getResponsesByNote = async (req, res) => {
    try {
      const responses = await Response.find({ noteId: req.params.noteId })
        .populate('userId', 'name email') // Inclure les infos de l'utilisateur
        .sort({ createdAt: 1 }); // Trier par ordre chronologique
  
      logger.info(`Réponses récupérées pour la note ${req.params.noteId}`);
      res.status(200).json(responses);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des réponses : ${error.message}`);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };

  exports.deleteResponse = async (req, res) => {
    try {
      const response = await Response.findOne({ _id: req.params.id, userId: req.user.id });
      if (!response) return res.status(404).json({ message: 'Réponse non trouvée ou accès interdit' });
  
      await response.remove();
      logger.info(`Réponse supprimée : ${response._id}`);
      res.status(200).json({ message: 'Réponse supprimée avec succès' });
    } catch (error) {
      logger.error(`Erreur lors de la suppression de la réponse : ${error.message}`);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  
  
