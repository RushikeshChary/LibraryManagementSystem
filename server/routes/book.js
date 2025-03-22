import express from 'express';
import db from "../db/connection.js";
// const db = require("../db/connection.js");
const router = express.Router();

// Function to get current date in the format "YYYY-MM-DD"

function get_date() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

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
        // Check whether this user has already issued this book or not.
        const query_check = "SELECT book_id FROM book_issue WHERE book_id =? AND user_id =?";
        const [result] = await db.query(query_check, [book_id, user_id]);
        if(result.length > 0){
            return res.status(400).json({ message: 'This user has already issued this book' });
        }
        // Check whether this book is available or not.
        // Decrease the number of copies available for this book.
        // Add this request into book_request.
        // If book is available, issue the book and return 200 status code.
        // If book is not available, add this request into book_request and return 400 status code.

        // Add this request into book_request.
        const availablity_check = "SELECT book_id FROM book as b WHERE b.book_id = ? AND b.copies_available > 0";
        const [res] = await db.query(availablity_check, [book_id]);
        if(res.length > 0)
        {
            const query = "UPDATE book SET copies_available = copies_available - 1 WHERE book_id =?";
            await db.query(query, [book_id]);
            const issue_date = new Date().toISOString().slice(0,10);
            const query_issue = "INSERT INTO book_issue (book_id, user_id, issue_date) VALUES (?, ?, ?)";
            await db.query(query_issue, [book_id, user_id, issue_date]);
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
router.post('/return', async (req, res) => {
    try {
        const { book_id, user_id } = req.body;
        if (!book_id || !user_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check whether this book is issued by this user or not.
        const issue_check = "SELECT book_id FROM book_issue WHERE book_id = ? AND user_id = ?";
        const [issueRes] = await db.query(issue_check, [book_id, user_id]);

        if (issueRes.length === 0) {
            return res.status(400).json({ message: 'This book is not issued by you' });
        }

        // Update the book's copies_available.
        const increment_query = "UPDATE book SET copies_available = copies_available + 1 WHERE book_id = ?";
        await db.query(increment_query, [book_id]);

        // Update return_date and return_status in book_issue table
        const returnDate = new Date().toISOString().slice(0, 10); // Format as 'YYYY-MM-DD'
        const update_query = "UPDATE book_issue SET return_date = ?, return_status = ? WHERE book_id = ? AND user_id = ?";
        await db.query(update_query, [returnDate, 1, book_id, user_id]);

        // Get fine amount
        const fine_query = `
            SELECT fine_amount 
            FROM fine_due 
            JOIN book_issue ON fine_due.issue_id = book_issue.issue_id
            WHERE book_issue.book_id = ? AND book_issue.user_id = ?
        `;
        const [fineRes] = await db.query(fine_query, [book_id, user_id]);

        // const fine = fineRes.length > 0 ? fineRes[0].fine_amount : 0;
        const fine = fineRes[0].fine_amount;

        //Now check in the book_request table whether anyone has requested this book. In case of multiple requests, pick the one with least request_date
        const request_query = "SELECT * FROM book_request WHERE book_id =? ORDER BY request_date ASC LIMIT 1";
        const [requestRes] = await db.query(request_query, [book_id]);
        //Insert this data as an issue int the book_issue table.
        if (requestRes.length > 0) {
            const { user_id } = requestRes[0];
            const issue_date = new Date().toISOString().slice(0,10);
            const issue_query = "INSERT INTO book_issue (book_id, user_id, issue_date) VALUES (?,?,?)";
            await db.query(issue_query, [book_id, user_id, issue_date]);
            // Delete the request from book_request table
            const delete_request_query = "DELETE FROM book_request WHERE book_id =? AND user_id =?";
            await db.query(delete_request_query, [book_id, user_id]);
        }
        return res.status(200).json({ message: `Book returned successfully! Your fine for this book is ${fine}` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error returning book' });
    }
});


export default router;