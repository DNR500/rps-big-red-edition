import {expect} from 'chai';

describe('RPS routes configuration', function() {

    var location, route, rootScope;

    beforeEach(function (){

        angular.mock.module('RockPaperScissors');

        inject(function( _$rootScope_,  _$route_, _$location_) {
            rootScope = _$rootScope_;
            route = _$route_;
            location = _$location_;
        });
    });

    it('should be configured correctly for the start screen', function() {
        location.path('/start');
        rootScope.$digest();
        expect(route.current.controller).to.equal('StartCtrl as startCtrl');
        expect(route.current.templateUrl).to.equal('start.html');
    });

    it('should be configured correctly for the entername screen', function() {
        location.path('/entername');
        rootScope.$digest();
        expect(route.current.controller).to.equal('EnterNameCtrl as enternameCtrl');
        expect(route.current.templateUrl).to.equal('entername.html');
    });

    it('should be configured correctly for the connecting screen', function() {
        location.path('/connecting');
        rootScope.$digest();
        expect(route.current.controller).to.equal('ConnectingCtrl as connectCtrl');
        expect(route.current.templateUrl).to.equal('connecting.html');
    });

    it('should be configured correctly for the play screen', function() {
        location.path('/play');
        rootScope.$digest();
        expect(route.current.controller).to.equal('PlayCtrl as playCtrl');
        expect(route.current.templateUrl).to.equal('play.html');
    });

    it('should be configured correctly for the waiting screen', function() {
        location.path('/waiting');
        rootScope.$digest();
        expect(route.current.controller).to.equal('WaitingCtrl as waitingCtrl');
        expect(route.current.templateUrl).to.equal('waiting.html');
    });

    it('should be configured correctly for the result screen', function() {
        location.path('/result');
        rootScope.$digest();
        expect(route.current.controller).to.equal('ResultCtrl as resultCtrl');
        expect(route.current.templateUrl).to.equal('result.html');
    });

    it('should be configured for the start screen if unconfigured route is passed', function() {
        location.path('/someotherroute');
        rootScope.$digest();
        expect(route.current.controller).to.equal('StartCtrl as startCtrl');
        expect(route.current.templateUrl).to.equal('start.html');
    });

});