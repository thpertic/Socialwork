const mongoose = require('mongoose');

const userSchema = {
    email: String,
    username: String,
    password: String
};

const User = mongoose.model("User", userSchema);
module.exports = User;