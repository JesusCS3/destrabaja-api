const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: true
    },
    hashtags: {
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
    images: {
        type:Array,
    },
    filesProject: {
        type:Array,
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
    checkDeliveryDate: {
        type: String,
    },
    deliveryDate: {
        type: String
    },
    requirement: {
        type: Array
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

module.exports = mongoose.model('project', projectSchema);