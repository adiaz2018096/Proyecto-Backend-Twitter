var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tweetSchema = Schema({
    text:String,
    user: [{type: Schema.Types.ObjectId, ref: 'user'}]
});

module.exports = mongoose.model('tweet', tweetSchema);