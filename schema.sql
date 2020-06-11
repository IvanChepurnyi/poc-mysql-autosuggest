DROP TABLE IF EXISTS products;

CREATE TABLE products
(
    product_id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    sku VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id),
    FULLTEXT INDEX `searchable` (sku, name, brand)
);

DROP TABLE IF EXISTS product_suggestions;

CREATE TABLE product_suggestions
(
    suggestion VARCHAR(255) NOT NULL,
    trigram TEXT NOT NULL,
    UNIQUE suggestion (suggestion),
    FULLTEXT INDEX searchable (trigram)
);