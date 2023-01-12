
const express = require('express');
const userController = require('../../controllers/user/user');

const router = express.Router();
const md_auth = require('../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let md_upload = multipart({uploadDir: './uploads/users'});

/* *** test *** */
router.get('/test', md_auth.ensureAuth, userController.test);
router.get('/home', userController.home);

/* *** signup *** */
router.post('/signup', userController.saveUser);
/* *** signin *** */
router.post('/signin', userController.loginUser);
/* *** get user *** */
router.get('/user/:id', md_auth.ensureAuth, userController.getUser);
/* *** get paginated users *** */
router.get('/users/:page?', md_auth.ensureAuth, userController.getUsers);
/* *** get counters *** */
router.get('/counters/:id?', md_auth.ensureAuth, userController.getCounters);
/* *** update user data *** */
router.put('/update-user/:id', md_auth.ensureAuth, userController.updateUser);
/* *** upload img file *** */
router.post('/upload-img-user/:id', [md_auth.ensureAuth, md_upload], userController.uploadImage);
/* *** get img file *** */
router.get('/get-img-user/:imageFile', userController.getImageFile);

module.exports = router;