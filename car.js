class Car {

    constructor(x, y, width, height, controlType, maxSpeed=3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.angle = 0
        this.speed = 0;
        this.acceleration = 0.1;
        this.rotationSpeed = 0.003
        this.maxSpeed = 10;
        this.friction = 0.05;
        this.damaged = false

        this.maxSpeed = maxSpeed

        this.useBrain = controlType==="AI"

        if(controlType !== "DUMMY") {
            this.sensor = new Sensor(this)
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4] //input, ...hidden, output
            )
        }
        this.controls = new Controls(controlType)
    }

    updateMainCar(roadBorders, traffic, time) {
        if (!this.damaged) {
            this.#move()
            this.polygon = this.#createPolygon()
            this.damaged = this.#assessDamage(roadBorders, traffic, time)
        }
        if(this.sensor) {
            this.sensor.update(roadBorders, traffic)
            const offsets = this.sensor.readings.map(
                r=>r==null?0:1-r.offset
            )
            const outputs = NeuralNetwork.feedForward(offsets, this.brain)

            if(this.useBrain){
                this.controls.forward = outputs[0]
                this.controls.left = outputs[1]
                this.controls.right = outputs[2]
                this.controls.reverse = outputs[3]
            }
        }

        if(this.damaged){

        }
    }

    updateTraffic(bestCar) {
        this.#move()
        this.polygon = this.#createPolygon()
        if(this.y > bestCar.y+window.innerHeight/2){
            this.x = road.getLaneCenter(Math.floor(Math.random()*10)%road.laneCount)
            this.y = bestCar.y - window.innerHeight - (Math.random()*500)
        }

    }

    #createPolygon(){
        const points = []
        const radius = //from center of polygon to corner, changing length to no break the perimeter
            Math.hypot(this.width, this.height)/2
        const angle = Math.atan2(this.width, this.height)

        points.push({
            x: this.x-Math.sin(this.angle-angle)*radius,
            y: this.y-Math.cos(this.angle-angle)*radius,
        })
        points.push({
            x: this.x-Math.sin(this.angle+angle)*radius,
            y: this.y-Math.cos(this.angle+angle)*radius,
        })
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle-angle)*radius,
            y: this.y-Math.cos(Math.PI+this.angle-angle)*radius,
        })
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle+angle)*radius,
            y: this.y-Math.cos(Math.PI+this.angle+angle)*radius,
        })

        return points
    }

    #assessDamage(roadboarder, traffic, time){
        // if(time > 5 && this.speed < (2*this.maxSpeed)/3){
        //     return true
        // }
        for(let i = 0; i < roadboarder.length; i++){
            if(polysIntersect(this.polygon, roadboarder[i])){
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
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

    draw(ctx, color, drawSensors=false){
        ctx.fillStyle=(this.damaged)?"red":color
        ctx.beginPath()
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill()

        if(this.sensor && drawSensors) {
            this.sensor.draw(ctx)
        }
    }

}