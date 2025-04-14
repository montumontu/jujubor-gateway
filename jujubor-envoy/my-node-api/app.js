// app.js

const express = require('express');
const app = express();
const port = 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Define a GET route
app.get('/api/greet', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// Define a POST route
app.post('/api/echo', (req, res) => {
    res.json({ received: req.body });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is walking on http://localhost:${port}`);
});

