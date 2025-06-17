import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});

export default app;
