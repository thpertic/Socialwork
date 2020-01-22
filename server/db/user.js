const mongoose = require('mongoose');

const userSchema = {
    email: String,
    username: String,
    password: String,
    upvotes: [],
    downvotes: []
};

const User = mongoose.model("User", userSchema);
module.exports = User;