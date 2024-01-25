CREATE TABLE cuby_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100),
    googleId VARCHAR(100) UNIQUE
);
