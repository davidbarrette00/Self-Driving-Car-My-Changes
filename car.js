class Car {

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    angle = 0
    speed = 0;
    acceleration = 0.2;
    rotationSpeed = 0.03
    maxSpeed = 10;
    friction = 0.05;
    controls = new Controls()

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // this.speed = 0;
        // this.acceleration = 0.2
        // this.maxSpeed = 3;
        // this.friction = 0.05

        // this.controls = new Controls()
    }

    update(){
        this.#move()
    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        else if(this.controls.reverse){
            this.speed -= this.acceleration;
        }

        this.speed = Math.min(Math.max(this.speed, -1 * this.maxSpeed), this.maxSpeed) //clamp it
        if(this.speed > 0){
            this.speed -= this.friction
        }
        else if(this.speed < 0){
            this.speed += this.friction
        }

        //fix corner condition where the car bounces between forward and back due to friction changing
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0
        }


        if(this.speed !== 0) {
            const flip = this.speed>0?1:-1;
            if (this.controls.left) {
                this.angle += this.rotationSpeed*flip
            } else if (this.controls.right) {
                this.angle -= this.rotationSpeed*flip
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx){
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(-this.angle)

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        )
        ctx.fill();

        ctx.restore()
    }

}