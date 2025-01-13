import { Server } from 'socket.io';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const io = new Server({
  path: '/api/socket',
  addTrailingSlash: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle thread messages
  socket.on('server:thread:message', (message) => {
    socket.broadcast.emit(`thread:message:${message.parentId}`, message);
  });

  // Handle channel messages
  socket.on('server:message', ({ channelId, message }) => {
    socket.broadcast.emit(`message:new:${channelId}`, message);
  });

  // Handle reactions
  socket.on('server:reaction', (data) => {
    socket.broadcast.emit(`message:reactions:${data.messageId}`, data.reactions);
  });
});

export async function GET(req: Request) {
  // Handle CORS
  const headersList = await headers();
  const origin = headersList.get('origin') || '';

  // Handle socket.io negotiation
  const searchParams = new URL(req.url).searchParams;
  const transport = searchParams.get('transport');
  const sid = searchParams.get('sid');

  if (transport === 'polling' && !sid) {
    return new Response(undefined, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  return new Response('Socket route initialized');
}

export const dynamic = 'force-dynamic';