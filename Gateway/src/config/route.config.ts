export const routesServer = {
  services: {
    ChatBotService: 'http://localhost:3000',
    AuthService: 'http://localhost:3001',
    UsersService: 'http://localhost:3002'
  }
};

export const publicRoutes: string[] = [
  '/AuthService/auth/login',
  '/AuthService/auth/register',
  '/ChatBotService/chat',
  '/ChatBotService/chat/stream',
];

export const AdminRoutes: string[] = [
  '/ChatBotService/documents/:id/file',
];
