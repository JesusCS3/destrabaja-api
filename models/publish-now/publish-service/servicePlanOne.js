const mongoose = require('mongoose');

const servicePlanOneSchema = new mongoose.Schema(
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
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('servicePlanOne', servicePlanOneSchema);