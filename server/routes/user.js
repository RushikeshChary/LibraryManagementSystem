import express from 'express';
import bcrypt from 'bcrypt';
import db from "../db/connection.js";
import { sendOTP, verifyOTP } from '../utils/otpService.js';


const router = express.Router();

// Send OTP to user email
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Generate to send OTP
        const otpSent = await sendOTP(email);
        if (!otpSent) return res.status(500).json({ message: 'Failed to send OTP' });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Verify OTP before proceeding with registration
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const isValid = await verifyOTP(email, otp);
        if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Register user after OTP verification
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, mobile_no } = req.body;
        if (!first_name || !last_name || !email || !password || !mobile_no) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Combine first and last name because they have only one field for name in database(SAD).
        const name = `${first_name} ${last_name}`;

        // Check if email or mobile number exists
        try {
            const [existingUser] = await db.query('SELECT email FROM user WHERE email =?', [email]);
            if (existingUser.length > 0) return res.status(400).json({ message: 'Email already exists' });

            const [existingMobile] = await db.query('SELECT mobile_no FROM user WHERE mobile_no =?', [mobile_no]);
            if (existingMobile.length > 0) return res.status(400).json({ message: 'Mobile number already exists' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error checking for existing email or mobile number' });
        }

        // Hash the password before storing it
        // const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO user (name, email, password, mobile_no) VALUES (?, ?, ?, ?)', 
            // [name, email, hashedPassword, mobile_no]);
            [name, email, password, mobile_no]);

        res.status(200).json({ message: `User ${name} has been registered successfully. Please log in to continue.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering... Possibly due to duplicate mobile_no/email' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Fetch user from the database
        let [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email does not exist! Please register...' });
        }

        const user = rows[0];

        // Compare hashed password using bcrypt
        // const match = await bcrypt.compare(password, user.password);

        // if (!match) {
        //     return res.status(400).json({ message: 'Incorrect password' });
        // }

        if (password !== user.password) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Successful login response
        return res.status(200).json({ userId: user.user_id, username: user.name });

    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Endpoint for getting user's fine for each book_issue made by this user.

// router.get('/fine', async (req, res) => {
//     try {
//         const { userId } = req.query;
//         if (!userId) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }
//         const query = "SELECT book.book_title, book.book_id, fine_due.fine_amount FROM book_issue JOIN fine_due ON book_issue.issue_id = fine_due.issue_id JOIN book ON book_issue.book_id = book.book_id"
//         const [rows] = await db.query(query, [userId]);
//         res.json(rows[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error retrieving fine' });
//     }
// });

// Endpoint to fetch user's fines for each issued book
// router.get('/fine', async (req, res) => {
//     try {
//         const { userId } = req.query; 
//         if (!userId) {
//             return res.status(400).json({ message: 'Missing required userId' });
//         }
        
//         const query = `
//             SELECT book.book_title, book.book_id, fine_due.fine_amount 
//             FROM fine_due
//             JOIN book_issue ON fine_due.issue_id = book_issue.issue_id
//             JOIN book ON book_issue.book_id = book.book_id
//             WHERE fine_due.user_id = ?`; // ✅ Now filtering by userId

//         const [rows] = await db.query(query, [userId]);

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'No fines found for this user' });
//         }

//         res.json(rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error retrieving fine' });
//     }
// });


// Endpoint for clearing single book's fine.
// router.delete('/fine/:bookId', async (req, res) => {
//     try {
//         const { bookId, userId } = req.params;
//         if (!bookId) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }
//         await db.query('DELETE FROM fine_due WHERE book_id =? AND user_id =?', [bookId, userId]);
//         return res.status(200).json({ message: 'Fine for the book has been cleared successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Error clearing fine' });
//     }
// }); 

router.get('/fine', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const query = `
                    SELECT book.book_title, book.book_id, fine_due.fine_amount, fine_due.fine_due_id 
                    FROM book_issue 
                    JOIN fine_due ON book_issue.issue_id = fine_due.fine_due_id 
                    JOIN book ON book_issue.book_id = book.book_id WHERE fine_due.user_id = ?`
        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving fine' });
    }
});

router.post('/pay-fine', async (req, res) => {
    try {
        const { userId, fineIds } = req.body;
        if (!userId && !fineIds) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // If there is only userId is present, clear all his fines. else if fineIds are also present, clear fines with those id's.
        if (!fineIds) {
            // Just delete all those fines curresponding to this userId.
            await db.query('DELETE FROM fine_due WHERE user_id =?', [userId]);
            return res.status(200).json({ message: 'Payment successful for all fines' });
        }
        else
        {
            // Just delete those fines curresponding to this userId and given fineIds.
            // for(let fineId of fineIds)
            // {
            //     await db.query('DELETE FROM fine_due WHERE fine_id =?', [fineId]);
            // }
            const query = "DELETE FROM fine_due WHERE fine_due_id IN (?)";
            await db.query(query,[fineIds]);
            return res.status(200).json({ message: 'Payment successful for fines with given ids' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error paying fine' });
    }
})

export default router;