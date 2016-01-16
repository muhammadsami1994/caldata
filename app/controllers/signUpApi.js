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
                    content: 'Error',
                    msg: err.errors
                });
            }
            else if (userData != null) {
                res.send({
                    code: 200,
                    content: 'Sign Up successful',
                    msg: 'User created successfully'
                });
            }
            else{
                res.send({
                    code: 404,
                    content: 'Error',
                    msg: 'Error in creation'
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
