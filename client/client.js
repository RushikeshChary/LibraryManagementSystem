import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const URL = 'http://localhost:3000';

// Function to get user input as a promise
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function viewUsers(){
    // const response = await axios.get(`${URL}/users`);
    // console.log(response.data);

    axios.get('http://localhost:3000/users')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error))
        .finally(() => mainMenu());
}



// function to add user by making a call to /login
async function addUser() {
    const name = await askQuestion('Enter name: ');
    const email = await askQuestion('Enter email: ');
    const password = await askQuestion('Enter password: ');

    const response = await axios.post(`${URL}/login`, {
        name,
        email,
        password
    });

    console.log('User added successfully:', response.data);
}





async function mainMenu() {
    console.log('\nLibrary Management System');
    console.log('1. login');
    console.log('2. View Books');
    console.log('3. Search Book');
    console.log('4. Update Book');
    console.log('5. Delete Book');
    console.log('6. Exit');

    const choice = await askQuestion('Enter your choice: ');

    switch (choice) {
        case '1': 
            // console.log("Add book function not implemented yet.");
            addUser();
            break;
        case '2': 
            viewUsers(); 
            break;
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
