import app from '../../browserapp';

app.controller('PlayCtrl', ['$scope', '$location', '$timeout', 'gamesession', 'routeinhibitor', function($scope, $location, $timeout, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('play', $scope);

    $scope.counter = 5;

    var onTimeout = function(){
        if($scope.counter - 1 > 0) {
            $scope.counter--;
            mytimeout = $timeout(onTimeout,1000);
        } else {
            $timeout.cancel(mytimeout);
            this.endGame();
        }
    }.bind(this);
    var mytimeout = $timeout(onTimeout,1000);

    this.weapons = gamesession.getWeapons();

    this.establishSelectedWeapon = function(weapon){
        return gamesession.getPlayerWeapon() === weapon ? 'selected-weapon': '';
    };
    this.selectWeapon = function(event, weapon){
        event.preventDefault();
        gamesession.setPlayerWeapon(weapon);
    };
    this.endGame = function() {
        gamesession.markGamePlayed();
        $location.path('/' + routeinhibitor.correctRoute());
    };
}]);

