'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const blogPostSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {
        firstName: String,
        lastName: String
    },
    content: {type: String},
    created: {type: String, default: Date.now}
});

blogPostSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        author: this.author,
        content: this.content,
        created: this.created
    };
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost}