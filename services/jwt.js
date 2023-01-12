const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'destrabaja_is_the_best_application_for_offering_solutions';

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        username: user.username,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(30,'days').unix
    };

    return jwt.encode(payload, secret);
};