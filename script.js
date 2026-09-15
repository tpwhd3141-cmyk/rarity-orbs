const illions = ["thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion", "sexdecillion", "septendecillion", "octodecillion", "novemdecillion", "vigintillion"]
const illionsShort = ["K", "M", "B", "T", "Qa", "Qt", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"]
const rarities = [1, 3, 10, 50, 250, 1200, 7000, 30000, 140000, 750000, 3.5e6, 1.8e7, 9e7, 5e8, 5e10, 5e11, 5e12];
const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Exotic', 'Ethereal', 'Galactic', 'Transcendental', 'Godly', 'Demonic', 'Void', 'Antimatter', 'UNDEFINED 1', 'UNDEFINED 2', 'UNDEFINED 3'];
const raritySizes = [7, 8, 9, 10, 11, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14]
const rarityValues = [1, 3, 10, 30, 100, 300, 1000, 3000, 10000, 100000, 1e6, 1e7, 1e8, 1e9, 1e11, 1e12, 1e13]
const rarityColours = ['#bbbbbb', '#bbbbbb', '#45bb45', '#45bb45', '#4545bb', '#4545bb', '#8845bb', '#8845bb', '#ff8800', '#ff8800', '#ff0000', '#ff0000', '#ff7b00', '#bb24bb', '#4800ff', '#000000', '#8200ff', '#000042', '#82ff49', '#14c98d', '#ffffff', '#ffe500', '#ff0000', '#5c0000', '#333333', '#111111', '#c307eb', '#11053a']

window.isDevVersion = window.location.href.indexOf('demonin.com') == -1
if (!isDevVersion) setAutoSave()

function reset() {
    game = {
        money: 0,
        moneyMultiplier: 1,
        highestRarity: 0,
        raritiesDisplayed: 0,
        diamonds: 0,
        diamondChance: 0.005,
        spawnIntervals: [1000, 2000, 4000],
        baseLuck: 1,
        spawnerLuck: [1, 1.5, 2],
        numberFormat: "standard",
        upgradeCosts: [50, 100, 500, 250, 1500, 100000, 2000, 8000, 600000],
        spawnersUnlocked: 1,
        boostTimes: [0,0,0],
        boostsUnlocked: false,
        rebirthUnlocked: false,
        rebirths: 0,
    }
}

reset()

//If the user confirms the hard reset, resets all variables, saves and refreshes the page
function hardReset() {
    if (confirm("你确定要重置吗?你会失去一切的!")) {
        reset()
        save()
        location.reload()
    }
}
  
function save() {
    //console.log("saving")
    game.lastSave = Date.now();
    localStorage.setItem("rarityOrbsSave", JSON.stringify(game));
}
  
function setAutoSave() {
    setInterval(save, 5000);
    autosaveStarted = true;
}
//setInterval(save, 5000)
  
function load() {
        reset()
        let loadgame = JSON.parse(localStorage.getItem("rarityOrbsSave"))
        if (loadgame != null) {loadGame(loadgame)}
}
  
load()
  
function exportGame() {
    save()
    navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
        alert("已复制到剪贴板!")
    }, function() {
        alert("复制到剪贴板错误，请重试...")
    });
}
  
function importGame() {
    loadgame = JSON.parse(atob(prompt("Input your save here:")))
    if (loadgame && loadgame != null && loadgame != "") {
        reset()
        loadGame(loadgame)
        save()
        location.reload()
    }
    else {
        alert("无效的输入.")
    }
}
  
