import {expect} from 'chai';
import sinon from 'sinon';
import {noSelectionItem, findWeaponById} from '../../../../src/node/rps/weapons';
import {computerPlayer, singlePlayer} from '../../../../src/public/js/app/vo/gamemode';


describe('RPS start controller', function() {
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
            capturedGameSession.reset();

            capturedRouteInhibitor = routeinhibitor;
            sinon.spy(capturedRouteInhibitor, 'restrictToCorrectRoute');

            ctrl = $controller('StartCtrl', {
                $scope: scope
            });
        });
    });

    afterEach(function(){
        location.path.restore();
        capturedRouteInhibitor.restrictToCorrectRoute.restore();
    });

    it('should invoke the route inhibitor with the correct params', function() {
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[0]).to.equal('start');
        expect(capturedRouteInhibitor.restrictToCorrectRoute.getCall(0).args[1]).to.equal(scope);
    });

    it('should initialise the game with the correct default values', function() {
        expect(capturedGameSession.getGameType()).to.be.null;
        expect(capturedGameSession.getPlayerName()).to.equal('');
        expect(capturedGameSession.getPlayerWeapon()).to.equal(noSelectionItem);
        expect(capturedGameSession.getEnemyPlayerName()).to.equal('Computer');
        expect(capturedGameSession.getEnemyPlayerWeapon()).to.equal(noSelectionItem);
        expect(capturedGameSession.isGamePlayed()).to.be.false;
        expect(capturedGameSession.isEnemyWeaponReceived()).to.be.false;
    });

    it('should provide a method that allows the game type to be set and correctly sets the route location and that all game types are provided', function() {

        expect(capturedRouteInhibitor.correctRoute()).to.equal('start');

        var event = {
            preventDefault: function(){}
        };
        sinon.spy(event, 'preventDefault');

        ctrl.setGameType(event, singlePlayer);

        expect(event.preventDefault.calledOnce).to.be.true;
        expect(capturedGameSession.getGameType()).to.equal(singlePlayer);

        expect(capturedRouteInhibitor.correctRoute()).to.equal('entername');
        expect(location.path.lastCall.args[0]).to.equal('/entername');
    });

    it('should automatically generate weapons for both players, set the names and mark the game as played when computer-player is set as the game type', function() {

        expect(capturedRouteInhibitor.correctRoute()).to.equal('start');

        var event = {
            preventDefault: function(){}
        };
        sinon.spy(event, 'preventDefault');

        ctrl.setGameType(event, computerPlayer);

        expect(event.preventDefault.calledOnce).to.be.true;
        expect(capturedGameSession.getGameType()).to.equal(computerPlayer);
        expect(capturedGameSession.getPlayerName()).to.equal('Computer');
        expect(capturedGameSession.getPlayerWeapon()).to.equal(findWeaponById(capturedGameSession.getPlayerWeapon().id));
        expect(capturedGameSession.getPlayerWeapon()).to.not.equal(noSelectionItem);
        expect(capturedGameSession.getEnemyPlayerWeapon()).to.equal(findWeaponById(capturedGameSession.getEnemyPlayerWeapon().id));
        expect(capturedGameSession.getEnemyPlayerWeapon()).to.not.equal(noSelectionItem);

        expect(capturedGameSession.isGamePlayed()).to.be.true;

        expect(capturedRouteInhibitor.correctRoute()).to.equal('result');
        expect(location.path.lastCall.args[0]).to.equal('/result');
    });
});