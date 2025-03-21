-- Initialize all the tables.
CREATE TABLE category(
    category_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL
);

CREATE TABLE publisher(
    publisher_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    publisher_name VARCHAR(255) NOT NULL,
    publication_language VARCHAR(255) NOT NULL
);

CREATE TABLE location(
    location_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    floor_no INTEGER,
    shelf_no INTEGER
);

CREATE TABLE author(
    author_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL
);

CREATE TABLE book(
    book_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    book_title VARCHAR(255) NOT NULL,
    category_id INTEGER,
    publisher_id INTEGER,
    publication_year INTEGER NOT NULL,
    location_id INTEGER,
    copies_total INTEGER,
    copies_available INTEGER,
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id),
    FOREIGN KEY (location_id) REFERENCES location(location_id)
);

CREATE TABLE book_author(
    book_id INTEGER,
    author_id INTEGER,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES book(book_id),
    FOREIGN KEY (author_id) REFERENCES author(author_id)
);

CREATE TABLE user(
    user_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(255) UNIQUE NOT NULL,
    total_fine INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE book_request(
    user_id INTEGER,
    book_id INTEGER,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (book_id) REFERENCES book(book_id)
);

CREATE TABLE book_issue(
    issue_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME,
    fine INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (book_id) REFERENCES book(book_id)
);

CREATE TABLE fine_due(
    fine_due_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    issue_id INTEGER,
    fine_date DATE,
    fine_amount INTEGER,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (issue_id) REFERENCES book_issue(issue_id)
);

-- Insert sample data
INSERT INTO category (category_name) VALUES ('Fiction'), ('Science'), ('History'), ('Technology'), ('Philosophy'), ('Mathematics'), ('Psychology'), ('Engineering'), ('Medicine'), ('Art');

INSERT INTO publisher (publisher_name, publication_language) VALUES ('Penguin', 'English'), ('Springer', 'English'), ('Oxford Press', 'English'), ('HarperCollins', 'English'), ('Cambridge University Press', 'English'), ('McGraw Hill', 'English'), ('Pearson', 'English'), ('MIT Press', 'English'), ('Elsevier', 'English'), ('Routledge', 'English');

INSERT INTO location (floor_no, shelf_no) VALUES (1, 5), (2, 10), (3, 15), (1, 3), (2, 7), (3, 1), (1, 9), (2, 4), (3, 8), (1, 6);

INSERT INTO author (author_name) VALUES ('J.K. Rowling'), ('Stephen Hawking'), ('Yuval Noah Harari'), ('Isaac Newton'), ('Albert Einstein'), ('Sigmund Freud'), ('Marie Curie'), ('Leonardo da Vinci'), ('Charles Darwin'), ('Carl Sagan');

INSERT INTO book (book_title, category_id, publisher_id, publication_year, location_id, copies_total, copies_available) VALUES 
('Harry Potter', 1, 1, 1997, 1, 10, 8),
('A Brief History of Time', 2, 2, 1988, 2, 5, 3),
('Sapiens', 3, 3, 2011, 3, 7, 6),
('Principia Mathematica', 6, 5, 1687, 4, 3, 3),
('Relativity: The Special and General Theory', 2, 5, 1916, 5, 4, 2),
('The Interpretation of Dreams', 7, 6, 1900, 6, 5, 4),
('On the Origin of Species', 3, 7, 1859, 7, 6, 5),
('Cosmos', 2, 8, 1980, 8, 7, 6),
('The Art of War', 10, 9, -500, 9, 4, 4),
('The Double Helix', 8, 10, 1968, 10, 5, 3);

INSERT INTO book_author (book_id, author_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 9), (8, 10), (9, 8), (10, 7);

INSERT INTO user (name, email, password, mobile_no) VALUES 
('Alice', 'alice@example.com', 'password123', '1234567890'),
('Bob', 'bob@example.com', 'securepass', '0987654321'),
('Charlie', 'charlie@example.com', 'charliepass', '1112233445'),
('David', 'david@example.com', 'davidpass', '5566778899'),
('Emma', 'emma@example.com', 'emmapass', '6677889900'),
('Frank', 'frank@example.com', 'frankpass', '1122334455'),
('Grace', 'grace@example.com', 'gracepass', '9988776655'),
('Hank', 'hank@example.com', 'hankpass', '2233445566'),
('Ivy', 'ivy@example.com', 'ivypass', '3344556677'),
('Jack', 'jack@example.com', 'jackpass', '4455667788');

-- INSERT INTO book_request (user_id, book_id) VALUES (1, 1), (2, 2), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9), (9, 10), (10, 3);

INSERT INTO book_issue (user_id, book_id, issue_date, return_date, fine) VALUES (1, 1, '2025-03-01', '2025-03-10', 0), (2, 2, '2025-03-05', '2025-03-15', 5), (3, 4, '2025-03-10', '2025-03-20', 0), (4, 5, '2025-03-12', '2025-03-22', 10);

INSERT INTO fine_due (user_id, issue_id, fine_date, fine_amount) VALUES (2, 2, '2025-03-16', 5), (4, 4, '2025-03-23', 10);
