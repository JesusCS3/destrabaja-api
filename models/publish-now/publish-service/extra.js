const mongoose = require('mongoose');

const extraSchema = new mongoose.Schema(
    {
    name: {
        type: String
    },
    checkPlanOneExtra: {
        type: Boolean
    },
    deliveryTimePlanOneExtra: {
        type: Number
    },
    pricePlanOneExtra: {
        type: Number
    },
    clientPricePlanOneExtra: {
        type: Number
    },
    checkPlanTwoExtra: {
        type: Boolean
    },
    deliveryTimePlanTwoExtra: {
        type: Number
    },
    pricePlanTwoExtra: {
        type: Number
    },
    clientPricePlanTwoExtra: {
        type: Number
    },
    checkPlanThreeExtra: {
        type: Boolean
    },
    deliveryTimePlanThreeExtra: {
        type: Number
    },
    pricePlanThreeExtra: {
        type: Number
    },
    clientPricePlanThreeExtra: {
        type: Number
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    }
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('extra', extraSchema);