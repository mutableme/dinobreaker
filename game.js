// Game variables
let paddle, ball, bricks, particles, score, lives, level, gameState;
let pointMultiplier = 1;
let powerUp = {
  x: 0,
  y: 0,
  w: 20,
  h: 20,
  active: false,
  visible: false,
  duration: 5, // seconds
  startTime: 0
};
let dino = {
  x: 0,
  y: 0,
  w: 40,
  h: 40,
  vx: 2,
  dir: 1,
  isPaused: false,
  pauseStartTime: 0,
  rawrText: {
    x: 0,
    y: 0,
    visible: false,
    startTime: 0,
    duration: 1000
  }
};

let scoreParticles = [];
let isPaused = false;
let levelSoundPlayed = false;
let confetti = [];
let winTime;
let winStars = [];
let devModeTransitionTime = 0; // Track when to show level complete screen
let isBonusLevel = false; // Track if we're in the bonus level
let hasPlayedBonusLevel = false; // Track if bonus level has been played

// Add new variables for splash screen animations
let splashParticles = [];
let splashTime = 0;

// Add variables to store original level state
let originalLevel = 1;
let originalBricks = [];
let originalScore = 0;
let originalPointMultiplier = 1;
let originalBall = { x: 0, y: 0, r: 10, vx: 0, vy: 0 };

function setup() {
  let canvas = createCanvas(800, 650);
  canvas.parent('game-container');  // This will place the canvas inside the game-container div
  colorMode(HSB, 360, 100, 100, 100);
  preventRightClick();
  initializeGame();
}

function createSplashBricks() {
  // Remove any exploded bricks
  splashBricks = splashBricks.filter(brick => !brick.exploded);
  
  // Add new bricks until we have 3
  while (splashBricks.length < 3) {
    splashBricks.push({
      x: random(50, width - 50),
      y: random(50, height - 50),
      w: random(30, 80),
      h: random(15, 30),
      color: color(random(360), 70, 85, 50),
      explodeTime: millis() + random(5000, 10000),
      exploded: false
    });
  }
}

