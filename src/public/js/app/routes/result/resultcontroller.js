import app from '../../browserapp';

app.controller('ResultCtrl', ['$scope', '$location', 'gamesession', 'routeinhibitor', function($scope, $location, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('result', $scope);

    gamesession.disconnect();

    this.playerName = gamesession.getPlayerName();
    this.playerWeapon = gamesession.getPlayerWeapon();
    this.enemyPlayerName = gamesession.getEnemyPlayerName();
    this.enemyPlayerWeapon = gamesession.getEnemyPlayerWeapon();

    function outcomeMessage() {
        var playerWeapon = gamesession.getPlayerWeapon();
        var enemyPlayerWeapon = gamesession.getEnemyPlayerWeapon();
        var gameType = gamesession.getGameType();

        if(!gameType.needsOutcomeMessage){
            return '';
        }

        if(playerWeapon.id === 'no-selection'){
            return 'You Forfeit!';
        }

        if(enemyPlayerWeapon.id === 'no-selection'){
            return 'They Forfeit!';
        }

        var matchFunction = function(value){
            return value === enemyPlayerWeapon.id;
        };

        if(playerWeapon.beats.find(matchFunction)){
            return 'You Win!';
        }

        if(playerWeapon.beatenBy.find(matchFunction)){
            return 'You Lose!';
        }

        return 'Deadlock!';
    }

    this.gameOutcomeMessage = outcomeMessage();

    this.playAgain = function() {
        gamesession.reset();
        $location.path('/' + routeinhibitor.correctRoute());
    };
}]);

