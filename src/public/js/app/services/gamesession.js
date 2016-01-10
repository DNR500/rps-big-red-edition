import app from '../browserapp';
import {createPlayer} from '../vo/player';
import {weapons, noSelectionItem, randomSelectWeapon, findWeaponById} from '../../../../node/rps/weapons';

app.factory('gamesession',['playerconnections', function(playerconnections){
    var gameType = null,
        player1 = createPlayer('', noSelectionItem),
        player2 = createPlayer('Computer', noSelectionItem),
        enemyPlayerWeaponRecieved = false,
        gamePlayed = false;

    function reset() {
        gameType = null;
        player1 = createPlayer('', noSelectionItem),
        player2 = createPlayer('Computer', noSelectionItem),
        enemyPlayerWeaponRecieved = false;
        gamePlayed = false;
        playerconnections.disconnect();
    }

    function enemyPlayerWeaponCallback(enenmyWeaponId) {
        player2.weapon = findWeaponById(enenmyWeaponId);
        enemyPlayerWeaponRecieved = true;
    }
    function enemyPlayerNameCallback(enemyName) {
        player2.name = enemyName;
    }

    function markGamePlayed() {
        gamePlayed = true;

        playerconnections.weaponSelection(player1.weapon);

        if(gameType.autoGenerateEnemyWeapon){
            player2.weapon = randomSelectWeapon();
        }
        if(gameType.autoGeneratePlayerWeapon){
            player1.weapon = randomSelectWeapon();
        }
        if(gameType.autoGeneratePlayerName){
            player1.name = 'Computer';
        }
    }

    function connect() {
        playerconnections.connect(player1.name, enemyPlayerNameCallback, enemyPlayerWeaponCallback);
    }

    function computerVsComputer(){
        if(!gameType.requiresUserToPlay){
            markGamePlayed();
        }
    }

    return {
        connect:connect,
        markGamePlayed: markGamePlayed,
        reset: reset,
        disconnect: function() {
            playerconnections.disconnect();
        },
        isConnected: function() {
            return playerconnections.isConnected();
        },
        getWeapons:function () {
            return weapons;
        },
        getGameType:function () {
            return gameType;
        },
        setGameType:function (type) {
            gameType = type;
            computerVsComputer();
        },
        isGamePlayed:function () {
            return gamePlayed;
        },
        setPlayerName:function (name) {
            player1.name = name;
        },
        getPlayerName:function () {
            return player1.name;
        },
        setPlayerWeapon:function (weapon) {
            player1.weapon = weapon;
        },
        getPlayerWeapon:function () {
            return player1.weapon;
        },
        getEnemyPlayerName:function () {
            return player2.name;
        },
        getEnemyPlayerWeapon:function () {
            return player2.weapon;
        },
        isEnemyWeaponReceived:function () {
            return enemyPlayerWeaponRecieved;
        }
    };
}]);