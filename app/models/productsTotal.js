var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator');

var productsTotal = new Schema({
    userId : {type : String},
    date : { type : Number},
    month : { type : Number},
    year : { type : Number},
    total : { type : Number}
});

mongoose.model('productsTotal', productsTotal);