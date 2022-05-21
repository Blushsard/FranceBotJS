DROP DATABASE IF EXISTS FranceBotDB;

CREATE DATABASE FranceBotDB;
USE FranceBotDB;


DROP TABLE IF EXISTS salons;
CREATE TABLE salons(
    pk_id_salon VARCHAR(22) PRIMARY KEY NOT NULL,
    b_memes TINYINT NOT NULL,
    b_reposts TINYINT NOT NULL,
    b_threads TINYINT NOT NULL,
    b_feed TINYINT NOT NULL,
    b_stats TINYINT NOT NULL,
    b_logs TINYINT NOT NULL,
    b_exp TINYINT NOT NUll
);


DROP TABLE IF EXISTS messages;
CREATE TABLE messages(
    pk_msg_id VARCHAR(22) PRIMARY KEY NOT NULL,
    s_author_id VARCHAR(22) NOT NULL,
    s_channel_id VARCHAR(22) NOT NULL,
    s_cat_name TEXT NOT NULL,
    s_jump_url TEXT NOT NULL,
    n_likes INT NOT NULL,
    s_msg_content TEXT,
    n_day_date INT NOT NULL,
    n_month_date INT NOT NULL,
    b_stf TINYINT NOT NULL,
    b_stt TINYINT NOT NULL,
    b_str TINYINT NOT NULL
);


DROP TABLE IF EXISTS attachments;
CREATE TABLE attachments(
    pk_msg_id VARCHAR(22) NOT NULL,
    s_type TEXT NOT NULL,
    s_filename TEXT NOT NULL,
    s_url TEXT NOT NULL
);


DROP TABLE moyenne;
CREATE TABLE moyenne(
    n_moyenne FLOAT NOT NULL,
    n_nb_msg_moyenne INT NOT NULL
);
INSERT INTO Moyenne VALUES (3, 50);


DROP TABLE IF EXISTS users;
CREATE TABLE users(
    pk_user_id VARCHAR(22) PRIMARY KEY NOT NULL,
    n_level INT NOT NULL,
    n_xp BIGINT NOT NULL,
    n_nb_messages INT NOT NULL,
    n_progress DOUBLE NOT NULL
);

DROP USER IF EXISTS 'franceBot'@'localhost';
CREATE USER 'franceBot'@'localhost' IDENTIFIED BY 'N0XlWK$uw#A8UM';
GRANT USAGE ON FranceBotDB.* TO 'franceBot'@'localhost';
GRANT ALL PRIVILEGES ON FranceBotDB.* TO 'franceBot'@'localhost';
FLUSH PRIVILEGES;
