// Fix Pausing of Venus & Moon at fast speeds (TIME_SCALE=20)

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = document.body.clientWidth - 4;
canvas.height = 730;

let SCALE_REDUCTION = 500
let TIME_SCALE = 10 // 1 Sec (RealTime) = TIME_SCALE Days (Simulation Time)


// Diameter (miles)
// Distance from Sun as of 12:21 11/2/2023 (million miles)
// Orbit Speed (mph)
var planets = {
	sun: {
		diameter: 865_370,
	},
	mercury: {
		diameter: 3_031.9,
		distanceFromSun: 43.169,
		orbitPeriod: 88
	},
	venus: {
		diameter: 7_520.8,
		distanceFromSun: 66.897,
		orbitPeriod: 225
	},
	earth: {
		diameter: 7_917.5,
		distanceFromSun: 92.24,
		orbitPeriod: 365
	},
	mars: {
		diameter: 4_212.3,
		distanceFromSun: 145.6,
		orbitPeriod: 687
	},
	jupiter: {
		diameter: 86_881,
		distanceFromSun: 462.3,
		orbitPeriod: 4_333
	},
	saturn: {
		diameter: 74_898,
		distanceFromSun: 886,
		orbitPeriod: 10_756
	},
	uranus: {
		diameter: 31_518,
		distanceFromSun: 1_823.3,
		orbitPeriod: 30_687
	},
	neptune: {
		diameter: 34_503,
		distanceFromSun: 2_779.2,
		orbitPeriod: 60_190
	},

	moon: {
		diameter: 2_159.1,
		distanceFromSun: 23.8_900/2.5, // 238,900 mi (Its sun is the Earth)
		orbitPeriod: 27
	}
}

function rad2deg(radians) {
	return radians * (180/Math.PI);
}


function deg2rad(degrees) {
	return degrees / (180/Math.PI);
}



class Sun {
	constructor(x, y, diameter) {
		this.x = x;
		this.y = y;
		this.diameter = diameter;
	}

	draw() {
		c.fillStyle = "yellow"
		c.beginPath();
		c.arc(this.x, this.y, this.diameter/2, 0, 2 * Math.PI);
		c.fill();
	}
}



class Planet {
	constructor(name, sun, planetInfo, color, showPath=true) {
		this.name = name
		this.planetInfo = planetInfo

		this.sun = sun
		this.color = color
		this.showPath = showPath

		this.diameter = planetInfo.diameter / SCALE_REDUCTION
		this.distanceFromSun = (planetInfo.distanceFromSun * 1_000) / SCALE_REDUCTION
		this.orbitPeriod = planetInfo.orbitPeriod

		this.stageInOrbit = this.distanceFromSun // Difference Between 'this.sun.x' and Planet's X Position (xRelativeToSun)
		this.shouldIncrease = false // Whether 'this.stageInOrbit' increases every frame or descreases
		this.hemisphere = 1 // whether the planet orbits in the upper half (-1) or lower half (1) of its circle of orbit

		// Only For The Purpose of When a Planet Acts as a Sun (Moon -> Planet)
		this.x = this.stageInOrbit;
		this.y = this.getY(this.stageInOrbit)
	}

	// Should Run Whenever the SCALE_REDUCTION is changed by the '+' and '-' buttons
	updateScale() {
		this.diameter = this.planetInfo.diameter / SCALE_REDUCTION 
		this.distanceFromSun = (this.planetInfo.distanceFromSun  * 1_000) / SCALE_REDUCTION

		this.x = this.sun.x + this.stageInOrbit;
		this.y = this.sun.y + this.getY(this.stageInOrbit) * this.hemisphere;
	}

	// 'xRelativeToSun' Shouldn't Be Greater Than 'this.distanceFromSun'
	getY(xRelativeToSun) {
		let yRelativeToSun = Math.sqrt(Math.pow(this.distanceFromSun, 2) - Math.pow(xRelativeToSun, 2));
		return yRelativeToSun;
	}


	reset() {
		this.stageInOrbit = this.distanceFromSun
		this.shouldIncrease = false
		this.hemisphere = 1
	}


	draw(xRelativeToSun=this.distanceFromSun, hemisphere=1) {

		if (this.showPath) {
			c.beginPath()
			c.strokeStyle = "white"
			c.lineWidth = 0.75
			c.arc(this.sun.x, this.sun.y, this.distanceFromSun, 0, Math.PI*2)
			c.stroke()
		}

		c.fillStyle = this.color
		c.beginPath();

		//c.arc(this.sun.x + this.distanceFromSun, this.sun.y, this.diameter/2, 0, 2 * Math.PI);
		c.arc(this.sun.x + xRelativeToSun, this.sun.y + (this.getY(xRelativeToSun) * hemisphere), this.diameter/2, 0, 2 * Math.PI);

		c.fill();
		this.updateScale()
	}


