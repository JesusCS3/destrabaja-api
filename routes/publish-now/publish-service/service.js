const express = require('express');
const serviceController = require('../../../controllers/publish-now/publish-service/service');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUploadImg = multipart({uploadDir: './uploads/publish-now/publish-service/img'});
let mdUploadVideo = multipart({uploadDir: './uploads/publish-now/publish-service/video'});

/* *** test *** */
router.get('/test-service', mdAuth.ensureAuth, serviceController.test);
/* *** save service *** */
router.post('/service', mdAuth.ensureAuth, serviceController.saveService);
/* *** get services from people I follow *** */
router.get('/services-follow/:page?', mdAuth.ensureAuth, serviceController.getServices);
/* *** get projects *** */
router.get('/services/:page?', mdAuth.ensureAuth, serviceController.getServices);
/* *** get all projects *** */
router.get('/all-services/:page?', mdAuth.ensureAuth, serviceController.getAllServices);
/* *** get services by id *** */
router.get('/service/:id?', mdAuth.ensureAuth, serviceController.getServicesById);
/* *** get service purchased by id *** */
router.get('/service-purchased/:id?/:plan?', mdAuth.ensureAuth, serviceController.getServicePurchasedById);
/* *** delete service *** */
router.delete('/service/:id?', mdAuth.ensureAuth, serviceController.deleteService);
/* *** update service data *** */
router.put('/update-service/:id', mdAuth.ensureAuth, serviceController.updateService);
/* *** update status service *** */
router.put('/update-status-service/:id', mdAuth.ensureAuth, serviceController.updateStatusService);
/* *** upload img file *** */
router.post('/upload-img-service/:id', [mdAuth.ensureAuth, mdUploadImg], serviceController.uploadImage);
/* *** get img file *** */
router.get('/get-img-service/:imageFile', serviceController.getImageFile);
/* *** upload video file *** */
router.post('/upload-video-service/:id', [mdAuth.ensureAuth, mdUploadVideo], serviceController.uploadVideo);
/* *** get video file *** */
router.get('/get-video-service/:videoService', serviceController.getVideoFile);

module.exports = router;