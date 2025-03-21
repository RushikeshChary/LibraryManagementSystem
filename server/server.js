import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import user from "./routes/user.js";
import book from "./routes/book.js";
import db from "./db/connection.js";

const app = express();
const Port = process.env.PORT || 8080;
// Test database connection and start server
db.getConnection()
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

app.use('/user',user);

app.use('/book', book);















//Just to test whether database is working properly.
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving users' });
    }
});





