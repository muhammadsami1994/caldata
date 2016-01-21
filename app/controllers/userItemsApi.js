var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    usersItems = mongoose.model('usersItems'),
    productsTotal = mongoose.model('productsTotal'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    Busboy = require('connect-busboy');


module.exports = function (app) {
    app.use('/', router);
};

router.post('/userItems', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var productName = req.body.productName || req.query.productName || req.headers.productname;
    var quantity = req.body.quantity || req.query.quantity || req.headers.quantity;
    var pricePerUnit = req.body.pricePerUnit || req.query.pricePerUnit || req.headers.priceperunit;
    var date = req.body.date || req.query.date || req.headers.date;
    var month = req.body.month || req.query.month || req.headers.month;
    var year = req.body.year || req.query.year || req.headers.year;
    if (userId && productName && quantity && pricePerUnit && date && month && year) {
        var total = quantity * pricePerUnit;
        usersItems.create({
            userId: userId,
            productName: productName,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            total: total,
            date : date,
            month : month,
            year : year

        }, function (err, item) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Not Found in user item',
                    msg: 'Internal Server Error',
                    error: err
                });
            }
            else if (item != null) {
                productsTotal.findOne({
                    userId : userId,
                    date : date,
                    month : month,
                    year : year
                },function(err,data){
                    if(err){
                        res.send({
                            code: 500,
                            content: 'Not Found product total',
                            msg: 'Internal Server Error',
                            error: err
                        });
                    }else if(data != null){
                        var total = data.total + item.total;
                        productsTotal.update({
                            userId : userId,
                            date : date,
                            month : month,
                            year : year
                        },{
                            $set :{
                                total : total
                            }
                        },function(){
                            res.send({
                                code: 200,
                                content: 'Item saved successfully',
                                msg: item.productName + ' saved successfully',
                                product : item
                            });
                        })
                    }else if(data == null){
                        productsTotal.create({
                            userId : userId,
                            date : date,
                            month : month,
                            year : year,
                            total : item.total
                        },function(err,data2){
                            if(err){
                                res.send({
                                    code: 500,
                                    content: 'Not Found product total create',
                                    msg: 'Internal Server Error',
                                    error: err
                                });
                            }else if(data2 != null){
                                res.send({
                                    code: 200,
                                    content: 'Item saved successfully',
                                    msg: item.productName + ' saved successfully',
                                    product : item
                                });
                            }
                        })
                    }
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
router.post('/userItems', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var productArray = req.body.productArray || req.query.productArray || req.headers.productarray ;
    if (userId && productArray) {

    }
    else {
        res.send({
            code: 404,
            content: 'Not Found from save products array',
            msg: 'Missing Credentials'
        });
    }
});
router.get('/userItems', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var date = req.body.date || req.query.date || req.headers.date;
    var month = req.body.month || req.query.month || req.headers.month;
    var year = req.body.year || req.query.year || req.headers.year;
    if (userId && date && month && year) {
        usersItems.find({
            userId: userId,
            date : date,
            month : month,
            year : year

        }, function (err, item) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Not Found',
                    msg: 'Internal Server Error',
                    error: err
                });
            }
            else if (item != null) {
                res.send({
                    code: 200,
                    content: 'Products found',
                    products: item
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
router.post('/uploadProductImage', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var _id = req.body._id || req.query._id || req.headers._id;
    var _fstream;
    var checked = false;
    if(userId && _id){
        mkdirp('images/' + userId, function (err) {
            if (err) {
                console.error(err);
                res.send({
                    code: 500,
                    content: 'Internal Server Error',
                    msg: 'API not called properly',
                    token: req.___new__token
                });
            }
            else {
                console.log('New Directory Made!');
                console.log(req.headers['content-type']);
                if (req.busboy) {
                    req.pipe(req.busboy);
                    req.busboy.on('file', function (fieldname, file, filename) {
                        console.log("Uploading: " + filename);
                        _fstream = fs.createWriteStream("images/" + userId + '/' + filename);
                        file.pipe(_fstream);
                        _fstream.on('close', function () {
                            var imageURL = 'https://calday.herokuapp.com/getProductImage/?userId=' + userId + "&imageName=" + filename;
                            mongoose.model('usersItems').update({_id: _id},
                                {
                                    $set: {
                                        image : imageURL
                                    }
                                }, function (error, response) {

                                    if (err) {
                                        console.log('Product not found');
                                        res.send({
                                            code: 400,
                                            content: 'Bad Request',
                                            msg: 'Error! Image is not uploaded',
                                            token: req.___new__token
                                        });
                                    }
                                    else {
                                        console.log('Picture Response is sent to frontend');
                                        res.send({
                                            code: 200,
                                            content: 'OK',
                                            msg: 'Image is uploaded',
                                            imageURL : imageURL
                                        });
                                    }
                                });
                        });
                    });
                } else {
                    res.send({
                        code: 404,
                        content: 'Not Found',
                        msg: 'Image not Found in request'
                    })
                }
            }
        });
    }else{
        res.send({
            code: 404,
            content: 'Not Found',
            msg: 'Missing Credentials'
        });
    }
});
router.get('/getProductImage', function (req, res, next) {
    var _imageName = req.body.imageName || req.query.imageName || req.headers.imagename,
        userId = req.body.userId || req.query.userId || req.headers.userid,

        imageRootPath = 'images/' + userId + '/' + _imageName,
        options = {
            root: ".",
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

    res.sendFile(imageRootPath, options, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Sent:', _imageName);
        }
    });
});
router.get('/userItemsByMonth', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var month = req.body.month || req.query.month || req.headers.month;
    if (userId && month) {
        productsTotal.find({
            userId: userId,
            month : month

        }, function (err, item) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Not Found',
                    msg: 'Internal Server Error',
                    error: err
                });
            }
            else if (item != null) {
                res.send({
                    code: 200,
                    content: 'Products found',
                    products: item
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
