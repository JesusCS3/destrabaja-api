const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Project = require('../../../models/publish-now/publish-project/project');
const User = require('../../../models/user/user');
const Follow = require('../../../models/user/follow/follow');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from project!'
    });
}

module.exports = {
    test
}