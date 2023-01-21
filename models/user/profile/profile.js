const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
    profileImg: {
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
    resumeSummary: {
        type: String
    },
    profileVideo: {
        type: String
    },
    resumeSummaryFile: {
        type: String
    },
    previousWork: {
        type: String
    },
    publishCheck: {
        type: String,
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