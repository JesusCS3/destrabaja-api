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
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service',
    },
    purchasedService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'purchasedService',
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },
    projectStarted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projectStarted',
    },
    createdAt: {
        type: Date,
    },
    },
    {
    timestamps: true
    }
);

/*
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
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service',
        required: true,
    },
    createdAt: {
        type: Date,
    },
    },
    {
    timestamps: true
    }
);
*/

module.exports = mongoose.model('message', messageSchema);