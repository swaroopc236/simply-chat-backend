const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    auth_displayname: String,
    app_displayname: String,
    auth_type: String,
    auth_id: String,
    email: String,
    pwd: String,
    display_picture_url: String,
    isEmailVerified: Boolean
})

const User = mongoose.model('User', userSchema);

module.exports = User;