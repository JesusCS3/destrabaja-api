const express = require('express');
const chimeIntegrationController = require('../../controllers/chime-integration/chime-integration');

const router = express.Router();
const mdAuth = require('../../middlewares/authenticated');

/* *** test *** */
router.get('/test-chime', mdAuth.ensureAuth, chimeIntegrationController.test);

/* *** create checkout session *** */
router.post('/videocall', mdAuth.ensureAuth, chimeIntegrationController.createVideoCall);

module.exports = router;