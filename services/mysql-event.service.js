const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');

module.exports = monitorMysql = async (io) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
  });

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
    excludedSchemas: {
      mysql: true,
    },
  });

  await instance.start();

  instance.addTrigger({
    name: 'TEST',
    expression: '*',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => {
      const { type, table } = event;
      console.log({
        type,
        table,
      });
      // Emit a socket event
      io.sockets.emit('mysql-event', { type, table });
    },
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

