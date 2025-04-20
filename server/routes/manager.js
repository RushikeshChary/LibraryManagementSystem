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
        // if (email!== manager_hardcoded.username || password!== manager_hardcoded.password) {
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }
        let [rows] = await db.query('SELECT * FROM manager WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email does not exist! Please get yourself registered...' });
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
    const checkQuery = "SELECT * FROM manager WHERE email = ? OR mobile_no = ?";
    const [existingManagers] = await db.query(checkQuery, [email, mobile_number]);
    if (existingManagers.length > 0) {
        return res.status(400).json({ message: 'Email or mobile number already exists' });
    }

    // bcrypt the password before inserting it into the database
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new manager into the database
    let new_manager_id = "";
    const query = "INSERT INTO manager (email, password, mobile_no, name) VALUES (?, ?, ?, ?)";
    await db.query(query, [email, password, mobile_number, name], (err, result) => {
        if (err) throw err;
        new_manager_id = result.insertId;
    });
    res.json({ message: 'Manager added successfully', new_manager_id });
});

// Search user with user_id.
router.get('/user', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const query = "SELECT * FROM user WHERE user_id = ?";
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
    let query_users = "SELECT COUNT(*) AS total_users FROM user";
    let query_books = "SELECT COUNT(*) AS total_books FROM book";
    let query_issues = "SELECT COUNT(*) AS total_issues FROM book_issue WHERE return_status = 0";

    const [total_users] = await db.query(query_users);
    const [total_books] = await db.query(query_books);
    const [total_current_issues] = await db.query(query_issues);

    res.json({users: total_users[0], books: total_books[0], current_issues: total_current_issues[0]});
});


// Manager could add books.
router.post('/add-book', async (req, res) => {
    try {
        const { title, authors, category, publication_year, publisher_name, publication_language, 
                floor_no, shelf_no, copies_total } = req.body;
        const copies_available = copies_total;

        if (!title || !authors || !Array.isArray(authors) || authors.length === 0 || 
            !category || !publication_year || !floor_no || !shelf_no || !copies_total
            || !publisher_name || !publication_language) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if the book already exists in the database
        const checkQuery = "SELECT * FROM book WHERE book_title = ?";
        const [existingBooks] = await db.query(checkQuery, [title]);
        if (existingBooks.length > 0) {
            return res.status(400).json({ message: 'Book already exists' });
        }

        // Check if the specified location is available
        const checkLocationQuery = "SELECT * FROM location WHERE floor_no = ? AND shelf_no = ?";
        const [existingLocations] = await db.query(checkLocationQuery, [floor_no, shelf_no]);
        if (existingLocations.length > 0) {
            return res.status(400).json({ message: 'Specified location is already taken' });
        }
        const insertLocationQuery = "INSERT INTO location (floor_no, shelf_no) VALUES (?, ?)";
        const [locationResult] = await db.query(insertLocationQuery, [floor_no, shelf_no]);
        const location_id = locationResult.insertId;

        // Check or insert the category
        const checkCategoryQuery = "SELECT * FROM category WHERE category_name = ?";
        const [existingCategories] = await db.query(checkCategoryQuery, [category]);
        let category_id;
        if (existingCategories.length === 0) {
            const insertCategoryQuery = "INSERT INTO category (category_name) VALUES (?)";
            const [categoryResult] = await db.query(insertCategoryQuery, [category]);
            category_id = categoryResult.insertId;
        } else {
            category_id = existingCategories[0].category_id;
        }

        let publisher_id;
        const checkPublisherQuery = "SELECT * FROM publisher WHERE publisher_name = ? AND publication_language = ?";
        const [existingPublishers] = await db.query(checkPublisherQuery, [publisher_name, publication_language]);

        if (existingPublishers.length === 0) {
            const insertPublisherQuery = "INSERT INTO publisher (publisher_name, publication_language) VALUES (?, ?)";
            const [publisherResult] = await db.query(insertPublisherQuery, [publisher_name, publication_language]);
            publisher_id = publisherResult.insertId;
        } else {
            publisher_id = existingPublishers[0].publisher_id;
        }

        // Insert the new book
        const insertBookQuery = "INSERT INTO book (book_title, category_id, publisher_id, publication_year, location_id, copies_total, copies_available) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [bookResult] = await db.query(insertBookQuery, [title, category_id, publisher_id, publication_year, location_id, copies_total, copies_available]);
        const book_id = bookResult.insertId;

        // Process each author
        for (const authorName of authors) {
            // Check if author exists
            const checkAuthorQuery = "SELECT * FROM author WHERE author_name = ?";
            const [existingAuthors] = await db.query(checkAuthorQuery, [authorName]);

            let author_id;
            if (existingAuthors.length === 0) {
                const insertAuthorQuery = "INSERT INTO author (author_name) VALUES (?)";
                const [authorResult] = await db.query(insertAuthorQuery, [authorName]);
                author_id = authorResult.insertId;
            } else {
                author_id = existingAuthors[0].author_id;
            }

            // Link book and author
            const insertBookAuthorQuery = "INSERT INTO book_author (book_id, author_id) VALUES (?, ?)";
            await db.query(insertBookAuthorQuery, [book_id, author_id]);
        }

        res.json({ message: 'Book added successfully', book_id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Manager could look at all the users who have not returned any book.
router.get('/not-returned', async (req, res) => {
    // Return all users who have not returned any book.
    let query =  `SELECT u.user_id, bi.book_id, bi.return_date FROM user as u
              JOIN book_issue as bi ON u.user_id = bi.user_id
              WHERE bi.return_status = 0`;
    const [usersNotReturned] = await db.query(query);

    res.json(usersNotReturned);
});

// Manager could delete all the successful book returns in the book_issue table.
// router.delete('/book-returns', async (req, res) => {
//     // Delete all successful book returns.
//     query = "DELETE FROM book_issue WHERE return_status = 1";
//     await db.query(query);
//     // For demonstration purposes, we're just returning a success message.
//     res.json({ message: 'All successful book returns deleted successfully' });
// });




export default router;