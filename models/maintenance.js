const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    objectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Object', // Référence à l'objet concerné (équipement ou autre)
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    changes: [
        {
            description: {
                type: String,
                required: true, // Ce qui a été changé
            },
            date: {
                type: Date,
                required: true,
                default: Date.now, // Date du changement
            },
            additionalDetails: {
                type: String,
                required: false, // Détails facultatifs
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now, // Date de création de l'entrée
    },
});

module.exports = mongoose.model('maintenance', MaintenanceSchema);