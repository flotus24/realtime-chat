CREATE DATABASE realtime_chat;

CREATE TABLE users(
    userId SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
