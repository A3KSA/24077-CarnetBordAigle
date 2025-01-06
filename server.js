const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors'); // Importer CORS
require('dotenv').config();
const User = require('./models/user'); // Assure-toi que le modèle User est bien référencé

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
    .then(async () => {
        console.log('MongoDB connecté');
        // Appeler la fonction pour créer l'utilisateur admin par défaut
        await createDefaultAdmin();
    })
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


async function createDefaultAdmin() {
    try {
        // Vérifie si un admin existe déjà
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Crée un utilisateur admin par défaut
            const defaultAdmin = new User({
                name: 'Admin',
                email: process.env.DEFAULT_ADMIN_EMAIL,
                password: process.env.DEFAULT_ADMIN_PASSWORD,
                role: 'admin'
            });

            // Sauvegarde l'admin après avoir hashé son mot de passe
            await defaultAdmin.save();
            console.log('Utilisateur administrateur par défaut créé.');
        } else {
            console.log('Un utilisateur admin existe déjà.');
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin par défaut :', error.message);
    }
}
