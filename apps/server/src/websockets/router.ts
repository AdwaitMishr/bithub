import {WebSocket} from 'ws';
import { joinRoom, leaveRoom } from './rooms';
import { handleChatMessage } from './handlers/chatHandler';


export function handleConnection(ws: WebSocket){
    console.log('New client connection');

    ws.on('message',(rawMessage)=>{
        try{
            const {type, payload} = JSON.parse(rawMessage.toString());

            switch(type){
                case 'join_room':
                    joinRoom(ws,payload.roomId);
                    break;
                case 'chat_message':
                    handleChatMessage(ws,payload);
                    break;
                //add update_position route next

                default:
                    console.log('Unknown message type. Please retry');
            }
        }
        catch(error){
            console.error('Failed to parse message or invalid message format.');
        }
    })
    ws.on('close',()=>{
        leaveRoom(ws);
    })
}