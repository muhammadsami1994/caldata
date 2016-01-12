var express  = require('express'),
    router   = express.Router(),
    mongoose = require('mongoose'),
    users = mongoose.model('users');


module.exports = function (app) {
    app.use('/', router);
};

router.post('/signUp', function (req, res, next) {

    var userId  = req.body.userId || req.query.userId || req.headers.userId;
    var email  = req.body.email || req.query.email || req.headers.email;
    var password  = req.body.password || req.query.password || req.headers.password;

    if(userId && email && password)
    {
        users.create({userId:userId, email:email, password:password}, function (err,userData) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Not Found',
                    msg: err.errors
                });
            }
            else if (userData != null) {
                res.send({
                    code: 201,
                    content: 'Sign Up successful',
                    msg: 'User created successfully'
                });
            }
            else{
                res.send({
                    code: 404,
                    content: 'Appointment Not Found',
                    msg: 'Not found'
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
