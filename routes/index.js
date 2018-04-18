const routes = require('express').Router();
const searchRoutes = require('./search');
const playRoutes = require('./play');

routes.use(`/search`, searchRoutes);
routes.use(`/play`, playRoutes);

module.exports = routes;