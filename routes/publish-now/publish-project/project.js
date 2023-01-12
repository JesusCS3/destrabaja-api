const express = require('express');
const projectController = require('../../../controllers/publish-now/publish-project/project');

const router = express.Router();
const mdAuth = require('../../../middlewares/authenticated');

const multipart = require('connect-multiparty');
let mdUpload = multipart({uploadDir: './uploads/publish-now/publish-project'});

/* *** test *** */
router.get('/test-project', mdAuth.ensureAuth, projectController.test);

module.exports = router;