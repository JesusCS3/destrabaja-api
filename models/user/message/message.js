const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
    text: {
        type: String,
    },
    viewed: {
        type: Boolean
    },
    createdAt: {
        type: String
    },
    emitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('message', messageSchema);