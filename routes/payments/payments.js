
const express = require('express');
const paymentsController = require('../../controllers/payments/payments');

const router = express.Router();
const mdAuth = require('../../middlewares/authenticated');

/* *** test *** */
router.get('/test-payments', mdAuth.ensureAuth, paymentsController.test);

/* *** create checkout session *** */
router.post('/checkout', mdAuth.ensureAuth, paymentsController.createCheckOutSession);

module.exports = router;