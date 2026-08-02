const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'ecom_secret_key_123',
    resave: false,
    saveUninitialized: true
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize Database on startup
db.initDB();

// Helper function to get cart items from DB
async function getCartItems(sessionId) {
    const [rows] = await db.pool.query(`
        SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url 
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.session_id = ?
    `, [sessionId]);
    return rows;
}

// Helper to get or create cart
async function getOrCreateCartId(sessionId) {
    let [carts] = await db.pool.query('SELECT id FROM carts WHERE session_id = ?', [sessionId]);
    if (carts.length === 0) {
        const [result] = await db.pool.query('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
        return result.insertId;
    }
    return carts[0].id;
}

// --- Routes ---

// Home Page - List all products
app.get('/', async (req, res) => {
    try {
        const [products] = await db.pool.query('SELECT * FROM products');
        const cartItems = await getCartItems(req.sessionID);
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        res.render('layout', {
            body: 'index',
            title: 'Tech Store - Home',
            products: products,
            cartCount: cartCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Add to Cart
app.post('/cart/add', async (req, res) => {
    const productId = parseInt(req.body.productId);
    try {
        const cartId = await getOrCreateCartId(req.sessionID);
        
        // Insert or update cart item
        await db.pool.query(`
            INSERT INTO cart_items (cart_id, product_id, quantity) 
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE quantity = quantity + 1
        `, [cartId, productId]);
        
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// View Cart
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await getCartItems(req.sessionID);
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // Format the total for display in Indian currency style
        const totalFormatted = total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Match the frontend expectation of 'cart' array
        const cartForView = cartItems.map(item => ({
            id: item.product_id, // ejs uses item.id for removal
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            quantity: item.quantity
        }));
        
        res.render('layout', {
            body: 'cart',
            title: 'Your Cart',
            cart: cartForView,
            total: totalFormatted,
            cartCount: cartCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Remove from Cart
app.post('/cart/remove', async (req, res) => {
    const productId = parseInt(req.body.productId);
    try {
        const [carts] = await db.pool.query('SELECT id FROM carts WHERE session_id = ?', [req.sessionID]);
        if (carts.length > 0) {
            await db.pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [carts[0].id, productId]);
        }
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Checkout Page
app.get('/checkout', async (req, res) => {
    try {
        const cartItems = await getCartItems(req.sessionID);
        if (cartItems.length === 0) {
            return res.redirect('/cart');
        }
        
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartForView = cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));
        
        res.render('layout', {
            body: 'checkout',
            title: 'Checkout',
            cart: cartForView,
            total: total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            cartCount: cartCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Process Payment (Mock) and Create Order
app.post('/checkout', async (req, res) => {
    const { name, address, payment } = req.body;
    
    try {
        const cartItems = await getCartItems(req.sessionID);
        if (cartItems.length === 0) return res.redirect('/cart');
        
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create Order
        const [orderResult] = await db.pool.query(`
            INSERT INTO orders (customer_name, customer_address, payment_method, total_amount)
            VALUES (?, ?, ?, ?)
        `, [name, address, payment || 'credit', total]);
        
        const orderId = orderResult.insertId;
        
        // Move items to order_items
        for (const item of cartItems) {
            await db.pool.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.price]);
        }
        
        // Clear cart
        const [carts] = await db.pool.query('SELECT id FROM carts WHERE session_id = ?', [req.sessionID]);
        if (carts.length > 0) {
            await db.pool.query('DELETE FROM carts WHERE id = ?', [carts[0].id]);
        }
        
        // Force session regeneration to get a clean cart ID for next time
        req.session.regenerate((err) => {
            res.render('layout', {
                body: 'success',
                title: 'Order Successful',
                cartCount: 0
            });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
