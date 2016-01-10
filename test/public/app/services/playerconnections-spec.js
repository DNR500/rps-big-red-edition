import {expect} from 'chai';
import sinon from 'sinon';
import ioClient from 'socket.io-client';

describe('RPS player connections', function() {

    var mockSocket;

    var rootscope;
    var capturedPlayerConnections;

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

        inject(function(_$rootScope_, playerconnections) {
            rootscope = _$rootScope_;
            capturedPlayerConnections = playerconnections;
        });
    });

    afterEach(function(){
        ioClient.connect.restore();
    });

    it('should emit a disconnect event via the rootscope when the socket disconnects', function(done) {
        capturedPlayerConnections.connect('betty', function(){}, function(){});

        rootscope.$on('rps-disconnected', function(){
            expect(mockSocket.connected).to.be.false;

            expect(mockSocket.removedListeners['connect']).to.be.true;
            expect(mockSocket.removedListeners['receive-enemy-name']).to.be.true;
            expect(mockSocket.removedListeners['receive-enemy-weapon']).to.be.true;
            expect(mockSocket.removedListeners['disconnect']).to.be.true;

            done();
        });

        mockSocket.eventFire('disconnect');
    });
});