import {expect} from 'chai';
import {weapons, noSelectionItem, randomSelectWeapon, findWeaponById} from '../../../../src/node/rps/weapons';

describe('RPS weapons', function() {

    it('should provide access to the full range of supported weapons with required info', function() {
        expect(weapons.length).to.equal(3);

        var rockWeapon = weapons.find(function(weapon){
            return weapon.id === 'rock';
        });
        expect(rockWeapon).to.not.be.undefined;

        expect(rockWeapon.title).to.equal('Rock');
        expect(rockWeapon.imgUrl).to.equal('img/weapons/rock-icon.svg');
        expect(rockWeapon.beatenBy.length).to.equal(1);
        expect(rockWeapon.beatenBy[0]).to.equal('paper');
        expect(rockWeapon.beats.length).to.equal(1);
        expect(rockWeapon.beats[0]).to.equal('scissors');

        var paperWeapon = weapons.find(function(weapon){
            return weapon.id === 'paper';
        });
        expect(paperWeapon).to.not.be.undefined;

        expect(paperWeapon.title).to.equal('Paper');
        expect(paperWeapon.imgUrl).to.equal('img/weapons/paper-icon.svg');
        expect(paperWeapon.beatenBy.length).to.equal(1);
        expect(paperWeapon.beatenBy[0]).to.equal('scissors');
        expect(paperWeapon.beats.length).to.equal(1);
        expect(paperWeapon.beats[0]).to.equal('rock');

        var scissorsWeapon = weapons.find(function(weapon){
            return weapon.id === 'scissors';
        });
        expect(scissorsWeapon).to.not.be.undefined;

        expect(scissorsWeapon.title).to.equal('Scissors');
        expect(scissorsWeapon.imgUrl).to.equal('img/weapons/scissors-icon.svg');
        expect(scissorsWeapon.beatenBy.length).to.equal(1);
        expect(scissorsWeapon.beatenBy[0]).to.equal('rock');
        expect(scissorsWeapon.beats.length).to.equal(1);
        expect(scissorsWeapon.beats[0]).to.equal('paper');
    });

    it('should provide a basic no-selection object', function() {
        expect(noSelectionItem.id).to.equal('no-selection');
        expect(noSelectionItem.title).to.equal('Void');
        expect(noSelectionItem.imgUrl).to.equal('img/weapons/no-selection.svg');
    });

    it('should provide a method with which to find a weapon by id from the weapons array', function(){
        var rockWeapon = findWeaponById('rock');

        var rockWeaponFromArray = weapons.find(function(weapon){
            return weapon.id === 'rock';
        });

        expect(rockWeapon).to.equal(rockWeaponFromArray);
    });

    it('should provide a no-selection object if there is no match found by the findWeaponById method', function(){
        var noMatchingWeapon = findWeaponById('spoon');

        expect(noMatchingWeapon).to.equal(noSelectionItem);
    });

    it('should provide a random weapon selection method that provides access to all the available weapons in the weapons array', function(){
        var weaponsDictionary = {};

        for(var i = 0; i < 2000; i++){
            var randomWeapon = randomSelectWeapon();
            weaponsDictionary[randomWeapon.id] = true;
        }

        expect(weaponsDictionary.rock).to.be.true;
        expect(weaponsDictionary.paper).to.be.true;
        expect(weaponsDictionary.scissors).to.be.true;
    });

});