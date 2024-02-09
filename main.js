
const canvas = document.getElementById("myCanvas");
canvas.width = 200;
carWidth = 30;
carHeight = 50

const ctx = canvas.getContext("2d")
const road = new Road(canvas.width/2, canvas.width * 0.9)
const car = new Car(road.getLaneCenter(1), 100, carWidth, carHeight, "KEYS")
const traffic = [
    new Car(road.getLaneCenter(1), -100, carWidth, carHeight, "DUMMY", 2)
]
animate();


function animate(){
    for(let i = 0; i < traffic.length; i++){
        traffic[i].update(road.borders, [])
    }
    car.update(road.borders, traffic);

    canvas.height = window.innerHeight

    ctx.save()
    ctx.translate(0, 0-car.y+canvas.height*0.67)

    road.draw(ctx)
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(ctx, "green")
    }
    car.draw(ctx, "blue")

    ctx.restore()
    requestAnimationFrame(animate)
}