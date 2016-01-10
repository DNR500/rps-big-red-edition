import {expect} from 'chai';
import sinon from 'sinon';
import ioClient from 'socket.io-client';
import {noSelectionItem, findWeaponById} from '../../../../src/node/rps/weapons';
import {computerPlayer, singlePlayer, twoPlayer} from '../../../../src/public/js/app/vo/gamemode';

describe('RPS result controller', function() {
    var scope, location, ctrl;

    var controller;

    var capturedGameSession;
    var capturedRouteInhibitor;

    var mockSocket;

    beforeEach(function (){

        mockSocket = {
            disconnect: function(){
                this.connected = false;
            },
            removeAllListeners: function(eventName) {
                if(!this.removedListeners){
                    this.removedListeners = {};
                }
                this.removedListeners[eventName] = true;
            },
            emit: function() {

            },
            once: function(name, func){
                if(!this.listenerFuncs){
                    this.connected = true;
                    this.listenerFuncs = {};
                }
                this.listenerFuncs[name] = func;
            },
            eventFire: function(name, data){
                this.listenerFuncs[name](data);
            }
        };
        sinon.stub(ioClient, 'connect', function() {
            return mockSocket;
        });

        angular.mock.module('RockPaperScissors');

        inject(function($rootScope, $controller, $location, gamesession, routeinhibitor) {
            scope = $rootScope.$new();

            location = $location;
            sinon.spy($location, 'path');

            capturedGameSession = gamesession;
            capturedGameSession.reset();

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');
            controller = $controller;
        });
    });

    afterEach(function(){
        location.path.restore();
        capturedRouteInhibitor.restrictToCorrectRoute.restore();
        ioClient.connect.restore();
    });

    it('should invoke the route inhibitor with the correct params', function() {
        capturedGameSession.setGameType(singlePlayer);
        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[0]).to.equal('result');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[1]).to.equal(scope);
    });

    it('should report Deadlock if players pick the same weapon', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.setPlayerWeapon(findWeaponById('scissors'));
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'scissors'});

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('Deadlock!');
    });

    it('should report You Win if player picks the winning weapon', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.setPlayerWeapon(findWeaponById('scissors'));
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'paper'});

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('You Win!');
    });

    it('should report You Lose if player picks the winning weapon', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.setPlayerWeapon(findWeaponById('rock'));
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'paper'});

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('You Lose!');
    });

    it('should report They Forfeit if enemy player fails to pick the winning weapon', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.setPlayerWeapon(findWeaponById('rock'));
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('They Forfeit!');
    });


    it('should report You Forfeit if player does not pick a weapon', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('You Forfeit!');
    });

    it('should report an emtpy string if the game type is computer-player', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(computerPlayer);

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.gameOutcomeMessage).to.equal('');
    });

    it('should reset the game and send the player to the start screen when playAgain method is called', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        expect(mockSocket.connected).to.be.true;

        capturedGameSession.markGamePlayed();

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');

        ctrl.playAgain();

        expect(capturedGameSession.getGameType()).to.be.null;
        expect(capturedGameSession.getPlayerName()).to.equal('');
        expect(capturedGameSession.getPlayerWeapon()).to.equal(noSelectionItem);
        expect(capturedGameSession.getEnemyPlayerName()).to.equal('Computer');
        expect(capturedGameSession.getEnemyPlayerWeapon()).to.equal(noSelectionItem);
        expect(capturedGameSession.isGamePlayed()).to.be.false;
        expect(capturedGameSession.isEnemyWeaponReceived()).to.be.false;

        expect(capturedRouteInhibitor.correctRoute()).to.equal('start');
        expect(location.path.lastCall.args[0]).to.equal('/start');
    });

    it('should disconnect the gamesession if it is connected', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        expect(mockSocket.connected).to.be.true;

        capturedGameSession.markGamePlayed();

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(mockSocket.connected).to.be.false;
    });

    it('should provide access to the game results for display', function() {
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'scissors'});

        expect(mockSocket.connected).to.be.true;

        capturedGameSession.markGamePlayed();

        ctrl = controller('ResultCtrl', {
            $scope: scope
        });

        expect(ctrl.playerName).to.equal('Willy');
        expect(ctrl.playerWeapon).to.equal(findWeaponById('no-selection'));
        expect(ctrl.enemyPlayerName).to.equal('Johny');
        expect(ctrl.enemyPlayerWeapon).to.equal(findWeaponById('scissors'));
    });
});