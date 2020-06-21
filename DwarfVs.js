(function(global){
    var module = global.dwarfVs = {};

    const UNIT = 1;
    const BUILDING = 2;

    var messageCallback;

    module.setMessageCallback = function(callback) {
        messageCallback = callback;
    }

    function postMessage(message) {
        messageCallback(message);
    }

    module.getNewPlayer = function(name, color) {
        return {
            name: name,
            color: color,
            buildingsChanceToKillBuilding: 0,
            buildingsChanceToKillUnit: 0,
            unitsChanceToKillBuildings: 0,
            unitsChanceToKillUnits: 0,
            buildings:[
                createHouse()
            ],
            units:[
                createDwarf()
            ]
        };
    };

    module.doRound = function(player1, player2) {
        preparePlayerForCombat(player1);
        preparePlayerForCombat(player2);
        let combatList = [];
        addToCombatList(combatList, player1.buildings, player1, player2);
        addToCombatList(combatList, player1.units, player1, player2);
        addToCombatList(combatList, player2.buildings, player2, player1);
        addToCombatList(combatList, player2.units, player2, player1);
        shuffleArray(combatList);
        doCombat(combatList);
        cull(player1);
        cull(player2)
    };

    function sortUnitsAlphabetically(a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    }

    function cull(player) {
        player.buildings = player.buildings.filter(isAlive).sort(sortUnitsAlphabetically);
        player.units = player.units.filter(isAlive).sort(sortUnitsAlphabetically);
    }

    function doCombat(combatList) {
        combatList.forEach(battler => {
            if(! battler.battler.isDead ){
                let battlerType = battler.battler.type;
                let buildingKillChance = 0;
                let unitKillChance = 0;
                if( battlerType === BUILDING) {
                    buildingKillChance = battler.player.buildingsChanceToKillBuilding + battler.battler.chanceToKillBuilding;
                    unitKillChance = battler.player.buildingsChanceToKillUnit + battler.battler.chanceToKillUnit;
                } else if ( battlerType === UNIT ) {
                    buildingKillChance = battler.player.unitsChanceToKillBuilding + battler.battler.chanceToKillBuilding;
                    unitKillChance = battler.player.unitsChanceToKillUnit + battler.battler.chanceToKillUnit;
                }
                while(buildingKillChance > 1) {
                    destroyBuilding(battler);
                    buildingKillChance -= 1;
                }
                if(Math.random() < buildingKillChance) {
                    destroyBuilding(battler);
                }
                while(unitKillChance > 1) {
                    killUnit(battler);
                    unitKillChance -= 1;
                }
                if(Math.random() < unitKillChance) {
                    killUnit(battler);
                }
            }
        });
    }

    function preparePlayerForCombat(player) {
        player.buildingsChanceToKillBuilding = 0;
        player.buildingsChanceToKillUnit = 0;
        player.unitsChanceToKillBuildings = 0;
        player.unitsChanceToKillUnits = 0;
        player.buildings.forEach(building => building.act());
        player.units.forEach(unit => unit.act());
    }

    function addToCombatList(combatList, battlers, player, enemyPlayer) {
        battlers.forEach(battler => {
            combatList.push({
                player: player,
                enemyPlayer: enemyPlayer,
                battler: battler
            });
        });
        
    }

    function isAlive(unit) {
        return ! unit.isDead;
    }

    function destroyBuilding(battler) {
        let aliveBuildings = battler.enemyPlayer.buildings.filter(isAlive);
        let buildingToKill = aliveBuildings[Math.floor(Math.random() * aliveBuildings.length)];
        buildingToKill.isDead = true;
        postMessage("<span style='color:" + battler.player.color + "'>" + battler.player.name + "</span>'s " + battler.battler.name + " destroyed <span style='color:" + battler.enemyPlayer.color + "'>"+ battler.enemyPlayer.name +"</span>'s " + buildingToKill.name);
    }

    function killUnit(battler) {
        let aliveUnits = battler.enemyPlayer.units.filter(isAlive);
        let unitToKill = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
        unitToKill.isDead = true;
        postMessage("<span style='color:" + battler.player.color + "'>" + battler.player.name + "</span>'s " + battler.battler.name + " killed <span style='color:" + battler.enemyPlayer.color + "'>"+ battler.enemyPlayer.name +"</span>'s " + unitToKill.name);
    }

    function shuffleArray(arr) {
        for(let i = arr.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i);
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    //***********************UNITS********************************************************

    function createDwarf() {
        return {
            name: "dwarf",
            type: UNIT,
            chanceToKillBuilding: 0.5,
            chanceToKillUnit: 0.5,
            act: function(player) {}
        }
    }

    //***********************BUILDINGS****************************************************

    function createHouse() {
        return {
            name: "house",
            type: BUILDING,
            chanceToKillBuilding: 0.5,
            chanceToKillUnit: 0.5,
            act: function(player) {}
        }
    }

})(this);