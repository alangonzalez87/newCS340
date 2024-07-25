INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE account
SET account_type = 'Admin'
WHERE email = 'tony@starkent.com';

-- database create comments
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    inventory_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

ALTER TABLE comments
ADD COLUMN parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE;



DELETE FROM account
WHERE email = 'tony@starkent.com';

UPDATE inventory
SET description = REPLACE(description, 'small interiors', 'a huge interior')
WHERE model = 'GM Hummer';

SELECT i.make, i.model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
