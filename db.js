const config = require('./config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.db, {
    logging: false
});

const Name = sequelize.define('Name', {
    name: Sequelize.STRING
});

sequelize.sync({ force: true });

module.exports = { Name, sequelize };