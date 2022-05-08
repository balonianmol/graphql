const sequelize = require('../db/db')
const {Sequelize} = require("sequelize")
        const userRegistration = sequelize.define('user', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
              },
            userName: { type: Sequelize.STRING, unique: true },
            password: { type: Sequelize.STRING },
            email: { type: Sequelize.STRING, unique: true },
            firstname: { type: Sequelize.STRING },
            lastname: { type: Sequelize.STRING },
        });
        userRegistration.sync();
module.exports=userRegistration;