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
        const availablity_check = "SELECT book_id FROM book as b WHERE b.book_id = ? AND b.copies_available > 0";
        const [res] = await db.query(availablity_check, [book_id]);
        if(res.length > 0)
        {
            const query = "UPDATE book SET copies_available = copies_available - 1 WHERE book_id =?";
            await db.query(query, [book_id]);
            const query_issue = "INSERT INTO book_issue (book_id, user_id) VALUES (?, ?)";
            await db.query(query_issue, [book_id, user_id]);
            return res.status(200).json({ message: 'Book issued successfully' });
            
        }
        else{
            // Add this request into book_request.
            const query = "INSERT INTO book_request(book_id,user_id) VALUES (?,?)";
            await db.query(query, [book_id, user_id]);
            return res.status(400).json({ message: 'No copy of this Book is available, will be issued whenever it becomes available' });
        }
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error issuing book' });
    }
})

// 3. book return.

// router.post('/return', async (req, res)=>{
//     try{
//         const { book_id, user_id } = req.body;
//         if (!book_id ||!user_id) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }
//         // Check whether this book is issued by this user or not.
//         const issue_check = "SELECT book_id FROM book_issue WHERE book_id =? AND user_id =?";
//         const [res] = await db.query(issue_check, [book_id, user_id]);
//         if(res.length == 0)
//         {
//             return res.status(400).json({ message: 'This book is not issued by this user' });
//         }
//         // Update the book's copies_available.
//         const query = "UPDATE book SET copies_available = copies_available + 1 WHERE book_id =?";
//         await db.query(query, [book_id]);
//         const query_return = "DELETE FROM book_issue WHERE book_id =? AND user_id =?";
//         await db.query(query_return, [book_id, user_id]);
//         return res.status(200).json({ message: 'Book returned successfully' });
//     }
//     catch(err){
//         console.error(err);
//         res.status(500).json({ message: 'Error returning book' });
//     }
// })

export default router;