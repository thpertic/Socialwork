const mongoose = require('mongoose');
const db = require('./index');

const postSchema = {
    authorId: db.ObjectId,
    content: String,
    created: Date,
    upvotes: Number,
    downvotes: Number,
};

const Post = mongoose.model("Post", postSchema);
module.exports = Post;