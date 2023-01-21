const express = require('express');
const servicePlansController = require('../../../controllers/publish-now/publish-service/servicePlans');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

/* *** test *** */
router.get('/test-service-plan-one', mdAuth.ensureAuth, servicePlansController.test);
/* *** save service plans *** */
router.post('/service-plans', mdAuth.ensureAuth, servicePlansController.saveServicePlans);

module.exports = router;