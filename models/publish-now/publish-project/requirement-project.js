const mongoose = require('mongoose');

const requirementProjectSchema = new mongoose.Schema(
    {
    requirement: {
        type: String
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('requirementProject', requirementProjectSchema);