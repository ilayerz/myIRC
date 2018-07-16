var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/User");

var userController = {};

// Restrict access to root page
userController.home = function(req, res) {
    res.render('index', { user : req.user });
};

// Go to registration page
userController.register = function(req, res) {
    res.render('register');
};

// Post registration
userController.doRegister = function(req, res) {
    User.register(new User({ email : req.body.email, username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }
        
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
};

// Go to login page
userController.login = function(req, res) {
    res.render('login');
};

//go chat after login and send username to server
userController.chat = function(req, res) {
    if (req.user) {
        //res.send(req.user.username);
        res.render("chat", {
            user: req.user.username
        });
        //res.sendFile('index.html',  { root: '.' });
    } else {
        res.redirect('/login');
    }
    
};

// Post login
userController.doLogin = function(req, res) {
    passport.authenticate('local')(req, res, function () {
        res.redirect('/chat');
    });
};

userController.update = function(req, res){
    if (req.user) {
    res.render("update", {
        user : req.user,
        username: req.user.username,
        email: req.user.email,
    });
    }else{
        res.redirect('/login');
    }
}

userController.doUpdate = function(req,res){
    
    User.find({username: req.user.username}).updateOne({username: req.body.username, email: req.body.email}, function(err, todo){
        if (err) return res.status(500).send(err);
                res.redirect('/');
    })
}

// logout
userController.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};

module.exports = userController;