import {WebSocket} from 'ws';

interface PlayerState {
    x: number;
    y: number;

    variant?: number | null;
    nickname?: string | null;
}

const defaultSpawnPoint = {x:100,y:100};

export class Room{
    public clients = new Set<WebSocket>();
    public players = new Map<string,PlayerState>();

    constructor(public readonly id:string){}

    addPlayer(ws: WebSocket,playerId:string){
        this.clients.add(ws);
        this.players.set(playerId,defaultSpawnPoint)
    }

    removePlayer(ws: WebSocket,playerId:string){
        this.clients.delete(ws);
        this.players.delete(playerId);
    }
}

