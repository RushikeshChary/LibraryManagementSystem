const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function viewBooks() {
    axios.get('http://localhost:3000/users')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error))
        .finally(() => mainMenu());
}


// Function to get user input as a promise
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}



async function mainMenu() {
    console.log('\nLibrary Management System');
    console.log('1. Add Book');
    console.log('2. View Books');
    console.log('3. Search Book');
    console.log('4. Update Book');
    console.log('5. Delete Book');
    console.log('6. Exit');

    const choice = await askQuestion('Enter your choice: ');

    switch (choice) {
        case '1': 
            console.log("Add book function not implemented yet.");
            break;
        case '2': 
            viewBooks(); 
            return;
        case '3': 
            console.log("Search book function not implemented yet.");
            break;
        case '4': 
            console.log("Update book function not implemented yet.");
            break;
        case '5': 
            console.log("Delete book function not implemented yet.");
            break;
        case '6': 
            console.log("Exiting...");
            rl.close();
            return;
        default: 
            console.log('Invalid choice!');
    }

    mainMenu(); // Call again to continue the loop
}

mainMenu();
