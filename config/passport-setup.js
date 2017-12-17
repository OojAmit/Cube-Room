const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const GitHubStrategy = require('passport-github').Strategy;
const keys = require('./keys');
const User = require('../models/user')

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user))
})

passport.use(
  new GoogleStrategy({
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({googleId: profile.id}).then((currentUser) => {
      if (currentUser) {
        console.log('User already in the DB');
        done(null, currentUser)
      } else {
        new User({
          username: profile.displayName,
          googleId: profile.id,
          email: profile.emails[0].value,
          thumbnail: profile._json.image.url
        }).save().then(newUser => done(null, newUser))
      }

    })
  })
)

passport.use(
  new GitHubStrategy({
    clientID: keys.github.clientID,
    clientSecret: keys.github.clientSecret,
    callbackURL: "/auth/github/redirect"
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({githubId: profile.id}).then((currentUser) => {
      if (currentUser) {
        console.log('User already in the DB');
        done(null, currentUser)
      } else {
        new User({
          username: profile.displayName,
          githubId: profile.id,
          email: profile.emails[0].value,
          thumbnail: profile._json.avatar_url
        }).save().then(newUser => done(null, newUser))
      }

    })
  })
)
