const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
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
    videoService: {
        type: String
    },
    images: {
        type:Array,
    },
    shortDescription: {
        type: String,
        required: true
    },
    longDescription: {
        type: String
    },
    checkPlanTwo: {
        type: Boolean,
    },
    checkPlanThree: {
        type: Boolean,
    },
    namePlanOne: {
        type: String,
    },
    namePlanTwo: {
        type: String,
    },
    namePlanThree: {
        type: String,
    },
    deliverables: {
        type:Array,
    },
    deliveryTimePlanOne: {
        type: Number,
    },
    deliveryTimePlanTwo: {
        type: Number,
    },
    deliveryTimePlanThree: {
        type: Number,
    },
    commentPlanOne: {
        type: String
    },
    commentPlanTwo: {
        type: String
    },
    commentPlanThree: {
        type: String
    },
    pricePlanOne:  {
        type: Number,
    },
    pricePlanTwo:  {
        type: Number,
    },
    pricePlanThree:  {
        type: Number,
    },
    clientPricePlanOne:  {
        type: Number,
    },
    clientPricePlanTwo:  {
        type: Number,
    },
    clientPricePlanThree:  {
        type: Number,
    },
    extras: {
        type: Array,
    },
    requirement: {
        type: Array,
    },
    status: {
        type: String
    },
    createdAt: {
        type: Date,
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