function createBricks() {
  bricks = [];
  
  if (isBonusLevel) {
    // Create CHARLIE in rainbow blocks with 10x points
    const letters = [
      // C
      [[1,1,1,1,1],
       [1,0,0,0,0],
       [1,0,0,0,0],
       [1,0,0,0,0],
       [1,1,1,1,1]],
      // H
      [[1,0,0,0,1],
       [1,0,0,0,1],
       [1,1,1,1,1],
       [1,0,0,0,1],
       [1,0,0,0,1]],
      // A
      [[0,1,1,1,0],
       [1,0,0,0,1],
       [1,1,1,1,1],
       [1,0,0,0,1],
       [1,0,0,0,1]],
      // R
      [[1,1,1,1,0],
       [1,0,0,0,1],
       [1,1,1,1,0],
       [1,0,0,1,0],
       [1,0,0,0,1]],
      // L
      [[1,0,0,0,0],
       [1,0,0,0,0],
       [1,0,0,0,0],
       [1,0,0,0,0],
       [1,1,1,1,1]],
      // I
      [[1,1,1,1,1],
       [0,0,1,0,0],
       [0,0,1,0,0],
       [0,0,1,0,0],
       [1,1,1,1,1]],
      // E
      [[1,1,1,1,1],
       [1,0,0,0,0],
       [1,1,1,1,0],
       [1,0,0,0,0],
       [1,1,1,1,1]]
    ];
    
    const letterWidth = 5;
    const letterHeight = 5;
    const brickSize = 20;
    const spacing = 10;
    const startX = (width - (letters.length * (letterWidth * brickSize + spacing))) / 2;
    const startY = height / 3;
    
    for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
      const letter = letters[letterIndex];
      for (let y = 0; y < letterHeight; y++) {
        for (let x = 0; x < letterWidth; x++) {
          if (letter[y][x] === 1) {
            const brickX = startX + letterIndex * (letterWidth * brickSize + spacing) + x * brickSize;
            const brickY = startY + y * brickSize;
            const hue = (letterIndex * 51) % 360; // Rainbow colors
            bricks.push({
              x: brickX,
              y: brickY,
              w: brickSize,
              h: brickSize,
              broken: false,
              points: 5000, // 10x points for bonus level
              color: color(hue, 100, 100)
            });
          }
        }
      }
    }
  } else {
    // Original brick creation logic
    // Use modulo to cycle through patterns every 5 levels
    let patternNumber = ((level - 1) % 5) + 1;
    
    // Declare shared variables outside switch
    let centerX = width / 2;
    let centerY = height / 3;
    
    switch(patternNumber) {
      case 1: // Classic rows
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 8; j++) {
            let x = 60 + j * 90;
            let y = 100 + i * 40;
            let points = 100 - i * 10;
            let col = color(i * 60, 70, 85);
            bricks.push({ x, y, w: 80, h: 30, broken: false, points, color: col });
          }
        }
        break;

      case 2: // Diamond pattern
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if (Math.abs(i - 3) + Math.abs(j - 3) <= 3) {
              let x = centerX - 270 + j * 90;
              let y = 80 + i * 40;
              let col = color((i + j) * 45, 70, 85);
              bricks.push({ x, y, w: 80, h: 30, broken: false, points: 150, color: col });
            }
          }
        }
        break;

      case 3: // Checkerboard
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 0) {
              let x = 60 + j * 90;
              let y = 100 + i * 40;
              let col = color(200, 70, 85);
              bricks.push({ x, y, w: 80, h: 30, broken: false, points: 200, color: col });
            }
          }
        }
        break;

      case 4: // Fortress
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 8; j++) {
            if (i === 0 || i === 5 || j === 0 || j === 7 || 
                (i === 2 && j > 2 && j < 6) || 
                (i === 3 && j > 2 && j < 6)) {
              let x = 60 + j * 90;
              let y = 100 + i * 40;
              let col = color(280, 70, 85);
              bricks.push({ x, y, w: 80, h: 30, broken: false, points: 175, color: col });
            }
          }
        }
        break;

      case 5: // Rectangle with X pattern
        // Adjust brick size for better fit
        let brickWidth = 70;  // Slightly smaller bricks
        let brickHeight = 30;
        let startX = 80;      // Adjusted starting position
        let startY = 100;
        let cols = 9;         // Number of columns
        let rows = 7;         // Number of rows
        
        // Create the rectangle outline and X pattern
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let x = startX + j * (brickWidth + 10);  // 10px spacing between bricks
            let y = startY + i * (brickHeight + 10); // 10px spacing between bricks
            
            // Create outline (top, bottom, left, right edges)
            let isOutline = i === 0 || i === rows-1 || j === 0 || j === cols-1;
            // Create X (using diagonal positions)
            let isX = (i === j) || (i === rows-1-j);
            
            if (isOutline || isX) {
              let hue;
              if (isOutline) {
                hue = 200; // Blue for outline
              } else {
                hue = 300; // Purple for X
              }
              
              bricks.push({
                x: x,
                y: y,
                w: brickWidth,
                h: brickHeight,
                broken: false,
                points: isX ? 150 : 100, // More points for X bricks
                color: color(hue, 70, 85)
              });
            }
          }
        }
        break;
    }
  }
}

function resetBall() {
  let speed = 8 + (level - 1) * 0.3;  // Increased base speed from 5 to 8, reduced level increase from 0.5 to 0.3
  let angle = random(-PI / 4, PI / 4);
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r;
  ball.vx = speed * sin(angle);
  ball.vy = -speed * cos(angle);
}

function initializeGame() {
  score = 0;
  lives = 3;
  level = 1;
  pointMultiplier = 1;
  paddle = { x: width / 2 - 50, y: height - 20, w: 100, h: 10 };
  ball = { x: 0, y: 0, r: 10, vx: 0, vy: 0 };
  bricks = [];
  isBonusLevel = false;
  hasPlayedBonusLevel = false; // Reset bonus level availability
  createBricks();
  particles = [];
  gameState = "start";
  dino.x = 0;
  dino.y = height - 50;
  dino.dir = 1;
  powerUp.active = false;
  powerUp.visible = false;
}