	animate() {

		if (this.stageInOrbit >= this.distanceFromSun) {
			this.draw(this.distanceFromSun);
			this.shouldIncrease = false;
			this.hemisphere *= -1;
			this.stageInOrbit = this.distanceFromSun;
		}

		else if (this.stageInOrbit <= -this.distanceFromSun) {
			this.draw(-this.distanceFromSun);
			this.shouldIncrease = true;
			this.hemisphere *= -1;
			this.stageInOrbit = -this.distanceFromSun;
		}

		else {
			this.draw(this.stageInOrbit, this.hemisphere)
		}


		let changeInX = 1

		let prevAngle = rad2deg(Math.acos(this.stageInOrbit / this.distanceFromSun)) // Angle based on stage in orbit
		let orbitSpeed =  (6 / this.orbitPeriod) * TIME_SCALE

		let prevStageInOrbit = this.distanceFromSun * Math.cos(deg2rad(prevAngle)) // Current stageInOrbit based on angle
		let nextStageInOrbit = this.distanceFromSun * Math.cos(deg2rad(prevAngle-orbitSpeed)) // Next stageInOrbit based on angle - 1

		changeInX = Math.abs(prevStageInOrbit - nextStageInOrbit)


		let prevCoords = [this.stageInOrbit, this.getY(this.stageInOrbit)]
		let nextCoords = [this.stageInOrbit + changeInX, this.getY(this.stageInOrbit + changeInX)]

		let distance = Math.sqrt(Math.pow(Math.abs(prevCoords[0] - nextCoords[0]), 2) + Math.pow(Math.abs(prevCoords[1] - nextCoords[1]), 2)); // Distance between planet now and in next frame
		

		
		console.log("Name: ", this.name)
		console.log("Stage: ", this.stageInOrbit)
		console.log("Angle: ", prevAngle)
		console.log("Change In X: ", changeInX)
		console.log("Distance: ", distance)
		console.log("")
		


		if (this.shouldIncrease) {
			
			this.stageInOrbit += changeInX	
		}
		else {
			this.stageInOrbit -= changeInX
		}
	}
}


let sun = new Sun(canvas.width/2, canvas.height/2, (planets.sun.diameter / 100) / SCALE_REDUCTION)

let mercury = new Planet("Mercury", sun, planets.mercury, "orange")
let venus = new Planet("Venus", sun, planets.venus, "yellow")
let earth = new Planet("Earth", sun, planets.earth, "green")
let mars = new Planet("Mars", sun, planets.mars, "red")

let jupiter = new Planet("Jupiter", sun, planets.jupiter, "brown")
let saturn = new Planet("Saturn", sun, planets.saturn, "tan")
let uranus = new Planet("Uranus", sun, planets.uranus, "lightblue")
let neptune = new Planet("Neptune", sun, planets.neptune, "blue")

let moon = new Planet("Moon", earth, planets.moon, "lightgray")

const allPlanets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, moon]

let frame = 0


const zoomPlusButton = document.querySelector(".container1 .zoom .plus");
const zoomMinusButton = document.querySelector(".container1 .zoom .minus");

const speedPlusButton = document.querySelector(".container1 .speed .plus");
const speedMinusButton = document.querySelector(".container1 .speed .minus");

const dayLabel = document.querySelector(".day-label");
const speedLabel = document.querySelector(".speed-label");

zoomPlusButton.addEventListener("click", () => {
	console.log("plus");
	SCALE_REDUCTION -= 200;

	for (planet of allPlanets) {
		planet.reset();
		frame = 0;
	}
});

zoomMinusButton.addEventListener("click", () => {
	console.log("minus");
	SCALE_REDUCTION += 200;

	for (planet of allPlanets) {
		planet.reset();
		frame = 0;
	}
});

speedPlusButton.addEventListener("click", () => {
	TIME_SCALE += 5

	for (planet of allPlanets) {
		planet.reset();
		frame = 0;
	}
});

speedMinusButton.addEventListener("click", () => {
	if (TIME_SCALE > 0) {
		TIME_SCALE -= 5
	}
	

	for (planet of allPlanets) {
		planet.reset();
		frame = 0;
	}
});



function animation() {
	requestAnimationFrame(animation);
	c.clearRect(0, 0, canvas.width, canvas.height);
	frame++;

	// Assuming 60 FPS
	let days = Math.floor(frame/60 * TIME_SCALE);
	dayLabel.innerText = "Earth Day " + days.toString();

	speedLabel.innerText = TIME_SCALE.toString() + " Days per second";

	sun.draw()

	mercury.animate()
	venus.animate()
	earth.animate()
	mars.animate()

	jupiter.animate()
	saturn.animate()
	uranus.animate()
	neptune.animate()

	moon.animate();
}

animation()

