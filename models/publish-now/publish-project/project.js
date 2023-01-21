const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
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
    videoProject: {
        type: String
    },
    imgProjectOne: {
        type: String
    },
    imgProjectTwo: {
        type: String
    },
    imgProjectThree: {
        type: String
    },
    fileProjectOne: {
        type: String
    },
    fileProjectTwo: {
        type: String
    },
    fileProjectThree: {
        type: String
    },
    shortDescription: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    deliveryDate: {
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

module.exports = mongoose.model('project', projectSchema);