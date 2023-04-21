const mongoose = require('mongoose');
/*
const messageSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true,
            },
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
        users: {
            emitter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            receiver: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
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
        timestamps: true,
    },
);
*/

/*
const messageSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true,
            },
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
        users: {
            type:Array,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
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
        timestamps: true,
    },
);
*/


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

module.exports = mongoose.model('message', messageSchema);