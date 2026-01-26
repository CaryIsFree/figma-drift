const http = require('http');

const port = 8080;
const htmlFile = './test-page.html';

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        require('fs').readFile(htmlFile, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}/`);
    console.log(`Serving test-page.html`);
});
