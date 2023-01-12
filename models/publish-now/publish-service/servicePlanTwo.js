const mongoose = require('mongoose');

const servicePlanTwoSchema = new mongoose.Schema(
    {
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
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('servicePlanTwo', servicePlanTwoSchema);