
const express = require('express');
const userController = require('../../controllers/user/user');

const router = express.Router();
const mdAuth = require('../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUpload = multipart({uploadDir: './uploads/users/img'});

/* *** test *** */
router.get('/test', mdAuth.ensureAuth, userController.test);
router.get('/home', userController.home);

/* *** signup *** */
router.post('/signup', userController.saveUser);
/* *** signin *** */
router.post('/signin', userController.loginUser);
/* *** get user *** */
router.get('/user/:id', mdAuth.ensureAuth, userController.getUser);
/* *** get paginated users *** */
router.get('/users/:page?', mdAuth.ensureAuth, userController.getUsers);
/* *** get counters *** */
router.get('/counters/:id?', mdAuth.ensureAuth, userController.getCounters);
/* *** update user data *** */
router.put('/update-user/:id', mdAuth.ensureAuth, userController.updateUser);
/* *** upload img file *** */
router.post('/upload-img-user/:id', [mdAuth.ensureAuth, mdUpload], userController.uploadImage);
/* *** get img file *** */
router.get('/get-img-user/:imageFile', userController.getImageFile);
/* *** new password *** */
router.put('/new-password', mdAuth.ensureAuth, userController.newPassword);

module.exports = router;