import { Server } from 'socket.io';

const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
    });

    io.on('connection', socket => {
      const userId = socket.handshake.query.userId;
      socket.join(userId as string); 

      console.log(`User ${userId} connected to socket`);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
