const mysql = require('mysql2');
require('dotenv').config();
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'cartdb'

});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});
module.exports = db;