function loadGame(loadgame) {
    //Sets each variable in 'game' to the equivalent variable in 'loadgame' (the saved file)
    let loadKeys = Object.keys(loadgame);
    for (i=0; i<loadKeys.length; i++) {
        if (loadgame[loadKeys[i]] != "undefined") {
            let thisKey = loadKeys[i];
            if (Array.isArray(loadgame[thisKey])) {
                game[loadKeys[i]] = loadgame[thisKey].map((x) => {return x})
            }
            //else {game[Object.keys(game)[i]] = loadgame[loadKeys[i]]}
            else {game[loadKeys[i]] = loadgame[loadKeys[i]]}
        }
    }

    //Update upgrade text
    updateAllUpgradeText()

    //Spawner 2
    if (game.spawnersUnlocked >= 2) {
        document.getElementsByClassName("spawnerTab")[1].style.display = "block";
        document.getElementsByClassName("spawnerTabBuyButton")[0].style.display = "none";
        setTimeout(spawn2, game.spawnIntervals[1])
    }
    //Spawne 3
    if (game.spawnersUnlocked == 3) {
        document.getElementsByClassName("spawnerTab")[2].style.display = "block";
        document.getElementsByClassName("spawnerTabBuyButton")[1].style.display = "none";
        setTimeout(spawn3, game.spawnIntervals[2])
    }

    //Boosts
    if (game.boostTimes[0] == 0) {
        document.getElementsByClassName("boostText")[0].style.color = "#bbb"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - 0:00 (not active)"
    }
    else {
        document.getElementsByClassName("boostText")[0].style.color = "#8f8"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - " + Math.floor(game.boostTimes[0]/60) + ":" + (game.boostTimes[0]%60).toString().padStart(2, "0")
    }
    if (game.boostTimes[1] == 0) {
        document.getElementsByClassName("boostText")[1].style.color = "#bbb"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - 0:00 (not active)"
    }
    else {
        document.getElementsByClassName("boostText")[1].style.color = "#8f8"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - " + Math.floor(game.boostTimes[1]/60) + ":" + (game.boostTimes[1]%60).toString().padStart(2, "0")
    }
    document.getElementsByClassName("boostText")[2].innerText = "Duplicate cooldown: " + game.boostTimes[2] + "s"
    if (game.boostsUnlocked) {
        document.getElementById("boosts").style.display = "inline-block";
        document.getElementById("unlockBoostsButton").style.display = "none";
        document.getElementById("unlockRebirthButton").style.display = "inline-block";
    }
    if (game.rebirthUnlocked) {
        document.getElementById("rebirth").style.display = "inline-block";
        document.getElementById("unlockRebirthButton").style.display = "none";
    }

    //Rarity list
    game.raritiesDisplayed = 0
    updateRarityList()
}

function spawn1() {
    if (currentOrbs < 100) createOrb(1)
    setTimeout(spawn1, game.spawnIntervals[0])
}
setTimeout(spawn1, game.spawnIntervals[0])

function spawn2() {
    if (currentOrbs < 100) createOrb(2)
    setTimeout(spawn2, game.spawnIntervals[1])
}

function spawn3() {
    if (currentOrbs < 100) createOrb(3)
    setTimeout(spawn3, game.spawnIntervals[2])
}

function format(x,precision=0,forceLargeFormat=false) {
	if (x==Infinity) {return "Infinity"}
	else if (game.numberFormat == "standard" && (forceLargeFormat || x>=1e9)) {
		let exponent = Math.floor(Math.log10(x) / 3)
		return (x/(1000**exponent)).toFixed(2) + illionsShort[exponent-1]
	}
	else if (game.numberFormat == "standardLong" && (forceLargeFormat || x>=1e9)) {
		let exponent = Math.floor(Math.log10(x) / 3)
		return (x/(1000**exponent)).toFixed(2) + " " + illions[exponent-1]
	}
	else if (game.numberFormat == "scientific" && (forceLargeFormat || x>=1e9)) {
		let exponent = Math.floor(Math.log10(x))
		return (Math.floor(x/(10**exponent)*100)/100).toFixed(2) + "e" + exponent
	}
    else if (x >= 1000) {
		return Math.floor(x).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
	}
	else {
		let highestPrecision = 2-Math.floor(Math.log10(x))
		return x.toFixed(Math.min(precision, highestPrecision))
	}
}

function getRarity(spawner) {
    let totalLuck = game.baseLuck * game.spawnerLuck[spawner-1] * (game.boostTimes[1] ? 2 : 1);
    //Find the highest rarity smaller than totalLuck*100000
    let highestRarity = 0;
    while (rarities[highestRarity] < totalLuck*100000) {
        highestRarity++;
    }
    var rarity = Math.random();
    for (var i = highestRarity; i>0; i--) {
        if (rarity < 1/rarities[i]*totalLuck) {
            return i + 1;
        }
    }
    return 1
}