function drawDino() {
  // Updated colors
  let dinoColor = color(120, 70, 85);  // Green base color
  let spikeColor = color(120, 70, 65); // Darker green for spikes
  
  // Dino body
  fill(dinoColor);
  rect(dino.x, dino.y, dino.w, dino.h);
  
  // Spikes on back - will adjust based on direction
  fill(spikeColor);
  let numSpikes = 3;
  let spikeSpacing = dino.w / (numSpikes + 1);
  let spikeHeight = 10;
  let spikeWidth = 8;
  
  for(let i = 1; i <= numSpikes; i++) {
    let spikeX = dino.x + (spikeSpacing * i);
    triangle(
      spikeX - spikeWidth/2, dino.y,           // Left point
      spikeX + spikeWidth/2, dino.y,           // Right point
      spikeX, dino.y - spikeHeight             // Top point
    );
  }
  
  // Dino head - position changes based on direction
  if (dino.dir > 0) {
    // Facing right
    fill(dinoColor);
    rect(dino.x + dino.w - 8, dino.y - 8, 16, 16);
    // Eye on the right side
    fill(0, 0, 0);
    ellipse(dino.x + dino.w + 2, dino.y - 2, 4, 4);
  } else {
    // Facing left
    fill(dinoColor);
    rect(dino.x - 8, dino.y - 8, 16, 16);
    // Eye on the left side
    fill(0, 0, 0);
    ellipse(dino.x - 2, dino.y - 2, 4, 4);
  }
  
  // Dino legs with improved animation
  fill(dinoColor);
  
  // Calculate vertical and horizontal offsets
  let verticalOffset = sin(frameCount * 0.2) * 6;
  let horizontalOffset = cos(frameCount * 0.2) * 3;
  
  if (dino.dir > 0) {
    // Facing right
    // Right leg - starts from body bottom
    push();
    translate(dino.x + dino.w - 10, dino.y + dino.h);
    rotate(verticalOffset * 0.05);
    rect(horizontalOffset, 0, 6, 15 + verticalOffset);
    pop();
    
    // Left leg - opposite phase
    push();
    translate(dino.x + 4, dino.y + dino.h);
    rotate(-verticalOffset * 0.05);
    rect(-horizontalOffset, 0, 6, 15 - verticalOffset);
    pop();
  } else {
    // Facing left
    // Left leg
    push();
    translate(dino.x + 4, dino.y + dino.h);
    rotate(verticalOffset * 0.05);
    rect(-horizontalOffset, 0, 6, 15 + verticalOffset);
    pop();
    
    // Right leg - opposite phase
    push();
    translate(dino.x + dino.w - 10, dino.y + dino.h);
    rotate(-verticalOffset * 0.05);
    rect(horizontalOffset, 0, 6, 15 - verticalOffset);
    pop();
  }
  
  // Dino tail - position changes based on direction
  if (dino.dir > 0) {
    // Tail on the left when facing right
    fill(dinoColor);
    triangle(
      dino.x, dino.y + dino.h/2,
      dino.x - 12, dino.y + dino.h/2 - 8,
      dino.x - 12, dino.y + dino.h/2 + 8
    );
  } else {
    // Tail on the right when facing left
    fill(dinoColor);
    triangle(
      dino.x + dino.w, dino.y + dino.h/2,
      dino.x + dino.w + 12, dino.y + dino.h/2 - 8,
      dino.x + dino.w + 12, dino.y + dino.h/2 + 8
    );
  }
}

