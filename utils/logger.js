const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Niveau minimum à logger (error, warn, info, http, verbose, debug, silly)
  format: winston.format.combine(
    winston.format.timestamp(), // Ajoute un timestamp
    winston.format.json() // Format JSON pour les logs
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Logs d'erreurs
    new winston.transports.File({ filename: 'logs/combined.log' }) // Tous les logs
  ]
});

// Si on est en développement, affiche aussi les logs dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Ajoute des couleurs pour la console
        winston.format.simple() // Format lisible pour le dev
      )
    })
  );
}

module.exports = logger;
