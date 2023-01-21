const mongoose = require('mongoose');

const servicePlansSchema = new mongoose.Schema(
    {
    namePlanOne: {
        type: String
    },
    deliveryTimePlanOne: {
        type: Number
    },
    commentPlanOne: {
        type: String
    },
    pricePlanOne: {
        type: Number
    },
    clientPricePlanOne: {
        type: Number
    },
    namePlanTwo: {
        type: String
    },
    deliveryTimePlanTwo: {
        type: Number
    },
    commentPlanTwo: {
        type: String
    },
    pricePlanTwo: {
        type: Number
    },
    clientPricePlanTwo: {
        type: Number
    },
    namePlanThree: {
        type: String
    },
    deliveryTimePlanThree: {
        type: Number
    },
    commentPlanThree: {
        type: String
    },
    pricePlanThree: {
        type: Number
    },
    clientPricePlanThree: {
        type: Number
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('servicePlans', servicePlansSchema);