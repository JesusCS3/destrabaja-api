const express = require('express');
const followController = require('../../../controllers/user/follow/follow');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

/* *** test *** */
router.get('/test-follow', mdAuth.ensureAuth, followController.test);
/* *** save follow *** */
router.post('/follow', mdAuth.ensureAuth, followController.saveFollow);
/* *** delete follow *** */
router.delete('/follow/:id', mdAuth.ensureAuth, followController.deleteFollow);
/* *** get following users *** */
router.get('/following/:id?/:page:?', mdAuth.ensureAuth, followController.getFollowingUsers);
/* *** get followed users *** */
router.get('/followed/:id?/:page:?', mdAuth.ensureAuth, followController.getFollowedUsers);
/* *** get user list *** */
router.get('/get-my-follows/:followed?', mdAuth.ensureAuth, followController.getMyFollows);

module.exports = router;