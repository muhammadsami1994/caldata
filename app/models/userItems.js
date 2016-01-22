var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator');

var usersItems = new Schema({
    userId : {type : String},
    userProduct : [{
    productID : {type : String},
    productName : {type : String},
    quantity: {type : Number},
    pricePerUnit : { type : Number},
    total : {type : Number},
    image : {type : String},
    date : { type : Number},
    month : { type : Number},
    year : { type : Number}
    }]
});

mongoose.model('usersItems', usersItems );