const express = require('express');
const chimeIntegrationController = require('../../controllers/chime-integration/chime-integration');

const router = express.Router();
const mdAuth = require('../../middlewares/authenticated');

/* *** test *** */
router.get('/test-chime', mdAuth.ensureAuth, chimeIntegrationController.test);

/* *** create meeting session *** */
router.post('/videocall', mdAuth.ensureAuth, chimeIntegrationController.createVideoCall);
/* *** create delete meeting session *** */
router.post('/deleteVideocall', mdAuth.ensureAuth, chimeIntegrationController.deleteVideoCall);
/* *** create attendee *** */
router.post('/deleteAttendee', mdAuth.ensureAuth, chimeIntegrationController.deleteAttendee);

module.exports = router;