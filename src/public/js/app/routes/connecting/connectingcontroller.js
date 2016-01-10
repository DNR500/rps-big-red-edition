import app from '../../browserapp';
import {loadingImage} from '../../utils/imagefallback';

app.controller('ConnectingCtrl', ['$scope', '$location', '$timeout', 'gamesession', 'routeinhibitor', function($scope, $location, $timeout, gamesession, routeinhibitor){

    routeinhibitor.restrictToCorrectRoute('connecting', $scope);

    this.getLoadingImage = loadingImage;

    function moveToNextScreen(){
        $timeout(function(){
            $location.path('/' + routeinhibitor.correctRoute());
        });
    }

    $scope.$on('rps-enemy-name-received', function () {
        moveToNextScreen();
    });

    $scope.$on('rps-disconnected', function () {
        gamesession.reset();
        moveToNextScreen();
    });

    gamesession.connect();

}]);

