var express = require('express');
var userController = require('../controller/user.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();
api.post('/commands', mdAuth.ensureAuth, userController.commands);

module.exports = api;