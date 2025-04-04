import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

const manager_hardcoded = {
    username: 'manager',
    password: 'password',
}

// Manager login router.
router.post('/login',async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (email!== manager_hardcoded.username || password!== manager_hardcoded.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        let [rows] = await db.query('SELECT * FROM manager WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email does not exist! Please register...' });
        }
        const manager = rows[0];
        // Compare hashed password using bcrypt
        // const match = await bcrypt.compare(password, user.password);
        // if (!match) {
            // return res.status(401).json({ message: 'Invalid credentials' });
        // }
        if(password !== manager.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Successful login response
        res.json({ message: 'Manager logged in successfully', manager });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

// Search user with user_id.
router.get('/user', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const query = "SELECT * FROM users WHERE user_id = ?";
    const [rows] = await db.query(query, [user_id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
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