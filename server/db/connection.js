import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
// Create a MySQL pool connection
const db = mysql.createPool({
    host: process.env.URL,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATA_BASE
}).promise();

export default db;