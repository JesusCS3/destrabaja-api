const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
    image: {
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    checkTyC: {
        type: Boolean,
        required: true
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('user', userSchema);