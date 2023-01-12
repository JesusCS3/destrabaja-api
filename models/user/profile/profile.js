const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
    imgProfile: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    fatherLastName: {
        type: String,
        required: true
    },
    motherLastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    dateBirth: {
        type: String,
        required: true
    },
    contry: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    resumesummary: {
        type: String
    },
    videoProfile: {
        type: String
    },
    resumesummaryFile: {
        type: String
    },
    previousWork: {
        type: String
    },
    rfcCheck: {
        type: Boolean,
        required: true
    },
    rfc: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: String
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('profile', profileSchema);