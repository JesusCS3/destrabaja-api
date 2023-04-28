const mongoose = require('mongoose');

const purchasedServiceSchema = new mongoose.Schema(
    {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'service',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        plan: {
            type: String,
            required: true
        },
        extras: {
            type: Array,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        dateExtension: {
            type: Date,
        },
        status: {
            type: String
        },
        createdAt: {
            type: Date,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('purchasedService', purchasedServiceSchema);