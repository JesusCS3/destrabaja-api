const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
    emitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
    },
    filesMessage: {
        type:Array,
    },
    comesFrom: {
        type: String,
    },
    viewed: {
        type: Boolean
    },
    createdAt: {
        type: String
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('message', messageSchema);