function updateText() {
    document.getElementById('money').innerText = "Money: $" + format(game.money);
    document.getElementById("multiplier").innerText = "Money multiplier: x" + format(game.moneyMultiplier,2);
    document.getElementById("luck").innerText = "Luck: x" + format(game.baseLuck * (game.boostTimes[1] ? 2 : 1),2);
    document.getElementById('diamonds').innerText = "Diamonds: " + format(game.diamonds);
    document.getElementById('diamondChance').innerText = "Diamond chance: " + format(game.diamondChance*100, 2) + "%";
    document.getElementsByClassName("spawnerInterval")[0].innerText = "Spawn interval: " + (game.spawnIntervals[0]/1000).toFixed(3) + "s";
    document.getElementsByClassName("spawnerInterval")[1].innerText = "Spawn interval: " + (game.spawnIntervals[1]/1000).toFixed(3) + "s";
    document.getElementsByClassName("spawnerInterval")[2].innerText = "Spawn interval: " + (game.spawnIntervals[2]/1000).toFixed(3) + "s";
    document.getElementsByClassName("spawnerLuck")[0].innerText = "Luck: x" + format(game.spawnerLuck[0],2);
    document.getElementsByClassName("spawnerLuck")[1].innerText = "Luck: x" + format(game.spawnerLuck[1],2);
    document.getElementsByClassName("spawnerLuck")[2].innerText = "Luck: x" + format(game.spawnerLuck[2],2);
    document.getElementById('rebirthText').innerText = "You have rebirthed " + format(game.rebirths) + " times\nCurrent base luck: x" + format(game.baseLuck,2)
}
updateText()
setInterval(updateText, 200);

function updateBoosts() {
    if (game.boostTimes[0] > 0) game.boostTimes[0]--
    if (game.boostTimes[1] > 0) game.boostTimes[1]--
    if (game.boostTimes[2] > 0) game.boostTimes[2]--
    if (game.boostTimes[0] == 0) {
        document.getElementsByClassName("boostText")[0].style.color = "#bbb"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - 0:00 (not active)"
    }
    else {
        document.getElementsByClassName("boostText")[0].style.color = "#8f8"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - " + Math.floor(game.boostTimes[0]/60) + ":" + (game.boostTimes[0]%60).toString().padStart(2, "0")
    }
    if (game.boostTimes[1] == 0) {
        document.getElementsByClassName("boostText")[1].style.color = "#bbb"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - 0:00 (not active)"
        updateRarityList()
    }
    else {
        document.getElementsByClassName("boostText")[1].style.color = "#8f8"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - " + Math.floor(game.boostTimes[1]/60) + ":" + (game.boostTimes[1]%60).toString().padStart(2, "0")
    }
    document.getElementsByClassName("boostText")[2].innerText = "Duplicate cooldown: " + game.boostTimes[2] + "s"
}
updateBoosts()
setInterval(updateBoosts, 1000);

function updateAllUpgradeText() {
    document.getElementById("increaseMultiplierButton").innerHTML = "Increase money multiplier<br>x" + format(game.moneyMultiplier,2) + " - x" + format(game.moneyMultiplier*1.15,2) + "<br>Costs $" + format(game.upgradeCosts[0])
    document.getElementById("increaseLuckButton").innerHTML = "Increase base luck<br>x" + format(game.baseLuck,2) + " - x" + format(game.baseLuck*1.2,2) + "<br>Costs $" + format(game.upgradeCosts[1])
    document.getElementById("increaseDiamondChanceButton").innerHTML = "Increase diamond chance<br>" + format(game.diamondChance*100, 2) + "% - " + format((game.diamondChance+0.001)*100, 2) + "%<br>Costs $" + format(game.upgradeCosts[2])
    for (let i=1; i<=3; i++) {
        document.getElementsByClassName("decreaseIntervalButton")[i-1].innerHTML = "Decrease interval<br>" + (game.spawnIntervals[i-1]/1000).toFixed(3) + "s - " + (game.spawnIntervals[i-1]/1000*0.95).toFixed(3)  + "s<br>Costs $" + format(game.upgradeCosts[2+i])
        document.getElementsByClassName("increaseSpawnerLuckButton")[i-1].innerHTML = "Increase luck<br>x" + format(game.spawnerLuck[i-1],2) + " - x" + format(game.spawnerLuck[i-1]*1.1,2) + "<br>Costs $" + format(game.upgradeCosts[5+i])
    }
    document.getElementById('rebirthButton').innerHTML = "<b>Rebirth</b><br>Costs " + format(rebirthCost()) + " diamonds<br>Luck x" + format(game.baseLuck,2) + " - x" + format(game.baseLuck*2,2)
}

