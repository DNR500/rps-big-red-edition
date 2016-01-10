import ioClient from 'socket.io-client';
import config from '../../src/config';
import {expect} from 'chai';

describe('RPS socket server', function() {
    var server = require('../../src/node/httpapp');

    var socket_1;
    var socket_2;
    var socket_3;

    beforeEach(function() {
        server.start(3000);
    });

    afterEach(function() {
        if(socket_1){
            socket_1.disconnect();
            socket_1 = null;
        }
        if(socket_2){
            socket_2.disconnect();
            socket_2 = null;
        }
        if(socket_3){
            socket_3.disconnect();
            socket_3 = null;
        }
        server.stop();
        config.timeoutDuration = 20000;
    });

    describe('initial connection', function() {
        it('should recognise client connections with the connect event', function(done) {
            var count = 0;
            function checkAll3Connected() {
                count++;
                if(count>=3){
                    done();
                }
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_3 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_1.once('connect', checkAll3Connected);
            socket_2.once('connect', checkAll3Connected);
            socket_3.once('connect', checkAll3Connected);
        });
        it('should disconnect any socket that does not send a name', function(done) {
            var connected = false;

            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_1.once('connect', function(){
                connected = true;
            });
            socket_1.once('disconnect', function(){
                if(connected){
                    done();
                }
            });

        });
        it('should allow names to be sent between paired connections using the receive-enemy-name event', function(done) {
            var count = 0;

            function checkNames() {
                count++;
                if(count >= 2){
                    expect(socket_2.enemyName).to.equal('firstSocket');
                    expect(socket_1.enemyName).to.equal('secondSocket');
                    done();
                }
            }

            function createSocket2() {
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('receive-enemy-name', function(data) {
                    socket_2.enemyName = data.displayName;
                    checkNames();
                });
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', function() {
                createSocket2();
            });
            socket_1.once('receive-enemy-name', function(data) {
                socket_1.enemyName = data.displayName;
                checkNames();
            });
        });
        it('should allow weapons to be sent between paired connections using the weapon-choice event', function(done) {
            var count = 0;

            function emitWeapons() {
                socket_1.emit('weapon-selected', {weaponChoice:'scissors'});
                socket_2.emit('weapon-selected', {weaponChoice:'rock'});
            }

            function checkChoices() {
                count++;
                if(count >= 2){
                    expect(socket_2.enemyWeapon).to.equal('scissors');
                    expect(socket_1.enemyWeapon).to.equal('rock');
                    done();
                }
            }

            function createSocket2() {
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', function() {
                    emitWeapons();
                });
                socket_2.once('receive-enemy-weapon', function(data) {
                    socket_2.enemyWeapon = data.weaponChoice;
                    checkChoices();
                });
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', function() {
                createSocket2();
            });
            socket_1.once('receive-enemy-weapon', function(data) {
                socket_1.enemyWeapon = data.weaponChoice;
                checkChoices();
            });
        });
        it('should not allow unrecognised weapons to be sent', function(done) {
            var count = 0;

            function checkChoices() {
                count++;
                expect(socket_2.enemyWeapon).to.be.undefined;
                expect(socket_1.enemyWeapon).to.equal('rock');
                done();
            }

            function emitWeapons() {
                socket_1.emit('weapon-selected', {weaponChoice:'asdf'});
                socket_2.emit('weapon-selected', {weaponChoice:'rock'});
                setTimeout(checkChoices, 1000);
            }

            function createSocket2() {
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', function() {
                    emitWeapons();
                });
                socket_2.once('receive-enemy-weapon', function(data) {
                    socket_2.enemyWeapon = data.weaponChoice;
                });
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', function() {
                createSocket2();
            });
            socket_1.once('receive-enemy-weapon', function(data) {
                socket_1.enemyWeapon = data.weaponChoice;
            });
        });
        it('should allow disconnection to be relayed between paired connections', function(done) {
            var count = 0;

            function callDisconnect() {
                socket_1.disconnect();
            }
            function checkDisconnect() {
                count++;
                if(count >= 2){
                    done();
                }
            }

            function createSocket2() {
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', function() {
                    callDisconnect();
                });
                socket_2.once('disconnect', function() {
                    checkDisconnect();
                });
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', function() {
                createSocket2();
            });
            socket_1.once('disconnect', function() {
                checkDisconnect();
            });
        });

        it('should signal disconnect due to timeout if connection is not paired within specified timeout', function(done) {
            server.stop();

            config.timeoutDuration = 1000;
            server.start(3000);

            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('disconnect', function() {
                done();
            });
        });

        it('should signal disconnect due to timeout if pairs do not disconnect after timeout duration', function(done) {
            server.stop();

            config.timeoutDuration = 1000;
            server.start(3000);

            var count = 0;

            function checkDisconnect() {
                count++;
                if(count >= 2){
                    done();
                }
            }

            function createSocket2() {
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('disconnect', function() {
                    checkDisconnect();
                });
            }
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', function() {
                createSocket2();
            });
            socket_1.once('disconnect', function() {
                checkDisconnect();
            });
        });
    });
});