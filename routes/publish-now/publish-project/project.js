const express = require('express');
const projectController = require('../../../controllers/publish-now/publish-project/project');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUploadImg = multipart({uploadDir: './uploads/publish-now/publish-project/img'});
let mdUploadVideo = multipart({uploadDir: './uploads/publish-now/publish-project/video'});
let mdUploadFiles = multipart({uploadDir: './uploads/publish-now/publish-project/pdf'});

/* *** test *** */
router.get('/test-project', mdAuth.ensureAuth, projectController.test);
/* *** save project *** */
router.post('/project', mdAuth.ensureAuth, projectController.saveProject);
/* *** get projects *** */
router.get('/projects/:page?', mdAuth.ensureAuth, projectController.getProjects);
/* *** get all projects *** */
router.get('/all-projects/:page?', projectController.getAllProjects);
/* *** get project by id *** */
router.get('/project/:id?', mdAuth.ensureAuth, projectController.getProjectsById);
/* *** delete project *** */
router.delete('/project/:id?', mdAuth.ensureAuth, projectController.deleteProject);
/* *** update project data *** */
router.put('/update-project/:id', mdAuth.ensureAuth, projectController.updateProject);
/* *** update status project *** */
router.put('/update-status-project/:id', mdAuth.ensureAuth, projectController.updateStatusProject);
/* *** upload img file *** */
router.post('/upload-img-project/:id', [mdAuth.ensureAuth, mdUploadImg], projectController.uploadImage);
/* *** get img file *** */
router.get('/get-img-project/:imageFile', projectController.getImageFile);
/* *** upload video file *** */
router.post('/upload-video-project/:id', [mdAuth.ensureAuth, mdUploadVideo], projectController.uploadVideo);
/* *** get video file *** */
router.get('/get-video-project/:videoFile', projectController.getVideoFile);
/* *** upload resumesummary file *** */
router.post('/upload-files-project/:id', [mdAuth.ensureAuth, mdUploadFiles], projectController.uploadFiles);
/* *** get resumesummary file *** */
router.get('/get-files-project/:filesProject', projectController.getFiles);

module.exports = router;