import {expect} from 'chai';
import sinon from 'sinon';
import ioClient from 'socket.io-client';
import {findWeaponById} from '../../../../src/node/rps/weapons';
import {twoPlayer} from '../../../../src/public/js/app/vo/gamemode';

describe('RPS route inhibitor', function() {
    var rootscope, scope, location;

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

        inject(function(_$rootScope_, $rootScope, $location, gamesession, routeinhibitor) {
            rootscope = $rootScope;
            scope = $rootScope.$new();

            location = $location;
            sinon.spy(location, 'path');

            capturedGameSession = gamesession;
            capturedGameSession.reset();

            capturedRouteInhibitor = routeinhibitor;
        });
    });

    afterEach(function(){
        location.path.restore();
        ioClient.connect.restore();
    });

    it('should not attempt to change location if the route passed is correct, and should prevent navigation', function() {
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        capturedGameSession.setPlayerWeapon(findWeaponById('rock'));
        mockSocket.eventFire('receive-enemy-weapon', {displayName:'Johny'});
        capturedGameSession.markGamePlayed();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        capturedRouteInhibitor.restrictToCorrectRoute('result', scope);

        expect(location.path.called).to.be.false;

        var event = rootscope.$broadcast('$locationChangeStart');
        expect(event.defaultPrevented).to.be.true;
    });

    it('should attempt to change location if the route passed is not the correct route, and should allow navigation', function() {
        capturedGameSession.setGameType(twoPlayer);
        capturedGameSession.setPlayerName('Willy');
        capturedGameSession.connect();
        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        capturedGameSession.setPlayerWeapon(findWeaponById('rock'));
        mockSocket.eventFire('receive-enemy-weapon', {displayName:'Johny'});
        capturedGameSession.markGamePlayed();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        capturedRouteInhibitor.restrictToCorrectRoute('start', scope);

        expect(location.path.lastCall.args[0]).to.equal('/result');

        var event = rootscope.$broadcast('$locationChangeStart');
        expect(event.defaultPrevented).to.be.false;
    });
});