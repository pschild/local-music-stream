const routes = require('express').Router();
const searchRoutes = require('./search/index');
const playRoutes = require('./play/index');

routes.use(`/search`, searchRoutes);
routes.use(`/play`, playRoutes);

module.exports = routes;