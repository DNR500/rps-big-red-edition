export const weapons = [
    {
        id:'rock',
        title:'Rock',
        imgUrl:'img/weapons/rock-icon.svg',
        beats: ['scissors'],
        beatenBy: ['paper']
    },
    {
        id:'paper',
        title:'Paper',
        imgUrl:'img/weapons/paper-icon.svg',
        beats: ['rock'],
        beatenBy: ['scissors']
    },
    {
        id:'scissors',
        title:'Scissors',
        imgUrl:'img/weapons/scissors-icon.svg',
        beats: ['paper'],
        beatenBy: ['rock']
    }
];

export const noSelectionItem = {
    id:'no-selection',
    title:'Void',
    imgUrl:'img/weapons/no-selection.svg'
};

export function randomSelectWeapon() {
    var randomIndex = Math.round(Math.random()*(weapons.length - 1));
    return weapons[randomIndex];
}

export function findWeaponById(weaponId) {
    var weapon = weapons.find(function(weapon){
        return weapon.id === weaponId;
    });
    return weapon ? weapon : noSelectionItem;
}
