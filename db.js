const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '4019',
  database: process.env.DB_NAME || 'ecom_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function initDB() {
    try {
        // Create database if it doesn't exist using a connection without database specified
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '4019',
            port: process.env.DB_PORT || 3306
        }).promise();
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS ecom_db;`);
        await connection.end();

        // Now connect to the database to create table
        const db = promisePool;
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image_url VARCHAR(500)
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS carts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_cart_product (cart_id, product_id)
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_address TEXT NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
            );
        `);

        // Check if we need to insert dummy data
        const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
        if (rows[0].count === 0) {
            console.log('Inserting dummy products...');
            await db.query(`
                INSERT INTO products (name, description, price, image_url) VALUES 
                ('Quantum Laptop Pro', 'High-performance laptop with 32GB RAM and 1TB SSD.', 124999.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600'),
                ('HyperPhone 12', 'Latest smartphone with a stunning OLED display and advanced camera system.', 74999.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'),
                ('Sonic Noise-Canceling Headphones', 'Over-ear headphones with industry-leading noise cancellation.', 24999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'),
                ('SmartWatch X', 'Track your health and stay connected on the go.', 15999.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'),
                ('MechKeyboard RGB', 'Mechanical keyboard with customizable RGB lighting and tactile switches.', 9999.00, 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600'),
                ('UltraView 4K Monitor', '32-inch 4K UHD monitor for professional color accuracy.', 36999.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600')
            `);
        } else {
            // Update existing USD prices to INR if they haven't been updated yet
            await db.query(`
                UPDATE products SET price = CASE 
                    WHEN name LIKE '%Laptop%' THEN 124999.00
                    WHEN name LIKE '%Phone%' THEN 74999.00
                    WHEN name LIKE '%Headphones%' THEN 24999.00
                    WHEN name LIKE '%Watch%' THEN 15999.00
                    WHEN name LIKE '%Keyboard%' THEN 9999.00
                    WHEN name LIKE '%Monitor%' THEN 36999.00
                    ELSE price * 83
                END WHERE price < 2000;
            `);
        }
        
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = {
    pool: promisePool,
    initDB
};
