const mysql = require('mysql2');
const {database} = require('./keys.js');
const {promisify} = require('util');

const pool = mysql.createPool(database);

pool.getConnection((err, connection)=>{
    if(err){
        if (err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('DATABASE CONNECTION WAS CLOSED');
        }
        if (err.code === 'ER_CON_COUNT_ERROR'){
            console.error('DATABASE HAS TOO MANY CONNECTIONS');
        }
        if (err.code === 'ECONNREFUSED'){
            console.error('DATABASE CONNECTION WAS REFUSED');
        }
    }
    if (connection){
        connection.release();
    } 
    console.log('DB IS CONNECTED');
    return;
});

// promisify pool query (callbacks)
pool.query = promisify(pool.query);

module.exports = pool;