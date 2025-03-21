
import mysql from 'mysql2';
import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

// Create a MySQL pool connection
const pool = mysql.createPool({
    host: process.env.URL,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATA_BASE
}).promise();

const Port = process.env.PORT || 3000;
// Test database connection and start server
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
        app.listen(Port, () => {
            console.log(`Server running on port http://localhost:${Port}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to get all users from table users

app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving users' });
    }
});

// Endpoint to add a new user to table users

app.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await pool.query('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, password]);
        res.status(201).json({ message: 'User added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding user' });
    }
});


