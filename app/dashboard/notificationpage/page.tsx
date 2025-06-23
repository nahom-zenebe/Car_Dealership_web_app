import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io({
  path: '/api/socket_io',
  query: { userId: currentUser.id }, // pass logged-in user ID
});

function NotificationComponent() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('new_message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} className="bg-yellow-100 p-2 my-1">
          📢 {msg.content}
        </div>
      ))}
    </div>
  );
}
