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

// Manager can add managers to the database. He needs to provid email, password, mobile number, and name.
router.post('/add-manager', async (req, res) => {
    const { email, password, mobile_number, name } = req.body;
    if (!email || !password || !mobile_number || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    // Check if the email or mobile number already exists in the database
    const checkQuery = "SELECT * FROM manager WHERE email = ? OR mobile_number = ?";
    const [existingManagers] = await db.query(checkQuery, [email, mobile_number]);
    if (existingManagers.length > 0) {
        return res.status(400).json({ message: 'Email or mobile number already exists' });
    }

    // bcrypt the password before inserting it into the database
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new manager into the database
    const query = "INSERT INTO manager (email, password, mobile_number, name) VALUES (?, ?, ?, ?)";
    await db.query(query, [email, password, mobile_number, name]);
    res.json({ message: 'Manager added successfully' });
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


// Manager could add books.
router.post('/add-book', async (req, res) => {
    // Add a new book.
    const { title, author, category, publication_year, floor_no, shelf_no, copies_total, copies_available } = req.body;
    if (!title || !author || !category || !publication_year || !floor_no || !shelf_no || !copies_total || !copies_available) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    // Check if the book already exists in the database
    const checkQuery = "SELECT * FROM book WHERE title = ?";
    const [existingBooks] = await db.query(checkQuery, [title]);
    if (existingBooks.length > 0) {
        return res.status(400).json({ message: 'Book already exists' });
    }

    // Check if the specified location (floor and shelf) is availble or not.
    const checkLocationQuery = "SELECT * FROM location WHERE floor_no = ? AND shelf_no = ?";
    const [existingLocations] = await db.query(checkLocationQuery, [floor_no, shelf_no]);

    // Some variables.
    let new_cat_id = "";
    let new_author_id = "";
    let location_id = "";
    let book_id = "";

    if (existingLocations.length > 0) {
        return res.status(400).json({ message: 'Specified location is already taken' });
    }
    const insertLocationQuery = "INSERT INTO location (floor_no, shelf_no) VALUES (?,?)";
    await db.query(insertLocationQuery, [floor_no, shelf_no], (err, result) => {
        if (err) throw err;
        location_id = result.insertId;
    });


    // check in the category and author tables if they are present already or not.
    const checkCategoryQuery = "SELECT * FROM category WHERE name = ?";
    const [existingCategories] = await db.query(checkCategoryQuery, [category]);
    if (existingCategories.length === 0) {
        const insertCategoryQuery = "INSERT INTO category (name) VALUES (?)";
        
        await db.query(insertCategoryQuery, [category], (err, result) => {
            if (err) throw err;
            new_cat_id = result.insertId;
        });
    }
    else {
        new_cat_id = existingCategories[0].category_id;
    }

    // check in the author table if the author is present or not.
    const checkAuthorQuery = "SELECT * FROM author WHERE name = ?";
    const [existingAuthors] = await db.query(checkAuthorQuery, [author]);
    if (existingAuthors.length === 0) {
        const insertAuthorQuery = "INSERT INTO author (name) VALUES (?)";
        
        await db.query(insertAuthorQuery, [author], (err, result) => {
            if (err) throw err;
            new_author_id = result.insertId;
        });
    }
    else {
        new_author_id = existingAuthors[0].author_id;
    }

    // Insert the new book into the database
    const query = "INSERT INTO book (title, author_id, category_id, publication_year, location_id, copies_total, copies_available) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await db.query(query, [title, new_author_id, new_cat_id, publication_year, location_id, copies_total, copies_available], (err, result) => {
        if (err) throw err;
        book_id = result.insertId;
    });
    res.json({ message: 'Book added successfully', book_id });

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