function drawSplashDino() {
  // Dino body
  fill(120, 70, 85);
  noStroke();
  rect(splashDino.x - splashDino.w/2, splashDino.y - splashDino.h/2, 
       splashDino.w, splashDino.h);
  
  // Dino spikes
  fill(120, 70, 65);
  for (let i = 0; i < 3; i++) {
    let spikeX = splashDino.x - splashDino.w/2 + (i + 1) * splashDino.w/4;
    triangle(
      spikeX - 5, splashDino.y - splashDino.w/2,
      spikeX + 5, splashDino.y - splashDino.w/2,
      spikeX, splashDino.y - splashDino.w/2 - 10
    );
  }
  
  // Dino eye
  fill(0, 0, 0);
  ellipse(splashDino.x + splashDino.w/4, splashDino.y - splashDino.w/4, 5, 5);
  
  // Dino mouth
  stroke(0, 0, 0);
  strokeWeight(2);
  noFill();
  arc(splashDino.x + splashDino.w/4, splashDino.y + splashDino.w/4, 
      10, 10, 0, PI);
  noStroke();
}

function draw() {
  if (gameState === "start") {
    // Animated gradient background
    splashTime += 0.01;
    for (let y = 0; y < height; y++) {
      let hue = (y * 0.5 + splashTime * 50) % 360;
      stroke(hue, 50, 20);
      line(0, y, width, y);
    }
    
    // Add random particles
    if (frameCount % 5 === 0) {
      splashParticles.push({
        x: random(width),
        y: height,
        size: random(2, 5),
        speed: random(1, 3),
        color: color(random(360), 100, 100),
        lifetime: 60
      });
    }
    
    // Update and draw particles
    for (let i = splashParticles.length - 1; i >= 0; i--) {
      let p = splashParticles[i];
      p.y -= p.speed;
      
      let alpha = map(p.lifetime, 0, 60, 0, 100);
      fill(hue(p.color), saturation(p.color), brightness(p.color), alpha);
      noStroke();
      ellipse(p.x, p.y, p.size);
      
      if (p.lifetime <= 0) {
        splashParticles.splice(i, 1);
      }
    }
    
    // Draw title with glow effect
    textSize(48);
    textAlign(CENTER);
    for (let i = 3; i > 0; i--) {
      fill(60, 100, 100, 20);
      text("DINO BREAKER", width/2 + i*2, height/2 - 50 + i*2);
    }
    fill(60, 100, 100);
    text("DINO BREAKER", width/2, height/2 - 50);
    
    // Draw instructions with fade effect
    textSize(20);
    let alpha = map(sin(frameCount * 0.05), -1, 1, 50, 100);
    fill(0, 0, 100, alpha);
    text("Use mouse to move paddle", width/2, height/2 + 40);
    text("Break all bricks to complete level", width/2, height/2 + 70);
    text("Don't let the ball fall!", width/2, height/2 + 100);
    text("Click to start", width/2, height/2 + 130);
  } else if (gameState === "playing") {
    background(0);
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.lifetime--;
      if (p.lifetime <= 0) {
        particles.splice(i, 1);
      }
    }
    
    // Draw game elements
    drawDino();
    
    if (dino.rawrText.visible) {
      let textX = dino.dir > 0 ? dino.x + dino.w + 5 : dino.x - 35;
      let textY = dino.y - 15;
      textSize(24);
      fill(0, 100, 100);
      textAlign(dino.dir > 0 ? LEFT : RIGHT);
      text("RAWR", textX, textY);
    }
    
    fill(240, 100, 100);
    ellipse(ball.x, ball.y, ball.r * 2);
    
    for (let brick of bricks) {
      if (!brick.broken) {
        // Fill the brick with its color
        fill(brick.color);
        // Add black outline
        stroke(0);     // Set outline color to black
        strokeWeight(2); // Set outline thickness
        // Draw the brick
        rect(brick.x, brick.y, brick.w, brick.h);
        // Reset stroke for other elements
        noStroke();
      }
    }
    
    fill(240, 100, 100);
    rect(paddle.x, paddle.y, paddle.w, paddle.h);
    fill(240, 100, 120);
    rect(paddle.x + 2, paddle.y + 2, paddle.w - 4, 2);
    rect(paddle.x + 2, paddle.y + 2, 2, paddle.h - 4);
    fill(240, 100, 80);
    rect(paddle.x + paddle.w - 4, paddle.y + paddle.h - 4, 4, 4);
    
    if (powerUp.active) {
      let elapsed = (millis() - powerUp.startTime) / 1000;
      let remainingRatio = 1 - (elapsed / powerUp.duration);
      let barWidth = paddle.w * remainingRatio;
      let barX = paddle.x + (paddle.w - barWidth) / 2;
      
      fill(60, 100, 100);
      rect(barX, paddle.y + paddle.h + 2, barWidth, 3);
    }
    
    for (let p of particles) {
      let alpha = map(p.lifetime, 0, 30, 0, 100);
      fill(hue(p.color), saturation(p.color), brightness(p.color), alpha);
      rect(p.x, p.y, p.size, p.size);
    }
    
    if (powerUp.visible) {
      fill(60, 100, 100);
      rect(powerUp.x, powerUp.y, powerUp.w, powerUp.h);
    }

    if (isPaused) {
      fill(0, 0, 0, 50);
      rect(0, 0, width, height);
      
      textSize(32);
      fill(0, 0, 100, 100);
      textAlign(CENTER);
      text("PAUSED", width/2, height/2);
      textSize(20);
      text("Press the spacebar to resume game", width/2, height/2 + 40);
    } else {
      if (powerUp.active) {
        let elapsed = (millis() - powerUp.startTime) / 1000;
        if (elapsed >= powerUp.duration) {
          powerUp.active = false;
        }
      }
      
      if (powerUp.visible) {
        powerUp.y += 2;
        
        if (powerUp.y + powerUp.h > paddle.y && 
            powerUp.y < paddle.y + paddle.h &&
            powerUp.x + powerUp.w > paddle.x && 
            powerUp.x < paddle.x + paddle.w) {
          powerUp.visible = false;
          powerUp.active = true;
          powerUp.startTime = millis();
        }
        
        if (powerUp.y > height) {
          powerUp.visible = false;
        }
      }
      
      if (!dino.isPaused) {
        dino.x += dino.vx * dino.dir;
        if (dino.x <= 0) {
          dino.dir = 1;
        } else if (dino.x + dino.w >= width) {
          dino.dir = -1;
        }
      } else {
        if (millis() - dino.pauseStartTime >= 1000) {
          dino.isPaused = false;
          dino.rawrText.visible = false;
        }
      }
      
      if (!dino.isPaused && !dino.rawrText.visible) {
        if (ball.x + ball.r > dino.x && 
            ball.x - ball.r < dino.x + dino.w && 
            ball.y + ball.r > dino.y && 
            ball.y - ball.r < dino.y + dino.h) {
          dino.isPaused = true;
          dino.pauseStartTime = millis();
          dino.rawrText.visible = true;
          dino.rawrText.startTime = millis();
          score += 1500;
          
          scoreParticles = [{
            x: dino.x + dino.w/2,
            y: dino.y - 30,
            vx: random(-2, 2),
            vy: random(-2, 2),
            size: 24,
            color: color(60, 100, 100),
            lifetime: 60,
            text: "+1500"
          }];
        }
      }
      
      for (let i = scoreParticles.length - 1; i >= 0; i--) {
        let p = scoreParticles[i];
        let alpha = map(p.lifetime, 0, 60, 0, 100);
        fill(hue(p.color), saturation(p.color), brightness(p.color), alpha);
        textSize(p.size);
        textAlign(CENTER);
        text(p.text, p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        p.lifetime--;
        if (p.lifetime <= 0) {
          scoreParticles.splice(i, 1);
        }
      }
      
      paddle.x = constrain(mouseX - paddle.w / 2, 0, width - paddle.w);
      
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx = abs(ball.vx);
      } else if (ball.x + ball.r > width) {
        ball.x = width - ball.r;
        ball.vx = -abs(ball.vx);
      }
      
      if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy = abs(ball.vy);
      }
      
      if (ball.y + ball.r > paddle.y && 
          ball.y - ball.r < paddle.y + paddle.h && 
          ball.x > paddle.x && 
          ball.x < paddle.x + paddle.w) {
        let relativePosition = (ball.x - paddle.x) / paddle.w;
        let angle = map(relativePosition, 0, 1, -PI/3, PI/3);
        let speed = sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = speed * sin(angle);
        ball.vy = -speed * cos(angle);
        pointMultiplier = 1;
      }
      
      for (let i = bricks.length - 1; i >= 0; i--) {
        let brick = bricks[i];
        if (brick.broken) continue;
        
        let closestX = constrain(ball.x, brick.x, brick.x + brick.w);
        let closestY = constrain(ball.y, brick.y, brick.y + brick.h);
        let dx = ball.x - closestX;
        let dy = ball.y - closestY;
        if (dx * dx + dy * dy < ball.r * ball.r) {
          brick.broken = true;
          score += brick.points * pointMultiplier;
          pointMultiplier += 0.1;
          
          if (random() < 0.1 && !powerUp.visible && !powerUp.active) {
            powerUp.x = brick.x + brick.w/2 - powerUp.w/2;
            powerUp.y = brick.y + brick.h/2;
            powerUp.visible = true;
          }
          
          for (let p = 0; p < 10; p++) {
            let particle = {
              x: brick.x + brick.w / 2,
              y: brick.y + brick.h / 2,
              vx: random(-2, 2),
              vy: random(-2, 2),
              size: random(5, 10),
              color: brick.color,
              lifetime: 30
            };
            particles.push(particle);
          }
          
          if (!powerUp.active) {
            ball.vy = -ball.vy;
          }
        }
      }
      
      if (ball.y + ball.r > height) {
        lives--;
        powerUp.active = false;
        if (lives > 0) {
          gameState = "balllost";
        } else {
          gameState = "gameover";
        }
      }
      
      // Check if it's time to show level complete screen after developer mode
      if (devModeTransitionTime > 0 && millis() >= devModeTransitionTime) {
        devModeTransitionTime = 0; // Reset the transition time
        if (level === 20) {
          gameState = "winner";
          winTime = millis();
          // Initialize confetti
          for (let i = 0; i < 100; i++) {
            confetti.push({
              x: random(width),
              y: random(-100, 0),
              size: random(5, 15),
              speed: random(4, 10),
              color: color(random(360), 70, 100),
              rotation: random(TWO_PI),
              rotSpeed: random(-0.1, 0.1)
            });
          }
          // Initialize stars
          for (let i = 0; i < 20; i++) {
            winStars.push({
              x: random(width),
              y: random(height),
              size: random(10, 30),
              angle: random(TWO_PI),
              spinSpeed: random(0.02, 0.08)
            });
          }
        } else {
          gameState = "levelcomplete";
        }
      }
      
      // Only check for normal level completion if not in developer mode
      if (devModeTransitionTime === 0) {
        let allBroken = bricks.every(b => b.broken);
        if (allBroken) {
          if (level === 20) {
            gameState = "winner";
            winTime = millis();
            // Initialize confetti
            for (let i = 0; i < 100; i++) {
              confetti.push({
                x: random(width),
                y: random(-100, 0),
                size: random(5, 15),
                speed: random(4, 10),
                color: color(random(360), 70, 100),
                rotation: random(TWO_PI),
                rotSpeed: random(-0.1, 0.1)
              });
            }
            // Initialize stars
            for (let i = 0; i < 20; i++) {
              winStars.push({
                x: random(width),
                y: random(height),
                size: random(10, 30),
                angle: random(TWO_PI),
                spinSpeed: random(0.02, 0.08)
              });
            }
          } else {
            gameState = "levelcomplete";
          }
        }
      }
    }
    
    // Collect power-up
    if (powerUp.visible) {
      if (powerUp.y + powerUp.h > paddle.y && 
          powerUp.y < paddle.y + paddle.h &&
          powerUp.x + powerUp.w > paddle.x && 
          powerUp.x < paddle.x + paddle.w) {
        powerUp.visible = false;
        powerUp.active = true;
        powerUp.startTime = millis();
      }
    }

    fill(0, 0, 100);
    textSize(20);
    textAlign(LEFT);
    text("Score: " + Math.floor(score), 10, 30);
    text("Multiplier: x" + pointMultiplier.toFixed(1), 10, 60);
    textAlign(RIGHT);
    text("Level: " + level, width - 10, 30);
    text("Lives: " + lives, width - 10, 60);
  } else if (gameState === "balllost") {
    background(0);
    
    // Draw all game elements first
    // Draw dino
    drawDino();
    
    // Draw ball
    fill(240, 100, 100);
    ellipse(ball.x, ball.y, ball.r * 2);
    
    // Draw bricks
    for (let brick of bricks) {
      if (!brick.broken) {
        fill(brick.color);
        stroke(0);
        strokeWeight(2);
        rect(brick.x, brick.y, brick.w, brick.h);
        noStroke();
      }
    }
    
    // Draw paddle
    fill(240, 100, 100);
    rect(paddle.x, paddle.y, paddle.w, paddle.h);
    fill(240, 100, 120);
    rect(paddle.x + 2, paddle.y + 2, paddle.w - 4, 2);
    rect(paddle.x + 2, paddle.y + 2, 2, paddle.h - 4);
    fill(240, 100, 80);
    rect(paddle.x + paddle.w - 4, paddle.y + paddle.h - 4, 4, 4);
    
    // Draw particles
    for (let p of particles) {
      let alpha = map(p.lifetime, 0, 30, 0, 100);
      fill(hue(p.color), saturation(p.color), brightness(p.color), alpha);
      rect(p.x, p.y, p.size, p.size);
    }
    
    // Draw UI
    fill(0, 0, 100);
    textSize(20);
    textAlign(LEFT);
    text("Score: " + Math.floor(score), 10, 30);
    text("Multiplier: x" + pointMultiplier.toFixed(1), 10, 60);
    textAlign(RIGHT);
    text("Level: " + level, width - 10, 30);
    text("Lives: " + lives, width - 10, 60);
    
    // Add semi-transparent overlay
    fill(0, 0, 0, 50); // Black with 50% transparency
    rect(0, 0, width, height);
    
    // Draw ball lost text with full opacity
    textSize(32);
    fill(0, 0, 100, 100);
    textAlign(CENTER);
    text("Ball Lost!", width / 2, height / 2 - 50);
    textSize(20);
    text("Lives remaining: " + lives, width / 2, height / 2);
    text("Click to continue", width / 2, height / 2 + 30);
  } else if (gameState === "levelcomplete") {
    background(0);
    textSize(32);
    fill(0, 0, 100);
    textAlign(CENTER);
    
    if (isBonusLevel) {
      // Special bonus level completion screen
      text("Bonus Level Complete!", width / 2, height / 2 - 50);
      textSize(24);
      text("You found the secret level!", width / 2, height / 2);
      textSize(20);
      text("Bonus Score: " + Math.floor(score), width / 2, height / 2 + 40);
      text("Game Score: " + Math.floor(originalScore), width / 2, height / 2 + 70);
      text("Click to return to level " + originalLevel, width / 2, height / 2 + 110);
    } else {
      // Normal level completion screen
      text("Level " + level + " Complete!", width / 2, height / 2 - 50);
      textSize(20);
      text("Score: " + Math.floor(score), width / 2, height / 2);
      text("Click to continue", width / 2, height / 2 + 30);
    }
    
    if (levelSoundPlayed) {
      levelSoundPlayed = false;
    }
  } else if (gameState === "gameover") {
    background(0);
    textSize(32);
    fill(0, 0, 100);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2 - 50);
    textSize(20);
    text("Final Score: " + Math.floor(score), width / 2, height / 2);
    text("Click to restart", width / 2, height / 2 + 50);
    levelSoundPlayed = false;
  } else if (gameState === "winner") {
    background(0);
    
    // Draw animated background stars
    for (let star of winStars) {
      push();
      translate(star.x, star.y);
      rotate(star.angle);
      star.angle += star.spinSpeed;
      fill(60, 100, 100);
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5 - HALF_PI;
        let x1 = cos(angle) * star.size;
        let y1 = sin(angle) * star.size;
        vertex(x1, y1);
        angle += TWO_PI / 10;
        let x2 = cos(angle) * (star.size/2);
        let y2 = sin(angle) * (star.size/2);
        vertex(x2, y2);
      }
      endShape(CLOSE);
      pop();
    }
    
    // Update and draw confetti
    for (let c of confetti) {
      push();
      translate(c.x, c.y);
      rotate(c.rotation);
      fill(c.color);
      rect(-c.size/2, -c.size/2, c.size, c.size);
      pop();
      
      c.y += c.speed;
      c.rotation += c.rotSpeed;
      
      // Reset confetti when it goes off screen
      if (c.y > height) {
        c.y = random(-100, 0);
        c.x = random(width);
      }
    }
    
    // Create pulsing effect for text
    let pulse = sin(millis() * 0.005) * 0.2 + 0.8;
    let titleSize = 60 * pulse;
    
    // Draw rainbow gradient text
    textSize(titleSize);
    textAlign(CENTER, CENTER);
    let congratsText = "CONGRATULATIONS!";
    let rainbowSpeed = millis() * 0.001;
    
    for (let i = 0; i < congratsText.length; i++) {
      let hue = (rainbowSpeed * 100 + i * 20) % 360;
      fill(hue, 100, 100);
      text(congratsText[i], 
           width/2 - textWidth(congratsText)/2 + textWidth(congratsText.substring(0, i)), 
           height/2 - 50);
    }
    
    // Draw score with glowing effect
    let glowIntensity = sin(millis() * 0.01) * 0.5 + 0.5;
    for (let i = 3; i > 0; i--) {
      textSize(30);
      fill(60, 100, 100, glowIntensity * 25);
      text(`Final Score: ${Math.floor(score)}`, width/2, height/2 + 50);
    }
    textSize(30);
    fill(60, 100, 100);
    text(`Final Score: ${Math.floor(score)}`, width/2, height/2 + 50);
    
    // Draw "Click to play again" text
    textSize(20);
    fill(0, 0, 100);
    text("Click to play again", width/2, height/2 + 120);
    levelSoundPlayed = false;
  }
}

