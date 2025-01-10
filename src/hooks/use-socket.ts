import { useEffect, useRef } from 'react';
import { Socket, connect } from 'socket.io-client';

export const useSocket = () => {
  const socket = useRef<typeof Socket | null>(null);

  useEffect(() => {
    socket.current = connect(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  return { socket: socket.current };
};