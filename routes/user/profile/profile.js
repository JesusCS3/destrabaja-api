const express = require('express');
const profileController = require('../../../controllers/user/profile/profile');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUploadImg = multipart({uploadDir: './uploads/users/profile/img'});
let mdUploadVideo = multipart({uploadDir: './uploads/users/profile/video'});
let mdUploadResumeSummary = multipart({uploadDir: './uploads/users/profile/pdf/resumeSummaryFile'});
let mdUploadPreviousWork = multipart({uploadDir: './uploads/users/profile/pdf/previousWork'});

/* *** test *** */
router.get('/test-profile', mdAuth.ensureAuth, profileController.test);
/* *** save profile *** */
router.post('/profile', mdAuth.ensureAuth, profileController.saveProfile);
/* *** delete profile *** */
router.delete('/profile/:id?', mdAuth.ensureAuth, profileController.deleteProfile);
/* *** update profile data *** */
router.put('/update-profile/:id', mdAuth.ensureAuth, profileController.updateProfile);
/* *** get profile *** */
router.get('/get-profile/:id?', mdAuth.ensureAuth, profileController.getProfile);
/* *** upload img file *** */
router.post('/upload-img-profile/:id', [mdAuth.ensureAuth, mdUploadImg], profileController.uploadImage);
/* *** get img file *** */
router.get('/get-img-profile/:imageFile', profileController.getImageFile);
/* *** upload video file *** */
router.post('/upload-video-profile/:id', [mdAuth.ensureAuth, mdUploadVideo], profileController.uploadVideo);
/* *** get video file *** */
router.get('/get-video-profile/:videoFile', profileController.getVideoFile);
/* *** upload resumesummary file *** */
router.post('/upload-resumesummary-profile/:id', [mdAuth.ensureAuth, mdUploadResumeSummary], profileController.uploadResumesummary);
/* *** get resumesummary file *** */
router.get('/get-resumesummary-profile/:resumesummaryFile', profileController.getResumesummaryFile);
/* *** upload resumesummary file *** */
router.post('/upload-previous-work-profile/:id', [mdAuth.ensureAuth, mdUploadPreviousWork], profileController.uploadPreviousWork);
/* *** get resumesummary file *** */
router.get('/get-previous-work-profile/:previousWork', profileController.getPreviousWorkFile);

module.exports = router;