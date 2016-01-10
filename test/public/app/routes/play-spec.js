import {expect} from 'chai';
import sinon from 'sinon';
import ioClient from 'socket.io-client';
import {singlePlayer, twoPlayer} from '../../../../src/public/js/app/vo/gamemode';


describe('RPS play controller', function() {
    var scope, location, timeout, ctrl;

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
            emit: function(eventName, value) {
                if(!this.emittedValues){
                    this.emittedValues = {};
                }
                this.emittedValues[eventName] = value;
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

        inject(function($rootScope, $controller, $timeout, $location, gamesession, routeinhibitor) {
            scope = $rootScope.$new();

            location = $location;
            sinon.spy($location, 'path');

            timeout = $timeout;

            capturedGameSession = gamesession;
            capturedGameSession.reset();
            capturedGameSession.setGameType(singlePlayer);
            capturedGameSession.setPlayerName('Willy');

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');

            ctrl = $controller('PlayCtrl', {
                $scope: scope
            });
        });
    });

    afterEach(function(){
        location.path.restore();
        capturedRouteInhibitor.restrictToCorrectRoute.restore();
        ioClient.connect.restore();
    });

    it('should invoke the route inhibitor with the correct params', function() {
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[0]).to.equal('play');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[1]).to.equal(scope);
    });

    it('should update the counter variable for a 5 second countdown and call the end of the game after five, setting gamePlayed to true and when single-player mode randomly selecting a weapon', function(){
        expect(capturedRouteInhibitor.correctRoute()).to.equal('play');

        expect(scope.counter).to.equal(5);
        timeout.flush();
        expect(scope.counter).to.equal(4);
        timeout.flush();
        expect(scope.counter).to.equal(3);
        timeout.flush();
        expect(scope.counter).to.equal(2);
        timeout.flush();
        expect(scope.counter).to.equal(1);
        timeout.flush();

        expect(capturedGameSession.isGamePlayed()).to.be.true;

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        expect(location.path.lastCall.args[0]).to.equal('/result');

        var enemyWeapon = capturedGameSession.getEnemyPlayerWeapon();
        var selectedWeaponFromArray = capturedGameSession.getWeapons().find(function(weapon){
            return weapon === enemyWeapon;
        });
        expect(selectedWeaponFromArray).to.not.be.undefined;
    });

    it('should update the counter variable for a 5 second countdown and call the end of the game after 5 secs, setting gamePlayed to true move the user to the results and when two-player mode and the enemy weapon has been received', function(){
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        expect(capturedRouteInhibitor.correctRoute()).to.equal('play');

        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'scissors'});

        expect(scope.counter).to.equal(5);
        timeout.flush();
        expect(scope.counter).to.equal(4);
        timeout.flush();
        expect(scope.counter).to.equal(3);
        timeout.flush();
        expect(scope.counter).to.equal(2);
        timeout.flush();

        var event = { preventDefault:function(){} };
        var weapon = { id: 'someWeapon' };
        ctrl.selectWeapon(event, weapon);

        expect(scope.counter).to.equal(1);
        timeout.flush();

        expect(capturedGameSession.isGamePlayed()).to.be.true;
        expect(mockSocket.emittedValues['weapon-selected'].weaponChoice).to.equal('someWeapon');

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        expect(location.path.lastCall.args[0]).to.equal('/result');
    });

    it('should update the counter variable for a 5 second countdown and call the end of the game after 5 secs, setting gamePlayed to true move the user to the waiting screen and when two-player mode and the enemy weapon has not been received', function(){
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        expect(capturedRouteInhibitor.correctRoute()).to.equal('play');

        expect(scope.counter).to.equal(5);
        timeout.flush();
        expect(scope.counter).to.equal(4);
        timeout.flush();

        var event = { preventDefault:function(){} };
        var weapon = { id: 'someWeapon' };
        ctrl.selectWeapon(event, weapon);

        expect(scope.counter).to.equal(3);
        timeout.flush();
        expect(scope.counter).to.equal(2);
        timeout.flush();
        expect(scope.counter).to.equal(1);
        timeout.flush();

        expect(capturedGameSession.isGamePlayed()).to.be.true;
        expect(mockSocket.emittedValues['weapon-selected'].weaponChoice).to.equal('someWeapon');

        expect(capturedRouteInhibitor.correctRoute()).to.equal('waiting');
        expect(location.path.lastCall.args[0]).to.equal('/waiting');
    });

    it('should register the players weapon when selectWeapon is called', function(){
        capturedGameSession.reset();
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});

        var event = {
            preventDefault:function(){}
        };
        sinon.spy(event, 'preventDefault');

        var weapon = {
            id: 'someWeapon'
        };

        ctrl.selectWeapon(event, weapon);

        expect(event.preventDefault.calledOnce).to.be.true;
        expect(capturedGameSession.getPlayerWeapon()).to.equal(weapon);

    });

    it('should register the players weapon when selectWeapon is called and not send if single-player', function(){
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');

        var event = {
            preventDefault:function(){}
        };
        sinon.spy(event, 'preventDefault');

        var weapon = {
            id: 'someWeapon'
        };

        ctrl.selectWeapon(event, weapon);

        expect(event.preventDefault.calledOnce).to.be.true;
        expect(capturedGameSession.getPlayerWeapon()).to.equal(weapon);

        expect(mockSocket.emittedValues).to.be.undefined;
    });

    it('should provide a css of selected-weapon if the weapon is selected, and an empty string if not selected ', function(){
        capturedGameSession.reset();
        capturedGameSession.setGameType(singlePlayer);
        capturedGameSession.setPlayerName('Willy');

        var event = {
            preventDefault:function(){}
        };

        var weapon = {
            id: 'someWeapon'
        };

        var otherWeapon = {
            id: 'someOtherWeapon'
        };

        ctrl.selectWeapon(event, weapon);
        var cssClass = ctrl.establishSelectedWeapon(weapon);
        expect(cssClass).to.equal('selected-weapon');

        ctrl.selectWeapon(event, otherWeapon);
        cssClass = ctrl.establishSelectedWeapon(weapon);
        expect(cssClass).to.equal('');
    });
});