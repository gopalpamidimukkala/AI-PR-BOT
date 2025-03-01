const path = require('path');

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
} 