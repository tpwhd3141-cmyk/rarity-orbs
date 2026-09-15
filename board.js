// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();
world = engine.world;

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 400,
        height: 800,
        wireframes: false,
        background: 'linear-gradient(#111144, #331144)',
    }
});

// create two boxes and a ground
var ground = Bodies.rectangle(200, 810, 410, 60, { isStatic: true });
var ceiling = Bodies.rectangle(200, -10, 410, 60, { isStatic: true });
var wall1 = Bodies.rectangle(410, 400, 60, 800, { isStatic: true });
var wall2 = Bodies.rectangle(-10, 400, 60, 800, { isStatic: true });
var pegs = Composites.stack(10, 220, 5, 7, 66, 80, function(x, y) {
    return Bodies.circle(x, y, 12, { isStatic: true });
});
var pegs2 = Composites.stack(54, 167, 4, 7, 66, 80, function(x, y) {
    return Bodies.circle(x, y, 12, { isStatic: true });
});
var pegs3 = Composites.stack(54, 805, 4, 1, 66, 80, function(x, y) {
    return Bodies.circle(x, y, 12, { isStatic: true });
});

// add all of the bodies to the world
Composite.add(engine.world, [ceiling, wall1, wall2, pegs, pegs2, pegs3]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create({ fps: 60 });

// run the engine
Runner.run(runner, engine);

function createBox() {
    var box = Bodies.rectangle(200, 200, 80, 80);
    Composite.add(engine.world, [box]);
}

let currentOrbs = 0
function createOrb(spawner) {
    if (Math.random() < game.diamondChance) {createDiamond(); return}
    let chosenRarity = getRarity(spawner);
    if (game.highestRarity < chosenRarity) {
        game.highestRarity = chosenRarity;
        updateRarityList();
    }
    var circle = Bodies.circle(Math.random() * 300 + 50, 30, raritySizes[chosenRarity - 1], { category: 'ball', rarity: chosenRarity, restitution: 0.9, render: {
        //strokeStyle: 'white',
        //fillStyle: rarityColours[chosenRarity - 1],
        sprite: {
            texture: "img/ball" + chosenRarity + ".png",
            xScale: 0.025 * raritySizes[chosenRarity - 1],
            yScale: 0.025 * raritySizes[chosenRarity - 1],
        }
    }});
    Composite.add(engine.world, [circle]);
    currentOrbs = countOrbs()
}

function countOrbs() {
    var bodies = Composite.allBodies(engine.world);
    var count = 0;
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i].category === 'ball') {
            count++;
        }
    }
    return count;
}

function createDiamond() {
    var circle = Bodies.circle(Math.random() * 300 + 50, 30, 15, { category: 'diamond', restitution: 0.6, render: {
        //strokeStyle: 'white',
        //fillStyle: rarityColours[chosenRarity - 1],
        sprite: {
            texture: "img/diamond.png",
            xScale: 0.052,
            yScale: 0.052,
        }
    }});
    Composite.add(engine.world, [circle]);
}

function checkCollisions() {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i].category === 'ball' && bodies[i].position.y > 800) {
            //console.log(bodies[i].rarity)
            let slotMultiplier = 1;
            if (bodies[i].position.x < 66) {slotMultiplier = 2;}
            else if (bodies[i].position.x > 155 && bodies[i].position.x < 244) {slotMultiplier = 10000;}
            else if (bodies[i].position.x > 333) {slotMultiplier = 2;}
            game.money += rarityValues[bodies[i].rarity - 1] * game.moneyMultiplier * slotMultiplier * (game.boostTimes[0] ? 2 : 1);
            updateText()
            updateVisuals()
            Composite.remove(engine.world, bodies[i]);
            currentOrbs = countOrbs()
        }
        else if (bodies[i].category === 'diamond' && bodies[i].position.y > 800) {
            //console.log(bodies[i].rarity)
            let slotMultiplier = 1;
            if (bodies[i].position.x < 66) {slotMultiplier = 2;}
            else if (bodies[i].position.x > 155 && bodies[i].position.x < 244) {slotMultiplier = 10000;}
            else if (bodies[i].position.x > 333) {slotMultiplier = 2;}
            game.diamonds += 10 * slotMultiplier;
            updateText()
            updateVisuals()
            Composite.remove(engine.world, bodies[i]);
            currentOrbs = countOrbs()
        }
    }
}

setInterval(checkCollisions, 30);

function duplicateOrbs() {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i].category === 'ball') {
            //Create a new orb with the same rarity
            let chosenRarity = bodies[i].rarity;
            var circle = Bodies.circle(bodies[i].position.x, bodies[i].position.y, raritySizes[chosenRarity - 1], { category: 'ball', rarity: chosenRarity, restitution: 0.9, render: {
                sprite: {
                    texture: "img/ball" + chosenRarity + ".png",
                    xScale: 0.025 * raritySizes[chosenRarity - 1],
                    yScale: 0.025 * raritySizes[chosenRarity - 1],
                }
            }});
            Composite.add(engine.world, [circle]);
            currentOrbs = countOrbs()
        }
        else if (bodies[i].category === 'diamond') {
            var circle = Bodies.circle(bodies[i].position.x, bodies[i].position.y, 15, { category: 'diamond', restitution: 0.6, render: {
                sprite: {
                    texture: "img/diamond.png",
                    xScale: 0.052,
                    yScale: 0.052,
                }
            }});
            Composite.add(engine.world, [circle]);
            currentOrbs = countOrbs()
        }
    }
}

function deleteAllOrbs() {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i].category === 'ball' || bodies[i].category === 'diamond') {
            Composite.remove(engine.world, bodies[i]);
        }
    }
    currentOrbs = countOrbs()
}