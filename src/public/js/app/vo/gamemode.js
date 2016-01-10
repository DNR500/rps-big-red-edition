export const gameModes = [
    {
        id: 'computer-player',
        displayName: 'Computer',
        routes: function(gamesession) {
            if(gamesession.getGameType()){
                return 'result';
            }
            return 'start';
        },
        requiresUserToPlay: false,
        needsOutcomeMessage: false,
        autoGenerateEnemyWeapon: true,
        autoGeneratePlayerWeapon: true,
        autoGeneratePlayerName: true
    },
    {
        id: 'single-player',
        displayName: '1 Player',
        routes: function(gamesession) {
            if(gamesession.isGamePlayed()){
                return 'result';
            }
            if(gamesession.getPlayerName()){
                return 'play';
            }
            if(gamesession.getGameType()) {
                return 'entername';
            }
            return 'start';
        },
        requiresUserToPlay: true,
        needsOutcomeMessage: true,
        autoGenerateEnemyWeapon: true,
        autoGeneratePlayerWeapon: false,
        autoGeneratePlayerName: false
    },
    {
        id: 'two-player',
        displayName: '2 Player',
        routes: function(gamesession) {
            var gamePlayed = gamesession.isGamePlayed();
            var gameConnected = gamesession.isConnected();
            var enemyName = gamesession.getEnemyPlayerName();

            if(gamesession.isEnemyWeaponReceived() || (gamePlayed && !gameConnected)){
                return 'result';
            }
            if(gamePlayed && gameConnected){
                return 'waiting';
            }
            if(enemyName != 'Computer'){
                return 'play';
            }
            if(gamesession.getPlayerName() && enemyName === 'Computer'){
                return 'connecting';
            }
            if(gamesession.getGameType()) {
                return 'entername';
            }
            return 'start';
        },
        requiresUserToPlay: true,
        needsOutcomeMessage: true,
        autoGenerateEnemyWeapon: false,
        autoGeneratePlayerWeapon: false,
        autoGeneratePlayerName: false
    }
];

export var computerPlayer = gameModes[0];
export var singlePlayer = gameModes[1];
export var twoPlayer = gameModes[2];