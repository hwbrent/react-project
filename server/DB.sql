-- terminal command to open the test database:
-- /Applications/Postgres.app/Contents/Versions/13/bin/psql -p2468 "test"

-- CREATE DATABASE {DB name here}; -- creates a DB

/*
psql commands:

\c DBName --> to connect to database with name `DBName`
\dt --> to show the list of relations (i.e. tables)
*/

-- creating the movements table:
CREATE TABLE movements(
    movement_name text PRIMARY KEY,
    default_sets integer DEFAULT 3,
    default_reps integer DEFAULT 8,
    youtube_link text
);

-- testing entering a movement in to the movements table
INSERT INTO movements(movement_name, default_sets, default_reps, youtube_link)
VALUES ('Bench Press', 3, 8, 'https://youtu.be/vcBig73ojpE');

-- creating the logs table:
CREATE TABLE logs(
    log_id SERIAL PRIMARY KEY,
    movement_name text REFERENCES movements (movement_name), -- foreign key
    date date,
    weight numeric,
    sets_completed integer,
    reps_completed integer,
    notes text
);

-- creating the routines table:
CREATE TABLE routines (
    routine_name text PRIMARY KEY
);

-- creating the routine_days table:
CREATE TABLE routine_days (
    day_name text PRIMARY KEY,
    parent_routine_name text REFERENCES routines (routine_name) -- foreign key
);

-- creating the routine_days_and_movements table:
CREATE TABLE routine_days_and_movements (
    day_movement_combo_id SERIAL PRIMARY KEY,
    parent_day_name text REFERENCES routine_days (day_name), -- foreign key
    movement_name text REFERENCES movements (movement_name) -- foreign key
);

-- to delete a table, use DROP TABLE {table name}
-- to empty a table of its contents but keep the table itself, use TRUNCATE TABLE {table name/s}

-- adding boolean-valued column to indicate whether a movement is in_rotation i.e. if it's currently being used in a routine
ALTER TABLE routine_days_and_movements ADD "in_rotation" boolean DEFAULT false;

INSERT INTO logs(movement_name, date, weight, sets_completed, reps_completed) VALUES ('Quad Extensions', '2021-08-31', 59, 3, 8);

ALTER TABLE logs ALTER COLUMN notes SET DEFAULT NULL;

-- had to recreate the tables
CREATE TABLE routine_days(
    combo_id SERIAL PRIMARY KEY,
    day_name text,
    parent_routine_name text REFERENCES routines (routine_name)
);
CREATE TABLE routine_days_and_names(
    combo_id SERIAL PRIMARY KEY,
    parent_day_name text,
    movement_name text REFERENCES movements (movement_name)
);

INSERT INTO logs(movement_name, date, weight, sets_completed, reps_completed, notes) VALUES