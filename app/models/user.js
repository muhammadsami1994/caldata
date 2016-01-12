var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator');

var users = new Schema({
    userId : {type : String,required : true, index: true,unique:true},
    email: {type : String, required : true, index: true,  unique:true},
    password : {type : String}
});

mongoose.model('users', users);

users.plugin(uniqueValidator);