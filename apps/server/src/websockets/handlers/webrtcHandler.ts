import {clients} from '../rooms';

export function relaySignal(senderId: string, payload: {targetId: string, signal: any}){
    const targetSocket = clients.get(payload.targetId);

    if (targetSocket){
        targetSocket.send(
            JSON.stringify({
                type: 'webrtc_signal',
                payload: {
                    senderId: senderId,
                    signal: payload.signal,
                }
            })
        )
    }
}