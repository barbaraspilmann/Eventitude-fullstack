const users = require('../controllers/user.server.controller');

module.exports = function (app) {
  app.route('/users').post(users.addUser); // For creating a new user
  app.route('/login').post(users.loginUser);
   // For logging in an existing user
  app.route('/logout').post(users.logoutUser); // For logging out a user
};