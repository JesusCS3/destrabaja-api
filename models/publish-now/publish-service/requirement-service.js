const mongoose = require('mongoose');

const requirementServiceSchema = new mongoose.Schema(
    {
    requirement: {
        type: String
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('requirementService', requirementServiceSchema);