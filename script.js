let table;
let snakes = [];
let numRows;

// Camera orbit variables
let cameraDistance = 800;
let rotationX = Math.PI / 6;
let rotationY = Math.PI / 3;
let lastMouseX, lastMouseY;
let dragging = false;
let currentCSV = 'data/whoop_good_sleep.csv';

window.addEventListener('DOMContentLoaded', () => {
    console.log('made1')
    document.getElementById('good-sleep').onclick = () => {
      loadNewCSV('data/whoop_good_sleep.csv');
    };
    document.getElementById('bad-sleep').onclick = () => {
      loadNewCSV('data/whoop_bad_sleep.csv');
      console.log('made');
    };
    document.getElementById('large-sleep').onclick = () => {
      loadNewCSV('data/whoop_data.csv');
    };
    document.getElementById('one-sleep').onclick = () => {
      loadNewCSV('data/one_sleep.csv');
    };
  });

function loadNewCSV(path) {
  console.log("csv made");
  loadTable(path, 'csv', 'header', (newTable) => {
    table = newTable;
    initSnakes();
  });
}


function initSnakes() {
    snakes = [];
    numRows = table.getRowCount();
    for (let i = 0; i < numRows; i++) {
      let row = table.getRow(i);
      snakes.push(new SleepSnake(row, i));
    }
  }

function preload() {
    table = loadTable(currentCSV, 'csv', 'header');
    console.log(table);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(60);
  numRows = table.getRowCount();

  for (let i = 0; i < numRows; i++) {
    let row = table.getRow(i);
    snakes.push(new SleepSnake(row, i));
  }
}

function draw() {
  background(0);
  lights();
  console.log('Frame rate:', frameRate());

  // Camera orbit control
  let camX = cameraDistance * Math.cos(rotationY) * Math.cos(rotationX);
  let camY = cameraDistance * Math.sin(rotationX);
  let camZ = cameraDistance * Math.sin(rotationY) * Math.cos(rotationX);
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

  for (let s of snakes) {
    s.update();
    s.display();
  }
}

function mousePressed() {
  dragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (dragging) {
    let sensitivity = 0.01;
    rotationY += (mouseX - lastMouseX) * sensitivity;
    rotationX += (mouseY - lastMouseY) * sensitivity;
    rotationX = constrain(rotationX, -HALF_PI + 0.1, HALF_PI - 0.1);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseWheel(event) {
  cameraDistance += event.delta * 0.2;
  cameraDistance = constrain(cameraDistance, 200, 2000);
}


class SleepSnake {
    constructor(row, id) {
      this.trail = [];
      this.offsetX = random(1000);
      this.offsetY = random(1000);
      this.offsetZ = random(1000);
      this.id = id;
  
      this.rem = parseFloat(row.get('REM WH')) || 0;
      this.deep = parseFloat(row.get('Deep WH')) || 0;
      this.light = parseFloat(row.get('Light WH')) || 0;
      this.bpm = parseFloat(row.get('BPM WH')) || 0;
      this.hrv = parseFloat(row.get('HRV (ms) WH')) || 0;
      this.score = parseFloat(row.get('Score WH')) || 0;
      let totalSleep = this.rem + this.deep + this.light;
      this.speed = map(totalSleep, 4, 9, 0.0001, 0.0015);
  
      this.baseColor = this.getVibrantColor();
  
    }
  
    update() {
      let x = map(noise(this.offsetX + millis() * this.speed), 0, 1, -300, 300);
      let y = map(noise(this.offsetY + millis() * this.speed), 0, 1, -300, 300);
      let z = map(noise(this.offsetZ + millis() * this.speed), 0, 1, -300, 300);
      this.trail.push(createVector(x, y, z));
  
      if (this.trail.length > 50) {
        this.trail.shift();
      }
    }
  
    display() {
      noFill();
      beginShape();
      for (let i = 0; i < this.trail.length; i++) {
        let p = this.trail[i];
        let lerpAmt = map(i, 0, this.trail.length, 1, 0);
        let c = lerpColor(this.baseColor, color(255), lerpAmt);
        c.setAlpha(255 * 0.6);  // change transparency
        stroke(c);
        strokeWeight(map(i, 0, this.trail.length, 2, 8)); // change weight (last #)
        vertex(p.x, p.y, p.z);
      }
      endShape();
    }
  
    getVibrantColor() {
      colorMode(HSB, 360, 100, 100);
      let hueVal = map(this.rem, 0, 3, 180, 300);
      let saturation = map(this.hrv, 30, 80, 90, 100);
      let brightness = map(this.light, 2, 6, 85, 100);
      let c = color(hueVal, saturation, brightness);
      colorMode(RGB, 255);
      return c;
    }
  }
  