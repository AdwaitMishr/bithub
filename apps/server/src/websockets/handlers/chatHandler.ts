import {WebSocket} from 'ws';
import { broadcastToRoom } from '../rooms';

export function handleChatMessage(ws: WebSocket, payload: {text: string}){
    const message = {
        type: 'chat_message',
        payload: {
            senderId: 'anonymous',
            text: payload.text
        }
    };
    broadcastToRoom(ws,message);
}