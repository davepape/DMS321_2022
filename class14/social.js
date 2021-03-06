const path = require('path');
const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function socialFeed(req, res) {
    let s = JSON.stringify(req.session, null, 4);
    let output = `<p>Welcome, ${req.session.user.fullname}.</p><pre>${s}</pre>`;
    output += `<a href="/social/logout">log out</a>`;
    res.send(makeHTMLPage(output));
    }


function socialLoginPage(req, res) {
    res.sendFile('static/loginpage.html', { root: path.join(__dirname) });
    }


function socialHome(req, res) {
    if (req.session.user)
        socialFeed(req, res);
    else
        socialLoginPage(req, res);
    }


function socialLogin(req, res) {
    client.connect(function (err) {
            if (err) { throw err; }
            let collection = client.db("social").collection("users");
            let query = { username: new RegExp(`^${req.body.username}$`,'i') };
            collection.findOne(query, function (err,result) {
                if (err) { response.send(err); }
                if ((result) && (req.body.password == result.password)) {
                    req.session.user = result;
                    res.redirect('/social');
                    }
                else {
                    res.redirect('/social/loginerror');
                    }
                client.close();
                });
            });
    }


function socialLoginerror(req, res) {
    res.sendFile('static/loginerror.html', { root: path.join(__dirname) });
    }


function socialLogout(req, res) {
    req.session.destroy(function (err) {
        if (err) { throw err; }
        res.redirect('/social');
        });
    }

const express = require('express');
let router = express.Router();

router.get('/social', socialHome);
router.post('/social/login', socialLogin);
router.get('/social/logout', socialLogout);
router.get('/social/loginerror', socialLoginerror);

module.exports = router;
