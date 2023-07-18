const mongoose = require('mongoose');

const purchasedServiceSchema = new mongoose.Schema(
    {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'service',
            required: true
        },
        buyingUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        sellingUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        plan: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        deliverables: {
            type: Array,
        },
        extras: {
            type: Array,
        },
        startDate: {
            type: Date,
            required: true,
        },
        deadlineDate: {
            type: Date,
            required: true,
        },
        dateExtension: {
            type: Date,
        },
        extensionReason: {
            type: String
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String
        },
        extCount: { 
            type: Number, 
            default: 0 
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