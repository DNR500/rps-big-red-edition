import app from './browserapp';

import './routes/start/startcontroller';
import './routes/start/start.html';

import './routes/entername/enternamecontroller';
import './routes/entername/entername.html';

import './routes/connecting/connectingcontroller';
import './routes/connecting/connecting.html';

import './routes/play/playcontroller';
import './routes/play/play.html';

import './routes/result/resultcontroller';
import './routes/result/result.html';

import './routes/waiting/waitingcontroller';
import './routes/waiting/waiting.html';

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/start', {
            controller: 'StartCtrl as startCtrl',
            templateUrl: 'start.html'
        })
        .when('/entername', {
            controller: 'EnterNameCtrl as enternameCtrl',
            templateUrl: 'entername.html'
        })
        .when('/connecting', {
            controller: 'ConnectingCtrl as connectCtrl',
            templateUrl: 'connecting.html'
        })
        .when('/play', {
            controller: 'PlayCtrl as playCtrl',
            templateUrl: 'play.html'
        })
        .when('/waiting', {
            controller: 'WaitingCtrl as waitingCtrl',
            templateUrl: 'waiting.html'
        })
        .when('/result', {
            controller: 'ResultCtrl as resultCtrl',
            templateUrl: 'result.html'
        })
        .otherwise('/start');
}]);


