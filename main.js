
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

carWidth = 30;
carHeight = 50;
carY = window.innerHeight*0.67

score = 0
generation = localStorage.getItem("Generation") ? localStorage.getItem("Generation") : 0;


const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width/2, carCanvas.width * 0.9)

const cars = generateCars(100)//new Car(road.getLaneCenter(1), 100, carWidth, carHeight, "AI")
let bestCar = cars[0]
if(localStorage.getItem("bestBrain")){
    for(let i = 0; i < cars.length; i++){
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if(i !== 0){
            NeuralNetwork.mutate(cars[i].brain, 0.25)
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -50, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(0), -300, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(2), -400, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(1), -600, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(0), -600, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(2), -900, carWidth, carHeight, "DUMMY", 1),
    new Car(road.getLaneCenter(4), -1300, carWidth, carHeight, "DUMMY", 1)
]
animate();






function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    localStorage.setItem("Generation",
        generation);
    console.log("Saved Brain")
}

function discard() {
    localStorage.removeItem("bestBrain",
        JSON.stringify(bestCar.brain));
    console.log("Discarded Brain")
}

function reload() {
    location.reload()
}

function saveForNextTime() {
    new File(JSON.stringify(bestCar.brain), "bestBrain.txt")
}

function generateCars(N){
    const cars=[];
    for(let i=0; i < N;i++){
        cars.push(new Car(road.getLaneCenter(1),carY,30,50,"AI"));
    }
    return cars;
}

function update(time){
    for(let i = 0; i < traffic.length; i++){
        traffic[i].updateTraffic(bestCar)
    }

    for(let i = 0; i < cars.length; i++){
        cars[i].updateMainCar(road.borders, traffic, time);
    }

    score = parseInt(-bestCar.y/500)
}

function draw(){
    carCtx.save()
    carCtx.translate(0, 0-bestCar.y+carCanvas.height*0.67)

    road.draw(carCtx)
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, "green")
    }

    carCtx.globalAlpha = 0.2
        for(let i = 0; i < cars.length; i++){
        cars[i].draw(carCtx, "blue")
    }
    carCtx.globalAlpha = 1
    bestCar.draw(carCtx, "blue", true)

    carCtx.restore()
}

function animate(time){
    carsLeft = cars.filter(car=>car.damaged===false)
    console.log(generation)
    document.getElementById("Score").innerHTML = score
    document.getElementById("Generation").innerHTML = generation
    document.getElementById("numCars").innerHTML = carsLeft.length
    update(time/1000)

    bestCar = cars.find(
        c=>c.y===Math.min(
            ...cars.map(c=>c.y)
        )
    )

    carCanvas.height = window.innerHeight
    networkCanvas.height = window.innerHeight

    draw()

    networkCtx.lineDashOffset = -time/100
    Visualizer.drawNetwork(networkCtx, bestCar.brain)

    if(carsLeft === 0 || !carsLeft.includes(bestCar)){
        if(carsLeft ===0){
            console.log("All Died")
        }
        bestCar.damaged = true
        setTimeout(
            function(i){
                if(i === 0){
                    generation++
                    save()
                }
                location.reload()
            }, 200
        )
    }
    requestAnimationFrame(animate)
}