const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: true
    },
    hastags: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    videoService: {
        type: String
    },
    imgServiceOne: {
        type: String
    },
    imgServiceTwo: {
        type: String
    },
    imgServiceThree: {
        type: String
    },
    shortDescription: {
        type: String,
        required: true
    },
    longDescription: {
        type: String
    },
    status: {
        type: String
    },
    createdAt: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('service', serviceSchema);