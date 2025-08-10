import express from 'express';
import http from 'http';
import cors from 'cors';

import {WebSocketServer} from 'ws';
import { handleConnection } from './websockets/router';
import { startGameLoop } from './game/gameLoop';

const port = 8080;

const app = express();
app.use(cors());

const server = http.createServer(app);

const wss = new WebSocketServer({server});

wss.on('connection',handleConnection);

server.listen(port,()=>{
    console.log(`Bithub server is running and listening on port:${port}`);
    startGameLoop();
})