DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

DROP TABLE IF EXISTS leaderboards;

CREATE TABLE leaderboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use an auto-incrementing ID as the primary key
    user_id TEXT NOT NULL, -- Keep user_id to link to the users table
    level INTEGER NOT NULL, -- Add a column for the level
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

SELECT *
FROM leaderboards;