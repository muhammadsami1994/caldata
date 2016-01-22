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
    var dayTotal = req.body.dayTotal || req.query.dayTotal || req.headers.daytotal;
    if (userId && productName && quantity && pricePerUnit && date && month && year && req.body.dayTotal>=0 ) {
        var total = quantity * pricePerUnit;
        var _time = new Date(),
            _randomNumber = '',
            _possibleValues = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()abcdefghijklmnopqrstuvwxyz' + _time.getTime();
            for(var i=0; i< 6; i++) {
                _randomNumber += _possibleValues.charAt(Math.floor(Math.random() * _possibleValues.length));
                if(i==5){
                break
                }
            }
        usersItems.update({
                userId : userId
            },
            { $push: {userProduct :{
                productID : _randomNumber,
                productName: productName,
                quantity: quantity,
                pricePerUnit: pricePerUnit,
                total: total,
                date : date,
                month : month,
                year : year
            }} },
            {upsert : true}
            ,function(err,updatedProd){
                if(err){
                    res.send({
                        code: 500,
                        content: 'Api not called',
                        msg: 'Internal Server Error',
                        error: err
                    });
                }
                else if(updatedProd.n == 1){
                    productsTotal.findOne({
                        userId : userId
                    }, function (err,product) {
                        if(err){
                            res.send({
                                code: 500,
                                content: 'Api not called',
                                msg: 'Internal Server Error',
                                error: err
                            });
                        }else if(product != null){
                            productsTotal.update({
                                    userId : userId,
                                    userProductTotal : {
                                        $elemMatch :{
                                            date : date,
                                            month : month,
                                            year : year
                                        }
                                    }
                                },
                                { $set: {
                                    "userProductTotal.$.total" : req.body.dayTotal
                                }
                                }, function (err,total) {
                                    if(err){
                                        res.send({
                                            code: 500,
                                            content: 'Api not called',
                                            msg: 'Internal Server Error',
                                            error: err
                                        });
                                    }else if(total.n == 1){
                                        var product = {
                                            productID : _randomNumber,
                                            productName: productName,
                                            quantity: quantity,
                                            pricePerUnit: pricePerUnit,
                                            total: quantity *pricePerUnit,
                                            date : date,
                                            month : month,
                                            year : year
                                        };
                                        res.send({
                                            code: 200,
                                            content: 'Saved Successfully',
                                            msg: 'OK',
                                            product : product
                                        });
                                    }else if(total.n == 0){
                                        res.send({
                                            code: 400,
                                            content: 'Bad Request',
                                            msg: 'Product Total not updated'
                                        });
                                    }
                                });
                        }
                        else if(product == null){
                            productsTotal.create({
                                userId: userId,
                                userProductTotal :[{
                                    date : date,
                                    month : month,
                                    year : year,
                                    total : total
                                }]

                            },function(err, total){
                                if(err){
                                    res.send({
                                        code: 500,
                                        content: 'Api not called',
                                        msg: 'Internal Server Error',
                                        error: err
                                    });
                                }else if(total != null){
                                    var product = {
                                        productID : _randomNumber,
                                        productName: productName,
                                        quantity: quantity,
                                        pricePerUnit: pricePerUnit,
                                        total: quantity *pricePerUnit,
                                        date : date,
                                        month : month,
                                        year : year
                                    };
                                    res.send({
                                        code: 200,
                                        content: 'Saved Successfully',
                                        msg: 'OK',
                                        product : product
                                    });
                                }else if(total == null){
                                    res.send({
                                        code: 400,
                                        content: 'Bad Request',
                                        msg: 'Product Total not updated'
                                    });
                                }
                            })
                        }
                    })
                }
                else if(updatedProd.n == 0){
                    res.send({
                        code: 400,
                        content: 'Bad Request',
                        msg: 'Product Total not updated'
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
router.get('/userItems', function (req, res, next) {
    var userId = req.body.userId || req.query.userId || req.headers.userid;
    var date = req.body.date || req.query.date || req.headers.date;
    var month = req.body.month || req.query.month || req.headers.month;
    var year = req.body.year || req.query.year || req.headers.year;
    if (userId && date && month && year) {
        usersItems.find({
            userId: userId,
            userProduct : {
                $elemMatch:{
                    date : date,
                    month : month,
                    year : year
                }
            }

        }, function (err, item) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Api not called',
                    msg: 'Internal Server Error',
                    error: err
                });
            }
            else if (item[0] != null) {
                res.send({
                    code: 200,
                    content: 'Products found',
                    products: item
                });
            }else{
                res.send({
                    code: 404,
                    content: 'Products not Found'
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
    var productID = req.body.productID || req.query.productID || req.headers.productid;
    var _fstream;
    var checked = false;
    if(userId && productID){
        mkdirp('images/' + userId, function (err) {
            if (err) {
                console.error(err);
                res.send({
                    code: 500,
                    content: 'Internal Server Error',
                    msg: 'API not called properly'
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
                            mongoose.model('usersItems').update({
                                    userId : userId,
                                    userProduct : {
                                        $elemMatch :{
                                            productID : productID
                                        }
                                    }
                                },
                                {
                                    $set: { "userProduct.$.image" : imageURL}

                                }, function (error, response) {

                                    if (error) {
                                        res.send({
                                            code: 500,
                                            content: 'Api not called',
                                            msg: 'Internal Server error',
                                            err : error
                                        });
                                    }
                                    else if(response.n == 1){
                                        console.log('Picture Response is sent to frontend');
                                        res.send({
                                            code: 200,
                                            content: 'OK',
                                            msg: 'Image is uploaded',
                                            imageURL : imageURL
                                        });
                                    }else{
                                        res.send({
                                            code: 400,
                                            content: 'Bad Request',
                                            msg: 'Product Total not updated'
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
            userProductTotal : {
                $elemMatch:{
                    month : month
                }
            }
        }, function (err, item) {
            if (err) {
                res.send({
                    code: 500,
                    content: 'Api not called',
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
