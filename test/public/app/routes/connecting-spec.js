import {expect} from 'chai';
import sinon from 'sinon';
import {findWeaponById} from '../../../../src/node/rps/weapons';
import {twoPlayer} from '../../../../src/public/js/app/vo/gamemode';
import ioClient from 'socket.io-client';
import config from '../../../../src/config';
import Modernizr from '../../../../src/public/js/app/utils/featuredetection';

describe('RPS connecting controller', function() {
    var scope, location, timeout, cntrl;

    var capturedGameSession;
    var capturedRouteInhibitor;
    var originalDomain;
    var originalPort;

    var mockSocket;

    beforeEach(function (){

        mockSocket = {
            disconnect: function(){},
            removeAllListeners: function(){},
            once: function(name, func){
                if(!this.listenerFuncs){
                    this.listenerFuncs = {};
                }
                this.listenerFuncs[name] = func;
            },
            eventFire: function(name, data){
                this.connected = true;
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

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');

            originalDomain = config.domain;
            config.domain = 'asdf://somedomain';
            originalPort = config.connectionPort;
            config.connectionPort = 8888;

            cntrl = $controller('ConnectingCtrl', {
                $scope: scope
            });
        });
    });

    afterEach(function(){
        location.path.restore();
        ioClient.connect.restore();
        capturedRouteInhibitor.restrictToCorrectRoute.restore();

        config.domain = originalDomain;
        config.connectionPort = originalPort;
    });

    it('should invoke the route inhibitor with the correct params', function() {
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[0]).to.equal('connecting');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[1]).to.equal(scope);
    });

    it('should attempt to connect to the domain listed in the config', function(){
        expect(ioClient.connect.lastCall.args[0]).to.equal('asdf://somedomain:8888');
    });

    it('should attempt to connect to the socket server sending the player name and allowing enemy name and weapon to be set', function() {
        expect(ioClient.connect.calledOnce).to.be.true;

        expect(ioClient.connect.lastCall.args[1].query).to.equal('displayname=Willy');

        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        expect(capturedGameSession.getEnemyPlayerName()).to.equal('Johny');

        var enemyWeapon = findWeaponById('scissors');
        mockSocket.eventFire('receive-enemy-weapon', {weaponChoice:'scissors'});
        expect(capturedGameSession.getEnemyPlayerWeapon()).to.equal(enemyWeapon);

    });

    it('should attempt to move to the play screen on the enemy-name-recieved event, after setting the enemy name variable', function() {
        expect(capturedRouteInhibitor.correctRoute()).to.equal('connecting');
        expect(ioClient.connect.calledOnce).to.be.true;

        mockSocket.eventFire('receive-enemy-name', {displayName:'Johny'});
        timeout.flush();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('play');
        expect(location.path.lastCall.args[0]).to.equal('/play');
    });

    it('should re-route to the start screen if a disconnect fires whilst on the connect screen', function() {
        mockSocket.eventFire('disconnect');
        timeout.flush();

        expect(capturedRouteInhibitor.correctRoute()).to.equal('start');
        expect(location.path.lastCall.args[0]).to.equal('/start');
    });

    it('should provide a different img url depending on the browsers ability to handle smil animation', function() {
        Modernizr.smil = true;

        expect(cntrl.getLoadingImage()).to.equal('img/loader/ring-alt.svg');

        Modernizr.smil = false;

        expect(cntrl.getLoadingImage()).to.equal('img/loader/default.gif');
    });

});