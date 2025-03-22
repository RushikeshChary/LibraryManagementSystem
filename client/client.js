import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const serverUrl = 'http://localhost:3000'; // Adjust this if needed

let userId = null; // Store logged-in user's ID

// Hardcoded test credentials
const hardcodedUser = {
    username: "testuser",
    password: "test123",
    userId: "user999"
};

//Login to library.
function login() {
    console.log("\n🔐 Welcome to the Library Management System. Please log in.");

    rl.question("👤 Enter Username: ", username => {
        rl.question("🔑 Enter Password: ", password => {
            // Hardcoded login access
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
                    login(); 
                });
        });
    });
}

// Menu
function showMenu() {
    console.log("\n📚 Library Management System");
    console.log("1️⃣ Search for a Book 🔍");
    console.log("2️⃣ Borrow a Book");
    console.log("3️⃣ Return a Book");
    console.log("4️⃣ Logout");
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
            console.log("👋 Logging out...");
            userId = null;
            login();
            break;
        default:
            console.log("❌ Invalid choice. Try again.");
            showMenu();
    }
}

// Search for books
function searchBookMenu() {
    console.log("\n🔎 Search Books");
    console.log("1️⃣ By Title");
    console.log("2️⃣ By Author");
    console.log("3️⃣ By Category");
    console.log("4️⃣ Back to Main Menu");

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
                console.log("⚠️ No books found.");
            } else {
                console.log("\n🔍 Search Results:");
                response.data.forEach(book => {
                    console.log(`${book.id}. ${book.title} by ${book.author} [Category: ${book.category}] (${book.available ? '✅ Available' : '❌ Borrowed'})`);
                });
            }
            showMenu();
        })
        .catch(error => console.error("⚠️ Error searching books:", error.message));
}

// Borrow /request a book
function borrowBook(bookId) {
    axios.post(`${serverUrl}/borrow`, { id: bookId, userId })
        .then(response => {
            console.log(`✔️ ${response.data.message}`);
            showMenu();
        })
        .catch(error => {
            console.error(`⚠️ ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// Show Issued Books & Ask Which to Return
function showIssuedBooks() {
    axios.get(`${serverUrl}/issued-books`, { params: { userId } })
        .then(response => {
            if (response.data.length === 0) {
                console.log("⚠️ No books issued to you.");
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
            console.error("⚠️ Error fetching issued books:", error.message);
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
            console.error(`⚠️ ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// Phirse shuru
login();