function updateVisuals() {
    if (game.money >= game.upgradeCosts[0]) {
        document.getElementById("increaseMultiplierButton").style.backgroundImage = "linear-gradient(#9e9, #7c7)";
        document.getElementById("increaseMultiplierButton").style.border = "2px solid #060";
    } else {
        document.getElementById("increaseMultiplierButton").style.backgroundImage = "linear-gradient(#fff, #bbb)";
        document.getElementById("increaseMultiplierButton").style.border = "2px solid #888";
    }
    if (game.money >= game.upgradeCosts[1]) {
        document.getElementById("increaseLuckButton").style.backgroundImage = "linear-gradient(#9e9, #7c7)";
        document.getElementById("increaseLuckButton").style.border = "2px solid #060";
    } else {
        document.getElementById("increaseLuckButton").style.backgroundImage = "linear-gradient(#fff, #bbb)";
        document.getElementById("increaseLuckButton").style.border = "2px solid #888";
    }
    if (game.money >= game.upgradeCosts[2]) {
        document.getElementById("increaseDiamondChanceButton").style.backgroundImage = "linear-gradient(#9e9, #7c7)";
        document.getElementById("increaseDiamondChanceButton").style.border = "2px solid #060";
    } else {
        document.getElementById("increaseDiamondChanceButton").style.backgroundImage = "linear-gradient(#fff, #bbb)";
        document.getElementById("increaseDiamondChanceButton").style.border = "2px solid #888";
    }
    for (let i=1; i<=3; i++) {
        if (game.money >= game.upgradeCosts[2+i]) {
            document.getElementsByClassName("decreaseIntervalButton")[i-1].style.backgroundImage = "linear-gradient(#9e9, #7c7)";
            document.getElementsByClassName("decreaseIntervalButton")[i-1].style.border = "2px solid #060";
        } else {
            document.getElementsByClassName("decreaseIntervalButton")[i-1].style.backgroundImage = "linear-gradient(#fff, #bbb)";
            document.getElementsByClassName("decreaseIntervalButton")[i-1].style.border = "2px solid #888";
        }
        if (game.money >= game.upgradeCosts[5+i]) {
            document.getElementsByClassName("increaseSpawnerLuckButton")[i-1].style.backgroundImage = "linear-gradient(#9e9, #7c7)";
            document.getElementsByClassName("increaseSpawnerLuckButton")[i-1].style.border = "2px solid #060";
        } else {
            document.getElementsByClassName("increaseSpawnerLuckButton")[i-1].style.backgroundImage = "linear-gradient(#fff, #bbb)";
            document.getElementsByClassName("increaseSpawnerLuckButton")[i-1].style.border = "2px solid #888";
        }
    }
}
updateVisuals()

function increaseMultiplier() {
    if (game.money >= game.upgradeCosts[0]) {
        game.money -= game.upgradeCosts[0];
        game.moneyMultiplier *= 1.15;
        game.upgradeCosts[0] = Math.floor(game.upgradeCosts[0]*1.7);
        updateText()
        updateVisuals()
        document.getElementById("increaseMultiplierButton").innerHTML = "Increase money multiplier<br>x" + format(game.moneyMultiplier,2) + " - x" + format(game.moneyMultiplier*1.15,2) + "<br>Costs $" + format(game.upgradeCosts[0])
    }
}

function increaseLuck() {
    if (game.money >= game.upgradeCosts[1]) {
        game.money -= game.upgradeCosts[1];
        game.baseLuck *= 1.2;
        game.upgradeCosts[1] *= 2;
        updateRarityList()
        updateText()
        updateVisuals()
        document.getElementById("increaseLuckButton").innerHTML = "Increase base luck<br>x" + format(game.baseLuck,2) + " - x" + format(game.baseLuck*1.2,2) + "<br>Costs $" + format(game.upgradeCosts[1])
    }
}

