import app from '../../browserapp';

app.controller('EnterNameCtrl', ['$scope', '$location', 'gamesession', 'routeinhibitor', function($scope, $location, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('entername', $scope);

    $scope.player = {
        name: ''
    };

    this.showButton = function() {
        if($scope.player.name){
            return 'visible';
        } else {
            return 'invisible';
        }
    };

    this.setPlayerName = function(event) {
        event.preventDefault();
        gamesession.setPlayerName($scope.player.name);
        $location.path('/' + routeinhibitor.correctRoute());
    };
}]);

