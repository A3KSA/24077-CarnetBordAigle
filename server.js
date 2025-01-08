require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors'); // Importer CORS
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const https = require('https');
const fs = require('fs');
const debug = require('debug')('server'); // Le nom 'server' est une namespace pour vos logs
const User = require('./models/user'); // Assure-toi que le modèle User est bien référencé

const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const responseRoutes = require('./routes/responseRoutes');

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://localhost:5000',
            'https://10.10.6.151:5000',
            'https://a3k.missaticus.ch:5000',
            'http://localhost:4200',
            'http://10.10.6.151:81',
        ]; // Origines autorisées
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Autorise l'envoi de cookies et d'autres informations d'identification
};

app.use(cors(corsOptions));

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour analyser les cookies
app.use(cookieParser());

// Middleware pour gérer le paramètre utilisateur dans l'URL
app.get('/', async (req, res, next) => {
    console.log('Query parameters:', req.query); // Ajoutez ce log pour voir ce qui est reçu
    const username = req.query.username; // Récupérer l'argument 'username' dans l'URL
    console.log("username into request: ", username);
    if (username) {
        try {
            const user = await User.findOne({ name: username }); // Utilisez 'name' au lieu de 'username'
            console.log(user);
            if (user) {
                const now = new Date();
                const midnight = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 1, // Passer au jour suivant pour atteindre minuit
                    0, 0, 0, 0 // Heure réglée à 00:00:00
                );
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                console.log(token);
                // Ajouter un cookie ou un token pour l'utilisateur
                res.cookie('authToken', token, {
                    httpOnly: true, // Empêche l'accès via JavaScript
                    expires: midnight, // Définit l'expiration à minuit
                    secure: true, // Utilisez HTTPS en production
                    path: '/', // Rend le cookie accessible sur toutes les routes
                });
                return res.redirect(`/home/${user._id}`); // Rediriger vers Angular avec l'ID utilisateur
            } else {
                return res.redirect('/login'); // Rediriger vers la page de login si l'utilisateur n'existe pas
            }
        } catch (err) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', err);
            return res.redirect('/login'); // Redirection en cas d'erreur
        }
    } else {
        next(); // Continuer avec la logique par défaut
    }
});

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
    console.log('CORS request from origin:', req.headers.origin);
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

app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/responses', responseRoutes);

// Configurer le dossier public pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public/angular/browser')));

// Gérer les routes Angular (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/angular/browser/index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

// Récupérer les chemins des certificats
const keyPath = process.env.KEY || null;
const certPath = process.env.CERT || null;

// Création du serveur HTTP ou HTTPS
if (keyPath && certPath) {
    try {
        const privateKey = fs.readFileSync(keyPath, 'utf8');
        const certificate = fs.readFileSync(certPath, 'utf8');
        const credentials = { key: privateKey, cert: certificate };

        debug('Lancement du serveur en HTTPS');
        server = https.createServer(credentials, app);
    } catch (err) {
        console.error('Erreur lors du chargement des certificats HTTPS :', err);
        console.warn('Basculer vers HTTP');
        server = http.createServer(app);
    }
} else {
    debug('Aucun certificat défini. Utilisation du serveur HTTP');
    server = http.createServer(app);
}

// Configurer les listeners du serveur
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} (${keyPath && certPath ? 'HTTPS' : 'HTTP'})`);
});

server.on('error', (err) => {
    console.error('Erreur du serveur :', err);
});

server.on('listening', () => {
    console.log(`Serveur en écoute sur ${keyPath && certPath ? 'HTTPS' : 'HTTP'} port ${PORT}`);
});


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