function increaseDiamondChance() {
    if (game.money >= game.upgradeCosts[2]) {
        game.money -= game.upgradeCosts[2];
        game.diamondChance += 0.001
        game.upgradeCosts[2] *= 5;
        updateText()
        updateVisuals()
        document.getElementById("increaseDiamondChanceButton").innerHTML = "Increase diamond chance<br>" + format(game.diamondChance*100, 2) + "% - " + format((game.diamondChance+0.001)*100, 2) + "%<br>Costs $" + format(game.upgradeCosts[2])
    }
}

function decreaseInterval(x) {
    if (game.money >= game.upgradeCosts[2+x]) {
        game.money -= game.upgradeCosts[2+x];
        game.spawnIntervals[x-1] *= 0.95;
        game.upgradeCosts[2+x] = Math.floor(game.upgradeCosts[2+x]*2.5);
        updateText()
        updateVisuals()
        document.getElementsByClassName("decreaseIntervalButton")[x-1].innerHTML = "Decrease interval<br>" + (game.spawnIntervals[x-1]/1000).toFixed(3) + "s - " + (game.spawnIntervals[x-1]/1000*0.95).toFixed(3)  + "s<br>Costs $" + format(game.upgradeCosts[2+x])
    }
}

function increaseSpawnerLuck(x) {
    if (game.money >= game.upgradeCosts[5+x]) {
        game.money -= game.upgradeCosts[5+x];
        game.spawnerLuck[x-1] *= 1.1;
        game.upgradeCosts[5+x] = Math.floor(game.upgradeCosts[5+x]*4);
        updateRarityList()
        updateText()
        updateVisuals()
        document.getElementsByClassName("increaseSpawnerLuckButton")[x-1].innerHTML = "Increase luck<br>x" + format(game.spawnerLuck[x-1],2) + " - x" + format(game.spawnerLuck[x-1]*1.1,2) + "<br>Costs $" + format(game.upgradeCosts[5+x])
    }
}

function buySpawner2() {
    if (game.money >= 1000 && game.spawnersUnlocked == 1) {
        game.money -= 1000;
        game.spawnersUnlocked = 2;
        updateText()
        updateVisuals()
        document.getElementsByClassName("spawnerTab")[1].style.display = "block";
        document.getElementsByClassName("spawnerTabBuyButton")[0].style.display = "none";
        setTimeout(spawn2, game.spawnIntervals[1])
    }
}

function buySpawner3() {
    if (game.money >= 20000 && game.spawnersUnlocked == 2) {
        game.money -= 20000;
        game.spawnersUnlocked = 3;
        updateText()
        updateVisuals()
        document.getElementsByClassName("spawnerTab")[2].style.display = "block";
        document.getElementsByClassName("spawnerTabBuyButton")[1].style.display = "none";
        setTimeout(spawn3, game.spawnIntervals[2])
    }
}

function unlockBoosts() {
    if (game.diamonds >= 20 && !game.boostsUnlocked) {
        game.diamonds -= 20
        game.boostsUnlocked = true
        updateText()
        document.getElementById("boosts").style.display = "inline-block";
        document.getElementById("unlockBoostsButton").style.display = "none";
        document.getElementById("unlockRebirthButton").style.display = "inline-block";
    }
}

