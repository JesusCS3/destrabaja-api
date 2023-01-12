const express = require('express');
const messageController = require('../../../controllers/user/message/message');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUpload = multipart({uploadDir: './uploads/publish-now/publish-project'});

/* *** test *** */
router.get('/test-message', mdAuth.ensureAuth, messageController.test);
/* *** save message *** */
router.post('/message', mdAuth.ensureAuth, messageController.saveMessage);
/* *** get received message *** */
router.get('/my-messages/:page?', mdAuth.ensureAuth, messageController.getReceivedMessages);
/* *** get sent message *** */
router.get('/messages/:page?', mdAuth.ensureAuth, messageController.getSentMessages);
/* *** unviewed message *** */
router.get('/unviewed-messages', mdAuth.ensureAuth, messageController.unviewedMessages);
/* *** set viewed message *** */
router.get('/set-viewed-messages', mdAuth.ensureAuth, messageController.setViewedMessages);

module.exports = router;