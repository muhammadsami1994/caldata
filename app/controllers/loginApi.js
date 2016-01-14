var express  = require('express'),
    router   = express.Router(),
    mongoose = require('mongoose'),
    users = mongoose.model('users');


module.exports = function (app) {
    app.use('/', router);
};

router.post('/login', function (req, res, next) {

    var userId  = req.body.userId || req.query.userId || req.headers.userid;
    var password  = req.body.password || req.query.password || req.headers.password;

    if(userId && password)
    {

        users.findOne({userId:userId, password:password}, function (err,userData) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Not Found',
                    msg: 'Internal Server Error'
                });
            }
            else if (userData != null) {
                res.send({
                    code: 200,
                    content: 'Login Successful',
                    msg: 'User logged in successfully'
                });
            }
            else{
                res.send({
                    code: 404,
                    content: 'Not Found',
                    msg: 'User with this userId and password does not exist you might misspelled them'
                });
            }
        })
    }
    else {
        res.send({
            code: 404,
            content: 'Not Found',
            msg: 'Missing Credentials'
        });
    }
});