function buyBoost(x) {
    if (x==1 && game.diamonds >= 100) {
        game.diamonds -= 100
        game.boostTimes[0] += 60
        document.getElementsByClassName("boostText")[0].style.color = "#8f8"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - " + Math.floor(game.boostTimes[0]/60) + ":" + (game.boostTimes[0]%60).toString().padStart(2, "0")
        updateText()
    }
    else if (x==2 && game.diamonds >= 400) {
        game.diamonds -= 400
        game.boostTimes[0] += 300
        document.getElementsByClassName("boostText")[0].style.color = "#8f8"
        document.getElementsByClassName("boostText")[0].innerText = "2x money gain - " + Math.floor(game.boostTimes[0]/60) + ":" + (game.boostTimes[0]%60).toString().padStart(2, "0")
        updateText()
    }
    else if (x==3 && game.diamonds >= 150) {
        game.diamonds -= 150
        game.boostTimes[1] += 60
        document.getElementsByClassName("boostText")[1].style.color = "#8f8"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - " + Math.floor(game.boostTimes[1]/60) + ":" + (game.boostTimes[1]%60).toString().padStart(2, "0")
        updateText()
        updateRarityList()
    }
    else if (x==4 && game.diamonds >= 600) {
        game.diamonds -= 600
        game.boostTimes[1] += 300
        document.getElementsByClassName("boostText")[1].style.color = "#8f8"
        document.getElementsByClassName("boostText")[1].innerText = "2x luck - " + Math.floor(game.boostTimes[1]/60) + ":" + (game.boostTimes[1]%60).toString().padStart(2, "0")
        updateText()
        updateRarityList()
    }
    else if (x==5 && game.diamonds >= 500 && game.boostTimes[2] == 0) {
        game.diamonds -= 500
        game.boostTimes[2] = 20
        duplicateOrbs()
        document.getElementsByClassName("boostText")[2].innerText = "Duplicate cooldown: " + game.boostTimes[2] + "s"
        updateText()
    }
}

function updateRarityList() {
    //Update pre-existing rarity slot text
    for (let i=0; i<game.raritiesDisplayed; i++) {
        document.getElementsByClassName("raritySlotText")[i].innerHTML = rarityNames[i] + "<br><span style='font-size: 20px'>$" + format(rarityValues[i]) + " • 1 in " + format(Math.max(rarities[i] / game.baseLuck / (game.boostTimes[1] ? 2 : 1), 1), 1) + "</span>";
    }
    while (game.raritiesDisplayed < game.highestRarity || game.raritiesDisplayed < 4) {
        //Create a div with the class 'raritySlot'
        let newSlot = document.createElement("div");
        newSlot.className = "raritySlot";
        newSlot.style.backgroundImage = "linear-gradient(" + rarityColours[game.raritiesDisplayed*2] + ", " + rarityColours[game.raritiesDisplayed*2+1] + ")";
        newSlot.innerHTML = "<img src='img/ball" + (game.raritiesDisplayed+1) + ".png' class='raritySlotImage'><p class='raritySlotText'>" + rarityNames[game.raritiesDisplayed] + "<br><span style='font-size: 20px'>$" + format(rarityValues[game.raritiesDisplayed]) + " • 1 in " + format(Math.max(rarities[game.raritiesDisplayed]/game.baseLuck, 1), 1) + "</span></p>";
        document.getElementById("raritiesList").appendChild(newSlot);
        game.raritiesDisplayed++
    }
    //Update the next rarity text
    for (let i=0; i<3; i++) {
        document.getElementsByClassName("nextRarityText")[i].innerHTML = "To be discovered...<br><span style='font-size: 20px'>$" + format(rarityValues[game.raritiesDisplayed+i]) + " • 1 in " + format(Math.max(rarities[game.raritiesDisplayed+i] / game.baseLuck / (game.boostTimes[1] ? 2 : 1), 1), 1) + "</span>";

    }
}
updateRarityList()

function unlockRebirth() {
    if (game.diamonds >= 50 && !game.rebirthUnlocked) {
        game.diamonds -= 50
        game.rebirthUnlocked = true
        updateText()
        document.getElementById("rebirth").style.display = "inline-block";
        document.getElementById("unlockRebirthButton").style.display = "none";
    }
}

function rebirthCost() {
    return 50 * (1.1 ** game.rebirths);
}

function rebirth() {
    if (game.diamonds >= rebirthCost()) {
        game.diamonds -= rebirthCost();
        game.rebirths++
        game.baseLuck *= 2
        // money, moneyMultiplier, diamondChance, spawnIntervals, spawnerLuck and upgradeCosts
        // are intentionally left untouched so upgrades persist through rebirth.
        updateRarityList()
        deleteAllOrbs()
        updateText()
        updateAllUpgradeText()
        updateVisuals()
        updateRarityList()
    }
}