import express from 'express';
import db from "../db/connection.js";
// const db = require("../db/connection.js");
const router = express.Router();

// Endpoint for searching books.
router.get('/category/:cat_name', async (req, res)=>{
    try{
        const { cat_name } = req.params;
        const query = "SELECT book_id, book_title FROM book as b,category as c WHERE b.category_id = c.category_id AND c.category_name =?";
        const [rows] = await db.query(query,[cat_name]);
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error retrieving books' });
    }
})

router.get('/title/:title_name',async (req,res)=>{
    try{
        const { title_name } = req.params;
        const query = "SELECT book_id, book_title FROM book WHERE book_title =?"
        const [rows] = await db.query(query, [title_name]);
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error retrieving books' });
    }
})

router.get('/author/:author_name',async (req,res)=>{
    try{
        const { author_name } = req.params;
        const query = "SELECT b.book_id, b.book_title FROM book as b, book_author as ba, author as a WHERE b.book_id = ba.book_id AND a.author_id = ba.author_id AND a.author_name =?";
        const [rows] = await db.query(query, [author_name]);
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