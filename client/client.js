import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const serverUrl = 'http://localhost:3000'; // Adjust if needed
let userId = null; // Store logged-in user's ID

// Hardcoded test credentials
const hardcodedUser = {
    username: "testuser",
    password: "test123",
    userId: "user999"
};

// Login / Register Menu
function showAuthMenu() {
    console.log("\n🔐 Welcome to the Library Management System.");
    console.log("1️⃣  Login");
    console.log("2️⃣  Register");
    console.log("3️⃣  Exit");

    rl.question("👉 Enter your choice: ", choice => {
        switch (choice) {
            case '1':
                login();
                break;
            case '2':
                register();
                break;
            case '3':
                console.log("👋  Exiting...");
                rl.close();
                break;
            default:
                console.log("❌  Invalid choice. Try again.");
                showAuthMenu();
        }
    });
}

// Login to library
function login() {
    rl.question("👤 Enter Username: ", username => {
        rl.question("🔑 Enter Password: ", password => {
            if (username === hardcodedUser.username && password === hardcodedUser.password) {
                userId = hardcodedUser.userId;
                console.log(`✅ Hardcoded Login Successful! Welcome, ${username}.`);
                showMenu();
                return;
            }

            axios.post(`${serverUrl}/login`, { username, password })
                .then(response => {
                    userId = response.data.userId; 
                    console.log(`✅ Login Successful! Welcome, ${username}.`);
                    showMenu();
                })
                .catch(error => {
                    console.error("❌ Login Failed:", error.response?.data?.error || error.message);
                    showAuthMenu();
                });
        });
    });
}

// Register a new user
function register() {
    rl.question("👤 Choose a Username: ", username => {
        rl.question("🔑 Choose a Password: ", password => {
            axios.post(`${serverUrl}/register`, { username, password })
                .then(response => {
                    console.log(`✅ Registration Successful! You can now log in.`);
                    showAuthMenu();
                })
                .catch(error => {
                    console.error("❌ Registration Failed:", error.response?.data?.error || error.message);
                    showAuthMenu();
                });
        });
    });
}

// Menu
function showMenu() {
    console.log("\n📚 Library Management System");
    console.log("1️⃣  Search for a Book 🔍");
    console.log("2️⃣  Borrow a Book");
    console.log("3️⃣  Return a Book");
    console.log("4️⃣  Pay Fine 💰");
    console.log("5️⃣  Logout");
    rl.question("👉 Enter your choice: ", handleUserInput);
}

function handleUserInput(choice) {
    switch (choice) {
        case '1':
            searchBookMenu();
            break;
        case '2':
            rl.question("📖 Enter Book ID to borrow: ", bookId => borrowBook(bookId.trim()));
            break;
        case '3':
            showIssuedBooks();
            break;
        case '4':
            checkFine();
            break;
        case '5':
            console.log("👋 Logging out...");
            userId = null;
            showAuthMenu();
            break;
        default:
            console.log("❌ Invalid choice. Try again.");
            showMenu();
    }
}

// Search for books
function searchBookMenu() {
    console.log("\n🔎 Search Books");
    console.log("1️⃣  By Title");
    console.log("2️⃣  By Author");
    console.log("3️⃣  By Category");
    console.log("4️⃣  Back to Main Menu");

    rl.question("👉 Enter your search choice: ", choice => {
        switch (choice) {
            case '1':
                rl.question("📖 Enter book title: ", title => searchBooks('title', title));
                break;
            case '2':
                rl.question("👤 Enter author name: ", author => searchBooks('author', author));
                break;
            case '3':
                rl.question("📂 Enter category: ", category => searchBooks('category', category));
                break;
            case '4':
                showMenu();
                break;
            default:
                console.log("❌ Invalid choice. Try again.");
                searchBookMenu();
        }
    });
}

//search through fields.
function searchBooks(field, value) {
    axios.get(`${serverUrl}/search`, { params: { field, value } })
        .then(response => {
            if (response.data.length === 0) {
                console.log("⚠️  No books found.");
            } else {
                console.log("\n🔍 Search Results:");
                response.data.forEach(book => {
                    console.log(`${book.id}. ${book.title} by ${book.author} [Category: ${book.category}] (${book.available ? '✅ Available' : '❌ Borrowed'})`);
                });
            }
            showMenu();
        })
        .catch(error => {
            console.error("⚠️  Error searching books:", error.message);
            showMenu();
        });
}

// Borrow a book
function borrowBook(bookId) {
    axios.post(`${serverUrl}/borrow`, { id: bookId, userId })
        .then(response => {
            console.log(`✔️ ${response.data.message}`);
            showMenu();
        })
        .catch(error => {
            console.error(`⚠️  ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// Show issued books & ask which to return
function showIssuedBooks() {
    axios.get(`${serverUrl}/issued-books`, { params: { userId } })
        .then(response => {
            if (response.data.length === 0) {
                console.log("⚠️  No books issued to you.");
                showMenu();
                return;
            }

            console.log("\n📚 Your Issued Books:");
            response.data.forEach(book => {
                console.log(`${book.id}. ${book.title} by ${book.author} [Category: ${book.category}]`);
            });

            rl.question("\n🔄 Enter the Book ID you want to return: ", bookId => {
                returnBook(bookId.trim());
            });
        })
        .catch(error => {
            console.error("⚠️  Error fetching issued books:", error.message);
            showMenu();
        });
}

// Return a book
function returnBook(bookId) {
    axios.post(`${serverUrl}/return`, { id: bookId, userId })
        .then(response => {
            console.log(`✔️ ${response.data.message}`);
            showMenu();
        })
        .catch(error => {
            console.error(`⚠️  ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// Check fine
function checkFine() {
    axios.get(`${serverUrl}/fine`, { params: { userId } })
        .then(response => {
            const fineAmount = response.data.fine;
            if (fineAmount === 0) {
                console.log("✅ No outstanding fine.");
                showMenu();
                return;
            }

            console.log(`💰 You have a pending fine of ₹${fineAmount}.`);
            rl.question("⚠️  Do you want to pay the fine? (yes/no): ", answer => {
                if (answer.toLowerCase() === 'yes') {
                    payFine();
                } else {
                    console.log("❌ Fine not paid.");
                    showMenu();
                }
            });
        })
        .catch(error => {
            console.error("⚠️  Error checking fine:", error.message);
            showMenu();
        });
}

// Pay fine
function payFine() {
    axios.post(`${serverUrl}/pay-fine`, { userId })
        .then(response => {
            console.log(`✔️ ${response.data.message}`);
            showMenu();
        })
        .catch(error => {
            console.error(`⚠️  ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// Phirse shuru
showAuthMenu();
