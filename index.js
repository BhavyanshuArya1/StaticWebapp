const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const session = require('express-session');
const app = express();

// Initialize Passport
app.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub authentication strategy
passport.use(new GitHubStrategy({
    clientID: 'da0c776f0ca00197848e',
    clientSecret: 'eacef3bece5c1d181e885a11b3b718aa3031baa1',
    callbackURL: 'https://converttotoken.azurewebsites.net/api/HttpTrigger1/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // This function is called after successful authentication
    // You can perform additional operations here, such as saving user details to a database
    return done(null, profile);
  }
));

// Serialize user into the session
passport.serializeUser(function(user, done) {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Azure Function to handle GitHub authentication
module.exports = async function (context, req) {
  // Initialize Passport authentication
  passport.authenticate('github', { scope: ['user:email'] })(req, res);

  // Endpoint to receive the callback after GitHub has authenticated the user
  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );

  // Get the authentication URL and return it to the client
  const authUrl = '/auth/github';
  context.res = {
    // Set the appropriate response headers
    headers: {
      'Content-Type': 'application/json'
    },
    // Return the authentication URL
    body: { authUrl }
  };
};
