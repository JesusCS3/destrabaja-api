const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    followed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('follow', followSchema);