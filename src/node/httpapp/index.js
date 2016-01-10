import express from 'express';
import path from 'path';
import {Server} from 'http';
import playersockets from '../playersockets';

var app = express(),
    http = Server(app),
    server;

app.use(express.static(path.resolve(__dirname, '../../public/')));

function start(port, callback) {
    port = port || 3000;

    playersockets(http);

    server = http.listen(port, function(){
        if(callback){
            callback();
        }
    });
}

function stop(){
    if(server){
        server.close();
    }
}

export { start as start };
export { stop as stop };
export { app as app };
export { http as http };