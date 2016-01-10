import {expect} from 'chai';
import sinon from 'sinon';
import ioClient from 'socket.io-client';
import Modernizr from '../../../../src/public/js/app/utils/featuredetection';
import {twoPlayer} from '../../../../src/public/js/app/vo/gamemode';


describe('RPS waiting controller', function() {
    var scope, location, timeout, cntrl;

    var capturedGameSession;
    var capturedRouteInhibitor;

    var mockSocket;

    beforeEach(function (){

        mockSocket = {
            disconnect: function(){},
            removeAllListeners: function(){},
            emit: function(){},
            once: function(name, func){
                if(!this.listenerFuncs){
                    this.listenerFuncs = {};
                    this.connected = true;
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

        inject(function($rootScope, $controller, $location, $timeout, gamesession, routeinhibitor) {
            scope = $rootScope.$new();

            timeout = $timeout;

            location = $location;
            sinon.spy($location, 'path');

            capturedGameSession = gamesession;
            capturedGameSession.reset();
            capturedGameSession.setGameType(twoPlayer);
            capturedGameSession.setPlayerName('Willy');
            capturedGameSession.connect();
            mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
            capturedGameSession.markGamePlayed();

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');


            cntrl = $controller('WaitingCtrl', {
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
        expect(capturedRouteInhibitor.restrictToCorrectRoute.lastCall.args[0]).to.equal('waiting');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.lastCall.args[1]).to.equal(scope);
    });

    it('should attempt to move to the result screen on the receive-enemy-weapon event', function() {
        expect(capturedRouteInhibitor.correctRoute()).to.equal('waiting');

        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'scissors'});
        expect(capturedGameSession.isEnemyWeaponReceived()).to.be.true;
        expect(capturedGameSession.getEnemyPlayerWeapon().id).to.equal('scissors');
        timeout.flush();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        expect(location.path.lastCall.args[0]).to.equal('/result');
    });

    it('should re-route to the start screen if a disconnect fires whilst on the connect screen', function() {
        mockSocket.eventFire('disconnect');
        timeout.flush();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        expect(location.path.lastCall.args[0]).to.equal('/result');
    });

    it('should provide a different img url depending on the browsers ability to handle smil animation', function() {
        Modernizr.smil = true;

        expect(cntrl.getLoadingImage()).to.equal('img/loader/ring-alt.svg');

        Modernizr.smil = false;

        expect(cntrl.getLoadingImage()).to.equal('img/loader/default.gif');
    });

});