import app from '../browserapp';

app.factory('routeinhibitor',['$location', 'gamesession', function($location, gamesession){

    function establishCorrectRoute() {
        if(gamesession.getGameType()){
            return gamesession.getGameType().routes(gamesession);
        }
        return 'start';
    }

    function restrictToCorrectRoute(route, $scope) {
        var correctGameRoute = establishCorrectRoute();
        if(correctGameRoute != route) {
            $location.path('/' + correctGameRoute);
            return;
        }

        $scope.$on('$locationChangeStart', function(event) {
            if(establishCorrectRoute() === route){
                event.preventDefault();
            }
        });
    }

    return {
        correctRoute: establishCorrectRoute,
        restrictToCorrectRoute: restrictToCorrectRoute
    };

}]);