function mousePressed(event) {
  if (gameState === "start") {
    gameState = "playing";
    resetBall();
  } else if (gameState === "balllost") {
    gameState = "playing";
    resetBall();
  } else if (gameState === "levelcomplete") {
    if (isBonusLevel) {
      // Return to original level state and mark bonus level as played
      isBonusLevel = false;
      hasPlayedBonusLevel = true;
      level = originalLevel;
      bricks = originalBricks.map(brick => ({...brick}));
      score = originalScore;
      pointMultiplier = originalPointMultiplier;
      ball = {...originalBall};
      gameState = "playing";
    } else {
      level++;
      createBricks();
      gameState = "playing";
      resetBall();
    }
  } else if (gameState === "gameover") {
    initializeGame();
    hasPlayedBonusLevel = false;
  } else if (gameState === "winner") {
    initializeGame();
    hasPlayedBonusLevel = false;
    confetti = [];
    winStars = [];
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    dino.y = height - dino.h;
  } else if (key === ' ') {
    if (gameState === "playing") {
      isPaused = !isPaused;
    }
  } else if (key === 'c' && gameState === "playing" && !isBonusLevel && !hasPlayedBonusLevel && !isPaused) {
    // Save current level state before entering bonus level
    originalLevel = level;
    originalBricks = bricks.map(brick => ({...brick}));
    originalScore = score;
    originalPointMultiplier = pointMultiplier;
    originalBall = {...ball};
    
    // Enter bonus level
    isBonusLevel = true;
    createBricks();
    resetBall();
  }
}

// Add this function to handle right-click context menu prevention
function preventRightClick() {
  document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });
} 