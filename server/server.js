var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var User = require('./models/users');

var FACEBOOK_APP_ID = "1552672764973369";
var FACEBOOK_APP_SECRET = "227ee464d1edba48d808889dde6e61f7";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.findOne({'username': profile.displayName}, function(err, user){
        if(err)
          return done(err);
        if(user)
          return done(null, user);
        else {
          var newUser = new User();
          newUser.username = profile.displayName;
          newUser.password = profile.id;

          newUser.save(function(err){
            if(err)
              throw err;
            return done(null, newUser);
          })
        }
      });
    });
  }
));

var app = express();
var port = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({secret: '1234567890QWERTY'}));
require('./routers/router.js')(app, express);
app.use(express.static(__dirname+'/../public'));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
  }
);

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/api/login' }),
  function(req, res) {
    res.redirect('/#/signin');
  });

app.listen(port);
console.log('Listening on ' + port);
module.exports = app; 