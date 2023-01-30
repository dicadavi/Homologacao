const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: '35.232.74.157',
    user: 'redash',
    password: 'QP74AN5YKPKHUQQD',
    database: 'prod_icv_db'
});


pool.query(`select * from User u limit 5`, (err, res) => { return console.log(res) })