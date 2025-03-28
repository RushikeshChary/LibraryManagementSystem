import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

const manager_hardcoded = {
    username: 'manager',
    password: 'password',
}

// Manager login router.
router.post('/login', (req, res) => {
    // Verify manager credentials and generate JWT token.
    // For demonstration purposes, we're just returning a hardcoded token.
    const managerToken = 'your_manager_token';
    // For now, use some hardcoded credentials i.e, username, password
    // In the future, we will use JWT token for authentication.
    const { username, password } = req.body;
    if (username !== 'manager' || password !== 'password') {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    if(manager_hardcoded.username == username && manager_hardcoded.password == password)
    {
        res.status(200).json({ message: 'Manager logged in successfully' });
    }
    // Generate JWT token
    // In a real application, you would generate a token using a library like jsonwebtoken
    // and sign it with a secret key.
    // Here, we're just returning a hardcoded token.
    // res.json({ managerToken });
});

// Manager logout router.
router.post('/logout', (req, res) => {
    // Invalidate the manager's JWT token.
    // For demonstration purposes, we're just returning a success message.
    res.json({ message: 'Manager logged out successfully' });
});

// Manager dashboard router.
router.get('/dashboard', async (req, res) => {
    // Return manager dashboard data.
    // For demonstration purposes, we're just returning a hardcoded response.
    query_users = "SELECT COUNT(*) AS total_users FROM userss";
    query_books = "SELECT COUNT(*) AS total_books FROM book";
    query_issues = "SELECT COUNT(*) AS total_issues FROM book_issue WHERE return_status = 0";

    const [total_users] = await db.query(query_users);
    const [total_books] = await db.query(query_books);
    const [total_current_issues] = await db.query(query_issues);

    res.json({total_users, total_books, total_current_issues});
});

// Manager user management router.
router.get('/users',async (req, res) => {
    // Return all users.
    const query = "SELECT * FROM users";
    const [res] = await db.query(query);

    res.json(res);
});

// Manager could add books.
router.post('/add-book', (req, res) => {
    // Add a new book.
    // For demonstration purposes, we're just returning a success message.
    res.json({ message: 'Book added successfully' });
});


// Manager could look at all the users who have not returned any book.
router.get('/users/not-returned', async (req, res) => {
    // Return all users who have not returned any book.
    query =  `SELECT u.user_id, bi.book_id, bi.return_date FROM user as u
              JOIN book_issue as bi ON user.user_id = book_issue.user_id
              WHERE book_issue.return_status = 0`;
    const [usersNotReturned] = await db.query(query);

    res.json(usersNotReturned);
});

// Manager could delete all the successful book returns in the book_issue table.
router.delete('/book-returns', async (req, res) => {
    // Delete all successful book returns.
    query = "DELETE FROM book_issue WHERE return_status = 1";
    await db.query(query);
    // For demonstration purposes, we're just returning a success message.
    res.json({ message: 'All successful book returns deleted successfully' });
});




export default router;