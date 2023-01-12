const mongoose = require('mongoose');

const servicePlanThreeSchema = new mongoose.Schema(
    {
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

module.exports = mongoose.model('servicePlanThree', servicePlanThreeSchema);