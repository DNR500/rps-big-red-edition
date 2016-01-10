import config from '../../config';
import {findWeaponById, noSelectionItem} from '../../node/rps/weapons';

var io;
var unpairedSocket;

function exchangesNames(socket){
    socket.emit('receive-enemy-name', {
        displayName:socket.pairedSocket.displayname
    });
}
function exchangeWeapons(socket){
    socket.once('weapon-selected', function(data){
        var weaponId = data.weaponChoice;
        if(findWeaponById(weaponId) !== noSelectionItem) {
            socket.pairedSocket.emit('receive-enemy-weapon', {
                weaponChoice:data.weaponChoice
            });
        }
    });
}
function exchangeDisconnect(socket){
    socket.once('disconnect', function(){
        if(socket.timeOut){
            clearTimeout(socket.timeOut);
        }
        socket.pairedSocket.disconnect();
        socket.pairedSocket = null;
    });
}

function createPairedSockets(socket_1, socket_2){
    socket_1.pairedSocket = socket_2;
    socket_2.pairedSocket = socket_1;

    exchangesNames(socket_1);
    exchangesNames(socket_2);

    exchangeWeapons(socket_1);
    exchangeWeapons(socket_2);

    exchangeDisconnect(socket_1);
    exchangeDisconnect(socket_2);

    socket_1.timeOut = setTimeout(function(){
        socket_1.disconnect();
    }, config.timeoutDuration);
}

function initialise(http) {
    io = require('socket.io')(http);
    io.on('connection', function(socket){
        if(!socket.handshake.query.displayname){
            socket.disconnect();
            return;
        }

        socket.displayname = socket.handshake.query.displayname;
        socket.setMaxListeners(0);
        if(unpairedSocket){
            clearTimeout(unpairedSocket.timeOut);
            createPairedSockets(socket, unpairedSocket);
            unpairedSocket = null;
        } else {
            unpairedSocket = socket;
            unpairedSocket.timeOut = setTimeout(function(){
                unpairedSocket.disconnect();
                unpairedSocket = null;
            }, config.timeoutDuration);
        }
    });
}

export default initialise;



