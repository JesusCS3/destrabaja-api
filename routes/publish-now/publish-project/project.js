const express = require('express');
const projectController = require('../../../controllers/publish-now/publish-project/project');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUpload = multipart({uploadDir: './uploads/publish-now/publish-project'});

/* *** test *** */
router.get('/test-project', mdAuth.ensureAuth, projectController.test);
/* *** save project *** */
router.post('/project', mdAuth.ensureAuth, projectController.saveProject);
/* *** get project by id *** */
router.get('/project/:id?', mdAuth.ensureAuth, projectController.getProjectsById);
/* *** delete project *** */
router.delete('/project/:id?', mdAuth.ensureAuth, projectController.deleteProject);
/* *** update project data *** */
router.put('/update-project/:id', mdAuth.ensureAuth, projectController.updateProject);

module.exports = router;