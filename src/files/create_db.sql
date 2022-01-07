DROP DATABASE IF EXISTS FranceBotDB;

CREATE DATABASE FranceBotDB;
USE FranceBotDB;


DROP TABLE IF EXISTS Salons;
CREATE TABLE Salons(
    id_salon VARCHAR(22) PRIMARY KEY NOT NULL,
    memes TINYINT NOT NULL,
    reposts TINYINT NOT NULL,
    threads TINYINT NOT NULL,
    feed TINYINT NOT NULL,
    stats TINYINT NOT NULL,
    logs TINYINT NOT NULL
);


DROP TABLE IF EXISTS Messages;
CREATE TABLE Messages(
    msg_id VARCHAR(22) PRIMARY KEY NOT NULL,
    author_id VARCHAR(22) NOT NULL,
    channel_id VARCHAR(22) NOT NULL,
    cat_name TEXT NOT NULL,
    jump_url TEXT NOT NULL,
    likes INT NOT NULL,
    msg_content TEXT,
    day_date INT NOT NULL,
    month_date INT NOT NULL,
    stf TINYINT NOT NULL,
    stt TINYINT NOT NULL,
    str TINYINT NOT NULL
);


DROP TABLE IF EXISTS Attachments;
CREATE TABLE Attachments(
    msg_id VARCHAR(22) NOT NULL,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL
);


DROP TABLE Moyenne;
CREATE TABLE Moyenne(
    moyenne FLOAT NOT NULL,
    moyenne_min INT NOT NULL,
    nb_msg_moyenne INT NOT NULL
);


DROP USER IF EXISTS 'franceBot'@'localhost';
CREATE USER 'franceBot'@'localhost' IDENTIFIED BY 'N0XlWK$uw#A8UM';
GRANT USAGE ON FranceBotDB.* TO 'franceBot'@'localhost';
GRANT ALL PRIVILEGES ON FranceBotDB.* TO 'franceBot'@'localhost';
FLUSH PRIVILEGES;

