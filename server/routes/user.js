import express from 'express';
import bcrypt from 'bcrypt';
import db from "../db/connection.js";
// const db = require("../db/connection.js");
const router = express.Router();

// Endpoint for login
router.post('/login', async (req, res) => {
    try {
        const {email, password } = req.body;
        var rows = [];
        if (!email ||!password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        try{
            [rows] = await db.query('SELECT * FROM user WHERE email =?', [email]);
            if(rows.length == 0){
                return res.status(200).json({ message: 'Email does not exist! Please register...' });
            }
        }
        catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing email' });
        }
        //compare password with bcrypt password.
        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        else
        {
            return res.status(200).json({ message:`Welcome ${rows[0].name}! You have successfully logged in. Your unique ID is ${rows[0].user_id}.` });
            // return res.status(200).json(rows[0]);
        }
        // if(password != rows[0].password)
        // {
        //     return res.status(400).json({ message: 'Incorrect password' });
        // }
        // else
        // {
        //     // return res.status(200).json({ message:`Welcome ${rows[0].name}! You have successfully logged in. Your unique ID is ${rows[0].user_id}.` });
        //     return res.status(200).json(rows[0]);
        // }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error login' });
    }
});

// Endpoint for registration
router.post('/register', async (req, res) => {
    try{
        const { name, email, password, mobile_no } = req.body;
        if (!name ||!email ||!password || !mobile_no) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        //check if these mobile_no or email already exists.
        try{
            const [rows] = await db.query('SELECT email FROM user WHERE email =?', [email]);
            if(rows.length > 0){
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing email' });
        }
        try{
            const [rows] = await db.query('SELECT mobile_no FROM user WHERE mobile_no =?', [mobile_no]);
            if(rows.length > 0){
                return res.status(400).json({ message: 'Mobile number already exists' });
            }
        }
        catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing mobile number' });
        }
        
        //hash the password before storing it in the database.
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO user (name, email, password,mobile_no) VALUES (?,?,?,?)', [name, email, hashedPassword,mobile_no]);
        return res.status(200).json({ message:`User ${name} has been registered successfully. Please log in to continue.` });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering... Possibly due to duplicate mobile_no/email' });
    }
})

export default router;