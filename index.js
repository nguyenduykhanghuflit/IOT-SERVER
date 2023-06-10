var express = require('express');
var app = express();
const http = require('http');
const server = http.createServer(app);

//init socket
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.use(express.json());

// middleware
var cors = require('cors');
app.use(cors({ credentials: true, origin: true }));

//service mysql
const monitorMysql = require('./services/mysql-event.service');
monitorMysql(io)
  .then(() => console.log('MySql Event is running'))
  .catch((err) => console.log(`MySql Event Error: ${err}`));

const route = require('./routes/index.route');
app.use('/api', route);

server.listen(3002, () => {
  console.log('Server started on port 3002');
});
