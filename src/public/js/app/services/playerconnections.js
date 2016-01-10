import app from '../browserapp';
import ioClient from 'socket.io-client';
import config from '../../../../config';

app.factory('playerconnections',['$rootScope', function($rootScope){

    var socket;

    function connect(displayname, setEnemyName, setEnemyWeapon){
        var connectionUrl = config.domain + ':' + config.connectionPort;

        socket = ioClient.connect(connectionUrl, {'forceNew': true, query:'displayname=' + displayname });
        socket.once('connect', function() {
            this.connected = true;
        });
        socket.once('receive-enemy-name', function(data) {
            setEnemyName( data.displayName );
            $rootScope.$broadcast('rps-enemy-name-received');
        });
        socket.once('receive-enemy-weapon', function(data) {
            setEnemyWeapon( data.weaponChoice );
            $rootScope.$broadcast('rps-enemy-weapon-received');
        });
        socket.once('disconnect', function() {
            disconnect();
            $rootScope.$broadcast('rps-disconnected');
        });
    }

    function weaponSelection(weapon){
        if(socket) {
            socket.emit('weapon-selected', {weaponChoice:weapon.id});
        }
    }

    function disconnect(){
        if(socket && socket.connected){
            socket.disconnect();
        }
        if(socket) {
            socket.removeAllListeners('connect');
            socket.removeAllListeners('receive-enemy-name');
            socket.removeAllListeners('receive-enemy-weapon');
            socket.removeAllListeners('disconnect');
            socket = null;
        }
    }

    function isConnected() {
        if(socket){
            return socket.connected;
        }
        return false;
    }

    return {
        connect: connect,
        disconnect: disconnect,
        isConnected: isConnected,
        weaponSelection: weaponSelection
    };
}]);
