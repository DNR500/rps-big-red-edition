import app from '../../browserapp';
import {loadingImage} from '../../utils/imagefallback';

app.controller('WaitingCtrl', ['$scope', '$location', '$timeout', 'gamesession', 'routeinhibitor', function($scope, $location, $timeout, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('waiting', $scope);

    this.getLoadingImage = loadingImage;

    function moveToNextScreen(){
        $timeout(function(){
            $location.path('/' + routeinhibitor.correctRoute());
        });
    }

    $scope.$on('rps-enemy-weapon-received', function () {
        moveToNextScreen();
    });

    $scope.$on('rps-disconnected', function () {
        moveToNextScreen();
    });

    if(gamesession.isEnemyWeaponReceived() || !gamesession.isConnected()){
        moveToNextScreen();
    }

}]);

