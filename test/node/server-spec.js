import ioClient from 'socket.io-client';
import config from '../../src/config';
import {expect} from 'chai';

describe('RPS socket server', ()=>{
    var server = require('../../src/node/httpapp');

    var socket_1;
    var socket_2;
    var socket_3;

    beforeEach(()=>server.start(3000));

    afterEach(()=>{
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

    describe('initial connection', ()=>{
        it('should recognise client connections with the connect event', done=>{
            var count = 0;
            var checkAll3Connected = ()=>{
                count++;
                if(count>=3){
                    done();
                }
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_3 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_1.once('connect', checkAll3Connected);
            socket_2.once('connect', checkAll3Connected);
            socket_3.once('connect', checkAll3Connected);
        });
        it('should disconnect any socket that does not send a name', done => {
            var connected = false;

            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true });
            socket_1.once('connect', ()=> connected = true );
            socket_1.once('disconnect', ()=>{
                if(connected){
                    done();
                }
            });

        });
        it('should allow names to be sent between paired connections using the receive-enemy-name event', done=>{
            var count = 0;

            var checkNames = ()=>{
                count++;
                if(count >= 2){
                    expect(socket_2.enemyName).to.equal('firstSocket');
                    expect(socket_1.enemyName).to.equal('secondSocket');
                    done();
                }
            };

            var  createSocket2 = ()=>{
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('receive-enemy-name', data=>{
                    socket_2.enemyName = data.displayName;
                    checkNames();
                });
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', createSocket2);
            socket_1.once('receive-enemy-name', data=>{
                socket_1.enemyName = data.displayName;
                checkNames();
            });
        });
        it('should allow weapons to be sent between paired connections using the weapon-choice event', done=>{
            var count = 0;

            var emitWeapons = ()=>{
                socket_1.emit('weapon-selected', {weaponChoice:'scissors'});
                socket_2.emit('weapon-selected', {weaponChoice:'rock'});
            };

            var checkChoices = ()=>{
                count++;
                if(count >= 2){
                    expect(socket_2.enemyWeapon).to.equal('scissors');
                    expect(socket_1.enemyWeapon).to.equal('rock');
                    done();
                }
            };

            var createSocket2 = ()=>{
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', emitWeapons);
                socket_2.once('receive-enemy-weapon', data=>{
                    socket_2.enemyWeapon = data.weaponChoice;
                    checkChoices();
                });
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', createSocket2);
            socket_1.once('receive-enemy-weapon', data=>{
                socket_1.enemyWeapon = data.weaponChoice;
                checkChoices();
            });
        });
        it('should not allow unrecognised weapons to be sent', done=>{
            var count = 0;

            var checkChoices = ()=>{
                count++;
                expect(socket_2.enemyWeapon).to.be.undefined;
                expect(socket_1.enemyWeapon).to.equal('rock');
                done();
            };

            var emitWeapons = ()=>{
                socket_1.emit('weapon-selected', {weaponChoice:'asdf'});
                socket_2.emit('weapon-selected', {weaponChoice:'rock'});
                setTimeout(checkChoices, 1000);
            };

            var createSocket2 = ()=>{
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', emitWeapons);
                socket_2.once('receive-enemy-weapon', data=>{
                    socket_2.enemyWeapon = data.weaponChoice;
                });
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', createSocket2);
            socket_1.once('receive-enemy-weapon', data=>{
                socket_1.enemyWeapon = data.weaponChoice;
            });
        });
        it('should allow disconnection to be relayed between paired connections', done=>{
            var count = 0;

            var callDisconnect = ()=>{
                socket_1.disconnect();
            };
            var checkDisconnect = ()=>{
                count++;
                if(count >= 2){
                    done();
                }
            };

            var createSocket2 = ()=>{
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('connect', callDisconnect);
                socket_2.once('disconnect', checkDisconnect);
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', createSocket2);
            socket_1.once('disconnect', checkDisconnect);
        });

        it('should signal disconnect due to timeout if connection is not paired within specified timeout', done=>{
            server.stop();

            config.timeoutDuration = 1000;
            server.start(3000);

            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('disconnect', ()=>{
                done();
            });
        });

        it('should signal disconnect due to timeout if pairs do not disconnect after timeout duration', done=>{
            server.stop();

            config.timeoutDuration = 1000;
            server.start(3000);

            var count = 0;

            var checkDisconnect = ()=>{
                count++;
                if(count >= 2){
                    done();
                }
            };

            var createSocket2 = ()=>{
                socket_2 = ioClient.connect('http://localhost:3000', {'forceNew': true, query:'displayname=secondSocket' });
                socket_2.once('disconnect', checkDisconnect);
            };
            socket_1 = ioClient.connect('http://localhost:3000', {'forceNew': true , query:'displayname=firstSocket'});
            socket_1.once('connect', createSocket2);
            socket_1.once('disconnect', checkDisconnect);
        });
    });
});