const db = require('./db')
const Registro = db.sequelize.define('cadastros', {
    id:{
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    password:{
        type: db.Sequelize.STRING,
        allowNull: false
    }
})
//Registro.sync({force:true})
module.exports = Registro