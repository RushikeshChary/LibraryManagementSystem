const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function fetchBooks() {
    axios.get('http://localhost:3000/users')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
}

rl.question('Enter command (list-users): ', (command) => {
    if (command === 'list-users') fetchBooks();
    rl.close();
});
