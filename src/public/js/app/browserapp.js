import * as angular from 'angular';
import 'angular-route';

var app = angular.module('RockPaperScissors', ['ngRoute']);

app.init = function () {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['RockPaperScissors']);
    });
};

export default app;