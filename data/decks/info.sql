-- DATABASE COMMANDS
CREATE DATABASE db; -- Create a database named 'db'.
DROP DATABASE db; -- Delete the database.
\l -- View all databases.
\c db -- Connect to the database named 'db'.


-- TABLE COMMANDS
\d | \dt -- See all table names in a database.
\d person -- See the content of table named 'person'.

-- Sorting
SELECT * FROM person -- Show all *columns* in a table named 'person'.
SELECT first_name, last_name FROM person -- Only selects specified rows.
SELECT * FROM person ORDER BY first_name; -- Select all columns and order by first_name (ascending / ASC).
SELECT * FROM person ORDER BY first_name, email DESC; -- Select all columns and order by first_name, then email (descending).
SELECT DISTINCT country_of_birth FROM person; -- Omit duplicates.
SELECT * FROM person WHERE country_of_birth = 'China' AND (gender IN ('Male', 'Female')); -- Sort based on conditions.

-- Filtering
SELECT * FROM person OFFSET 10 LIMIT 5; -- Start from 11th row, return 5 rows. FETCH FIRST 5 ROW ONLY; also works.
SELECT * FROM PERSON WHERE date_of_birth BETWEEN '2019-03-01' AND '2019-05-31'; -- Select between specific dates.
SELECT * FROM PERSON WHERE email LIKE '%irs%'; -- Select all people with the email pattern.
SELECT * FROM PERSON WHERE email ILIKE '%@___.com'; -- Case insensitive.
SELECT country_of_birth, COUNT(*) FROM person GROUP BY country_of_birth; -- Give the count for each category.
SELECT country_of_birth, COUNT(*) FROM person GROUP BY country_of_birth HAVING COUNT(*) >= 10; -- Return where number is 10 or higher.

-- Conditions, Operations and Functions
SELECT AVG(price) from car; -- MIN, MAX also works.
SELECT make, model, MIN(price) from car GROUP BY make, model; -- Minimum price for every car.
SELECT make, SUM(price) as sumAll FROM car GROUP BY make ORDER BY sumAll; -- Price sum of each brand of car, sorted.
SELECT id, make, model, price, ROUND(price - (price * .10), 2) as "Discount Price" FROM car; -- Create a new column with discounted price.
SELECT * FROM person WHERE email IS null; -- Select empty email columns;
SELECT id, first_name, COALESCE(email, '-- Email not provided --') FROM person; -- Use default value for missing emails.
SELECT 10 / NULLIF(0, 0); -- Return null if both values are equal. Prevents division exception.
DELETE FROM person WHERE first_name = 'El'; -- Delete row conditionally.
UPDATE person SET email = 'AmandiWooYeah@crack.pot' WHERE id = 9; -- Update email for row 9 in person table. Use comma for more updates.
SELECT * FROM person_id_seq; -- Select the increment function.
ALTER TABLE user_info RENAME COLUMN decks TO user_decks; -- Rename column.

-- Constraints
ALTER TABLE person ADD UNIQUE (email); -- Constraint: Items in email column must be unique.
ALTER TABLE person ADD CONSTRAINT gender_constraint CHECK (gender in ('Male', 'Female')); -- Limit possibilities.
ALTER TABLE person DROP CONSTRAINT person_email_key; -- Remove the constraint.

-- Dates
SELECT NOW(); -- Current date and time.
SELECT NOW()::DATE; -- Only the date.
SELECT NOW()::TIME; -- Only the time
SELECT NOW() - INTERVAL '1 YEAR'; -- Extract one year from current timestamp. MONTH, DAY, HOUR...
SELECT EXTRACT (YEAR FROM NOW()); -- Only return the year. MINUTE, SECOND, MS, CENTURY...
SELECT AGE(NOW(), '1996-12-31'); -- Calculate the age.


CREATE TABLE person ( -- Create a table named 'person'.
    id BIGSERIAL NOT NULL PRIMARY KEY, -- Uniquely identifies person in the table. | auto increment.
    name VARCHAR(50) NOT NULL, -- Cannot be blank.
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL
    car_id BIGINT REFERENCES car (id), UNIQUE (car_id) -- Reference another table.
);

UPDATE person SET car_id = 2 WHERE id = 1; -- Update the foreign key.
SELECT * FROM person JOIN car ON person.car_id = car.id; -- Join the tables.

SELECT person.first_name, person.last_name, -- Join, and display specific columns.
car.make, car.model, car.price FROM person
JOIN car ON person.car_id = car.id; -- Left JOIN displays non-matching values.


DROP TABLE person; -- Delete the table named person.

INSERT INTO
    person (id, first_name, last_name, gender, date_of_birth)
    VALUES (555, 'Jack', 'Jones', 'MALE', date '1990-12-11', 'jake@gmail.com');
    ON CONFLICT (id) DO NOTHING; -- Prevents constraint errors.
    ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, first_name = EXCLUDED.first_name; -- Update the conflicting row.

-- EXPORT
\copy (SELECT * FROM person LEFT JOIN car ON car.id = person.car_id) TO 'C:/Users/HAL9000/Desktop/people.csv' DELIMITER ',' CSV HEADER;

-- EXTENSIONS
SELECT * FROM pg_available_extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Unique id extensions.

-- JSON
SELECT decks -> 'd1' as d1 FROM person;

-- PSQL SHELL COMMANDS
\! cls -- Clear screen.
\i path -- Execute file from path.
\x -- Expanded display table.
\df -- See available functions.


-- OS TERMINAL COMMANDS
psql -h localhost -p 5432 -U postgres db -- Connect to the database.