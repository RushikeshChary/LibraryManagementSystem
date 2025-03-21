import express from 'express';
import bcrypt from 'bcrypt';
import db from "../db/connection.js";
// const db = require("../db/connection.js");
const router = express.Router();

// Endpoint for login
router.post('/login', async (req, res) => {
    try {
        const {email, password } = req.body;
        if (!email ||!password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        try{
            const [rows] = await db.query('SELECT email,password FROM users WHERE email =?', [email]);
            if(rows.length > 0){
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing email' });
        }
        if(password != rows[0].password)
        {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        else
        {
            return res.status(200).json({ message:`Welcome ${rows[0].name}! You have successfully logged in. Your unique ID is ${rows[0].id}.` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error login' });
    }
});

// Endpoint for registration
router.post('/register', async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if (!name ||!email ||!password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        try{
            const [rows] = await db.query('SELECT email FROM users WHERE email =?', [email]);
            if(rows.length > 0){
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing email' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hashedPassword]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering' });
    }
})

export default router;