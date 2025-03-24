import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const serverUrl = 'http://localhost:8080'; // Adjust if needed
let userId = null; // Store logged-in user's ID

// Hardcoded test credentials
const hardcodedUser = {
    email: "testuser",
    password: "test123",
    userId: "user999"
};

// Login / Register Menu
function showAuthMenu() {
    console.log("\n🔐 Welcome to the Library Management System.");
    console.log("1️⃣  Login");
    console.log("2️⃣  Register");
    console.log("3️⃣  Exit");
    console.log("4. Search for a book");

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
            case '4':
                searchBookMenu();
                break;
            default:
                console.log("❌  Invalid choice. Try again.");
                showAuthMenu();
        }
    });
}

// Login to library
function login() {
    rl.question("👤 Enter email: ", email => {
        rl.question("🔑 Enter Password: ", password => {
            if (email === hardcodedUser.email && password === hardcodedUser.password) {
                userId = hardcodedUser.userId;
                console.log(`✅ Hardcoded Login Successful! Welcome, ${userId}.`);
                showMenu();
                return;
            }
            axios.post(`${serverUrl}/user/login`, { email, password })
                .then(response => {
                    userId = response.data.userId; 
                    const username = response.data.username;
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
    rl.question("👤 Choose a email: ", email => {
        rl.question("🔑 Choose a Password: ", password => {
            axios.post(`${serverUrl}/user/register`, { email, password })
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
    axios.get(`${serverUrl}/book/search`, { params: { field, value } })
        .then(response => {
            if (response.data.length === 0) {
                console.log("⚠️  No books found.");
            } else {
                console.log("\n🔍 Search Results:");
                // response.data.forEach(book => {
                //     console.log(`${book.id}. ${book.title} by ${book.author} [Category: ${book.category}] (${book.copies_available ? '✅ Available' : '❌ Borrowed'})`);
                // });
                console.log(response.data);
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
    axios.post(`${serverUrl}/book/issue`, { bookId, userId })
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
    axios.get(`${serverUrl}/book/issued-books`, { params: { userId } })
        .then(response => {
            if (response.data.length === 0) {
                console.log("⚠️  No books issued to you.");
                showMenu();
                return;
            }

            console.log("\n📚 Your Issued Books:");
            // response.data.forEach(book => {
            //     console.log(`${book.id}. ${book.title} by ${book.author} [Category: ${book.category}]`);
            // });
            console.log(response.data);

            rl.question("\n🔄 Enter the Book ID you want to return: ", bookId => {
                returnBook(bookId);
            });
        })
        .catch(error => {
            console.error("⚠️  Error fetching issued books:", error.message);
            showMenu();
        });
}

// Return a book
function returnBook(bookId) {
    axios.post(`${serverUrl}/book/return`, { bookId, userId })
        .then(response => {
            console.log(`✔️ ${response.data.message}`);
            showMenu();
        })
        .catch(error => {
            console.error(`⚠️ Error message: ${error.response?.data?.error || error.message}`);
            showMenu();
        });
}

// // Check fine
function checkFine() {
    axios.get(`${serverUrl}/user/fine`, { params: { userId } })
        .then(response => {
            const fines = response.data; 
            if (!fines || fines.length === 0) {
                console.log("✅ No outstanding fines.");
                showMenu();
                return;
            }

            console.log("\n💰 Outstanding Fines:");
            let totalFine = 0;
            fines.forEach(fine => {
                console.log(`🔹 Fine ID: ${fine.fine_due_id} | Amount: ₹${fine.fine_amount} | Reason: ${fine.book_title}`);
                totalFine += fine.fine_amount;
            });

            console.log(`\n💵 Total Fine Amount: ₹${totalFine}`);
            rl.question("⚠️  Do you want to (1) Pay Total Fine or (2) Pay Individually? (Enter 1 or 2): ", choice => {
                if (choice === '1') {
                    confirmPayFine(totalFine);
                } else if (choice === '2') {
                    payIndividualFine(fines);
                } else {
                    console.log("❌ Invalid choice. Returning to menu.");
                    showMenu();
                }
            });
        })
        .catch(error => {
            console.error("⚠️  Error checking fine:", error.message);
            showMenu();
        });
}

// Confirm before paying total fine or else you will be homeless
function confirmPayFine(amount) {
    rl.question(`⚠️  Confirm payment of ₹${amount}? (yes/no): `, answer => {
        if (answer.toLowerCase() === 'yes') {
            payFine(null); // Passing null to make the value 0 ante cleared
        } else {
            console.log("❌ Fine not paid.");
            showMenu();
        }
    });
}

// Pay individual fine
function payIndividualFine(fines) {
    rl.question("\nEnter Fine ID(s) to pay (comma separated): ", fineIds => {
        const selectedFineIds = fineIds.split(',').map(id => id.trim());
        payFine(selectedFineIds);
    });
}

// Pay fine (total or selected)
function payFine(selectedFineIds) {
    const payload = selectedFineIds ? { userId, fineIds: selectedFineIds } : { userId };

    axios.post(`${serverUrl}/user/pay-fine`, payload)
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
