DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

DROP TABLE IF EXISTS leaderboards;

CREATE TABLE leaderboards (
    user_id TEXT PRIMARY KEY,
    score INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);