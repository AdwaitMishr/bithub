import {rooms} from '../websockets/rooms';

// define tick rate
const TICK_RATE = 50;
const PLAYER_SPEED = 3.25;

const collisionMap = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

interface updateElement {
    playerId: string,
    position: {x:number,y:number}
}

function gameLoop(){
    
    rooms.forEach((room,roomId)=>{
        const updates:updateElement[] = [];
        const playerStates = Array.from(room.players.entries()).map(([id, state]) => ({ 
      id, 
      x: state.x, 
      y: state.y 
    }));
    if (playerStates.length > 0) {
      console.log(`[Game Loop Tick] Room '${roomId}' state:`, playerStates);
    }

        room.players.forEach((player,playerId)=>{
            if (player.lastIntent){
                let newX = player.x;
                let newY = player.y;

                if (player.lastIntent === 'up') newY -= PLAYER_SPEED;
                if (player.lastIntent === 'down') newY += PLAYER_SPEED;
                if (player.lastIntent === 'left') newX -= PLAYER_SPEED;
                if (player.lastIntent === 'right') newX += PLAYER_SPEED;

                const mapX = Math.floor(newX / 100);
                const mapY = Math.floor(newY / 100);
                if (collisionMap[mapY] && collisionMap[mapY][mapX] === 0) {
                    player.x = newX;
                    player.y = newY;
                }
                player.lastIntent = undefined;
            }
            updates.push({playerId:playerId,position:{x:player.x, y:player.y}});
        });

        if (updates.length>0){
            const message = {
                type: 'game_state_update',
                payload: {updates}
            };
            const messageString = JSON.stringify(message);
            room.clients.forEach(client=>{
                client.send(messageString);
            })
        }
    })
}

export function startGameLoop(){
    console.log('Game loop started');
    setInterval(gameLoop, TICK_RATE);
}