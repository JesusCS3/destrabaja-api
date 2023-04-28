
const express = require('express');
const purchasedServiceController = require('../../controllers/purchased-service/purchased-service');

const router = express.Router();
const mdAuth = require('../../middlewares/authenticated');

/* *** test *** */
router.get('/test-purchased-service', mdAuth.ensureAuth, purchasedServiceController.test);
/* *** save purchased service *** */
router.post('/purchased-service', mdAuth.ensureAuth, purchasedServiceController.savePurchasedService);
/* *** get purchased services *** */
router.get('/purchased-services/:page?', mdAuth.ensureAuth, purchasedServiceController.getPurchasedServices);
/* *** get purchased services by id *** */
router.get('/purchased-service/:id?', mdAuth.ensureAuth, purchasedServiceController.getPurchasedServicesById);

module.exports = router;