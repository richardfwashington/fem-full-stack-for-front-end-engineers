const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(PORT, function () { console.log('Listening on ' + PORT); });

process.on('SIGINT', function() {
    server.close(() => {
        shutdownDB();
    });
});

/** Begin websocket */

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('Connected clients:' + numClients);

    wss.broadcast(`Current visitors: ${numClients}`);   
    
    if(ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server');
    }

    db.run(`INSERT INTO visitors (count time) 
    VALUES (${numClients} datetime('now'))`
    );

    ws.on('close', function(){
        wss.broadcast(`Current visitors: ${numClients}`);
        console.log('A client has disconnected');
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    }); 
}

/** End websocket */

/** Begin database */

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:'); // Could be a file for persistent storage date e.g. 'mydb.sqlite'

db.serialize(function() {
    db.run(`CREATE TABLE visitors (
        count INTEGER
        time TEXT
    )`);
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutdownDB() {
    getCounts();
    console.log('Shutting down database');
    db.close();
}

/** End database */