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
            unitsChanceToKillBuilding: 0,
            unitsChanceToKillUnit: 0,
            buildings:[
                createHouse()
            ],
            units:[
                createDwarf()
            ]
        };
    };

    module.doProject = function(player, project) {
        unit = project();
        
        if(unit.type === BUILDING) {
            postMessage("<span style='color:" + player.color + "'>" + player.name + "</span> built a " + unit.name);
            player.buildings.push(unit);
        } else if(unit.type === UNIT) {
            postMessage("<span style='color:" + player.color + "'>" + player.name + "</span> hired a " + unit.name);
            player.units.push(unit);
        }
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
                if(battler.battler.act) {
                    battler.battler.act(battler.player);
                }
                if(battler.battler.canKill) {
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
            }
        });
    }

    function preparePlayerForCombat(player) {
        player.buildingsChanceToKillBuilding = 0;
        player.buildingsChanceToKillUnit = 0;
        player.unitsChanceToKillBuilding = 0;
        player.unitsChanceToKillUnit = 0;
        player.buildings.forEach(building => {
            if(building.prepare) {
                building.prepare(player);
            }
        });
        player.units.forEach(unit => {
            if(unit.prepare) {
                unit.prepare(player);
            }
        });
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
        if(aliveBuildings.length > 0) {
            let buildingToKill = aliveBuildings[Math.floor(Math.random() * aliveBuildings.length)];
            buildingToKill.isDead = true;
            postMessage("<span style='color:" + battler.player.color + "'>" + battler.player.name + "</span>'s " + battler.battler.name + " destroyed <span style='color:" + battler.enemyPlayer.color + "'>"+ battler.enemyPlayer.name +"</span>'s " + buildingToKill.name);
        }
    }

    function killUnit(battler) {
        let aliveUnits = battler.enemyPlayer.units.filter(isAlive);
        if(aliveUnits.length > 0) {
            let unitToKill = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
            unitToKill.isDead = true;
            postMessage("<span style='color:" + battler.player.color + "'>" + battler.player.name + "</span>'s " + battler.battler.name + " killed <span style='color:" + battler.enemyPlayer.color + "'>"+ battler.enemyPlayer.name +"</span>'s " + unitToKill.name);
        }
    }

    function shuffleArray(arr) {
        for(let i = arr.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i);
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    var options = [
        //*****UNITS********
        createDwarf,
        createMurderDwarf,
        createArsonist,
        createSlutDwarf,
        createNewborn,
        createCommandwarf,
        //*****BUIDLINGS****
        createHouse,
        createCatapult,
        createCommandCenter,
        createMagicMissileSilo,
        createSeigeFactory
    ];

    module.getOptions = function() {
        shuffleArray(options)
        return options.slice(0,3);
    }

    //***********************UNITS********************************************************

    function createDwarf() {
        return {
            name: "Dwarf",
            description: "Nothing special.",
            type: UNIT,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0
        }
    }

    function createMurderDwarf() {
        return {
            name: "Murder Dwarf",
            description: "Loves killing people. 15% chance to kill a unit.",
            type: UNIT,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: .15
        }
    }

    function createArsonist() {
        return {
            name: "Arsonist",
            description: "Burns shit down. 12% chance to destroy a building.",
            type: UNIT,
            canKill: true,
            chanceToKillBuilding: 0.15,
            chanceToKillUnit: 0
        }
    }

    function createSlutDwarf() {
        return {
            name: "Slut Dwarf",
            description: "Likes to fuck. 20% chance to make a baby.",
            type: UNIT,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0,
            act: function(player) {
                if(Math.random() < .2) {
                    postMessage("<span style='color:" + player.color + "'>" + player.name + "</span>'s Slut Dwarf gave birth");
                    player.units.push(createNewborn());
                }
            }
        }
    }

    function createCommandwarf() {
        return {
            name: "Commandwarf",
            description: "All units will fight under his command...warf. Units get 2% chance to kill enemy units.",
            type: UNIT,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0,
            prepare(player) {
                player.unitsChanceToKillUnit += .02;
            }
        }
    }

    function createNewborn() {
        return {
            name: "Newborn",
            description: "It's a baby. Can't kill.",
            type: UNIT,
            canKill: false,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0,
            act: function(player) {
                this.isDead = true;
                postMessage("<span style='color:" + player.color + "'>" + player.name + "</span>'s Newborn grew up!");
                player.units.push(createDwarf());
            }
        }
    }

    //***********************BUILDINGS****************************************************

    function createHouse() {
        return {
            name: "House",
            description: "A place to live.",
            type: BUILDING,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0
        }
    }

    function createCatapult() {
        return {
            name: "Catapult",
            description: "Lobs rocks. 8% chance to kill a building, 8% chance to kill a unit",
            type: BUILDING,
            canKill: true,
            chanceToKillBuilding: .08,
            chanceToKillUnit: .08
        }
    }

    function createCommandCenter() {
        return {
            name: "Command Center",
            description: "A place where important murders are planned. Units get 2% chance to kill enemy units.",
            type: BUILDING,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0,
            prepare(player) {
                player.unitsChanceToKillUnit += .02;
            }
        }
    }

    function createMagicMissileSilo() {
        return {
            name: "Magic Missile Silo",
            description: "Launches intercontinental magic missiles at enemy hard points. 15% chance to destroy enemy buildings.",
            type: BUILDING,
            canKill: true,
            chanceToKillBuilding: 0.15,
            chanceToKillUnit: 0
        }
    }

    function createSeigeFactory() {
        return {
            name: "Seige Factory",
            description: "Puts a little catapult in each of your buildings. Buildings get a 2% chance to kill buildings and a 1% chance to kill units.",
            type: BUILDING,
            canKill: true,
            chanceToKillBuilding: 0,
            chanceToKillUnit: 0,
            prepare(player) {
                player.buildingsChanceToKillBuilding += .02;
                player.buildingsChanceToKillUnit += .01;
            }
        }
    }

})(this);