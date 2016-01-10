import app from '../../browserapp';
import { gameModes } from '../../vo/gamemode';

app.controller('StartCtrl', ['$scope', '$location', 'gamesession', 'routeinhibitor', function($scope, $location, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('start', $scope);

    this.gameModes = gameModes;

    this.setGameType = function(event, gameType) {
        event.preventDefault();
        gamesession.setGameType(gameType);
        $location.path('/' + routeinhibitor.correctRoute());
    };
}]);

