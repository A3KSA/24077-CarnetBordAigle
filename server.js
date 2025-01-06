const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors'); // Importer CORS
require('dotenv').config();

const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const responseRoutes = require('./routes/responseRoutes');

const app = express();

// Configurer le dossier public pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public/angular/browser')));

// Gérer les routes Angular (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/angular/browser/index.html'));
});

// Middleware pour parser le JSON
app.use(express.json());

// Activer CORS
app.use(cors());

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Middleware pour capturer les erreurs
app.use((err, req, res, next) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Utiliser Morgan pour les requêtes HTTP
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.http(message.trim())
        }
    })
);

// Routes de base
app.get('/', (req, res) => {
    res.send('API du carnet de bord fonctionne 🚀');
});

app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/responses', responseRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
