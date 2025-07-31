import {WebSocket} from 'ws';

const rooms =  new Map<string, Set<WebSocket>>();

const clientRooms = new Map<WebSocket, string>();

export function joinRoom(ws: WebSocket, roomId: string){
    if (!rooms.has(roomId)){
        rooms.set(roomId, new Set());
    }

    rooms.get(roomId)?.add(ws);
    clientRooms.set(ws,roomId);

    console.log('Client joined room:'+roomId);
}

export function leaveRoom(ws: WebSocket){
    const roomId = clientRooms.get(ws);
    if (roomId){
        rooms.get(roomId)?.delete(ws);
        clientRooms.delete(ws);

        console.log('Client left the room:'+roomId);
    }
}

export function broadcastToRoom(ws: WebSocket, message: object){
    const roomId = clientRooms.get(ws);
    if (!roomId) return;

    const roomClients = rooms.get(roomId);
    if (!roomClients) return;

    const messageString = JSON.stringify(message);

    roomClients.forEach((client)=>{
        if (client!==ws && client.readyState===WebSocket.OPEN){
            client.send(messageString);
        }
    });
}