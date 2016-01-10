import {expect} from 'chai';
import sinon from 'sinon';
import {singlePlayer, twoPlayer} from '../../../../src/public/js/app/vo/gamemode';

describe('RPS entername controller', function() {
    var scope, location, ctrl;

    var capturedGameSession;
    var capturedRouteInhibitor;

    beforeEach(function (){

        angular.mock.module('RockPaperScissors');

        inject(function($rootScope, $controller, $location, gamesession, routeinhibitor) {
            scope = $rootScope.$new();

            location = $location;
            sinon.spy($location, 'path');

            capturedGameSession = gamesession;
            capturedGameSession.setGameType(singlePlayer);

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');

            ctrl = $controller('EnterNameCtrl', {
                $scope: scope
            });
        });
    });

    afterEach(function(){
        location.path.restore();
        capturedRouteInhibitor.restrictToCorrectRoute.restore();
        scope.player.name = '';
    });

    it('should invoke the route inhibitor with the correct params', function() {
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[0]).to.equal('entername');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[1]).to.equal(scope);
    });

    it('should provide a method that sets the players name and allows a redirect to play route if single-player mode is set', function() {

        expect(capturedRouteInhibitor.correctRoute()).to.equal('entername');

        scope.player = {
            name: 'SomePlayerName'
        };

        var event = {
            preventDefault: function(){}
        };
        sinon.spy(event, 'preventDefault');

        ctrl.setPlayerName(event);

        expect(event.preventDefault.calledOnce).to.be.true;
        expect(capturedGameSession.getPlayerName()).to.equal('SomePlayerName');

        expect(capturedRouteInhibitor.correctRoute()).to.equal('play');
        expect(location.path.getCall(0).args[0]).to.equal('/play');
    });

    it('should redirect to connecting route if two-player mode is set', function() {
        capturedGameSession.setGameType(twoPlayer);

        expect(capturedRouteInhibitor.correctRoute()).to.equal('entername');

        scope.player = {
            name: 'SomePlayerName'
        };

        var event = {
            preventDefault: function(){}
        };

        ctrl.setPlayerName(event);

        expect(capturedRouteInhibitor.correctRoute()).to.equal('connecting');
        expect(location.path.lastCall.args[0]).to.equal('/connecting');
    });

    it('should update the return value of the showButton method in response to a name being entered', function() {
        scope.player = {
            name: 'SomePlayerName'
        };

        expect(ctrl.showButton()).to.equal('visible');

        scope.player.name = '';

        expect(ctrl.showButton()).to.equal('invisible');
    });
});