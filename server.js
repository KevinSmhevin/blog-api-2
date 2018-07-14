'use strict';
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
// adding a comment

const app = express();

//log http 
app.use(morgan('common'));
app.use(express.json());

//use es6 promises
mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://kevinparas:k123456@ds233571.mlab.com:33571/blog-api', { useNewUrlParser: true })


const { PORT, DATABASE_URL } = require("./config");
const { BlogPost } = require("./models")
app.get('/posts', (req, res) => {
    BlogPost
    .find()
    .then(posts => {
        res.json(posts.map(post => post.serialize()))
    })
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: 'Internal Service Error'});
        });
})
app.get('/posts/:id', (req, res) => {
    BlogPost
    .findById(req.params.id)
    .then(post => {
        res.json(post.serialize())
    })
})
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i=0; i < requiredFields.length; i++) {
        if(!(requiredFields[i] in req.body)) {
            const message = ` Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    BlogPost
    .create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err)
        res.status(500).json({ error: 'Something Went Wrong'})
    })
})
app.put('/posts/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and body id values do not match'
        });
    }
    const updated = {}; 
    const updatableFields = ["title", "content", "author"]
    updatableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });
    BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated}, {upsert: true, new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something Went Wrong'}))
})

app.delete('/posts/:id', (req, res) => {
    BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
        console.log(`Deleted blog post with ID: ${req.params.id}`)
        res.status(204).end();
    })
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: 'Internal Service Error'});
        });
})
let server;

function runServer(databaseURL, port = PORT) {
    console.log(databaseURL)
    return new Promise((resolve, reject)=> {
        mongoose.connect(databaseURL, err => {
            if (err) {
            }
            console.log("PORT =================== ", port);
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
        })
    })
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise ((resolve, reject) => {
            console.log('closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        })
    })
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer}