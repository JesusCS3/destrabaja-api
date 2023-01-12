const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
    {
    name: {
        type: String
    },
    checkPlanOne: {
        type: Boolean
    },
    checkPlanTwo: {
        type: Boolean
    },
    checkPlanThree: {
        type: Boolean
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

module.exports = mongoose.model('deliverable', deliverableSchema);