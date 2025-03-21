import express from 'express';
import db from "../db/connection.js";
// const db = require("../db/connection.js");
const router = express.Router();

// Endpoint for books
// 1. view books
router.get('/view', async (req, res)=>{
    try{
        const [rows] = await db.query('SELECT * FROM books');
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error retrieving books' });
    }
})

// 2. book issue.

router.post('/issue', async (req, res)=>{
    try{
        const { book_id, user_id } = req.body;
        if (!book_id ||!user_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        await db.query('UPDATE books SET available = 0 WHERE id =?', [book_id]);
        await db.query('INSERT INTO borrowers (book_id, user_id) VALUES (?,?)', [book_id, user_id]);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error issuing book' });
    }
})

export default router;