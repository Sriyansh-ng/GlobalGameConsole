const motoCanvas = document.getElementById("motoCanvas");
const motoCtx = motoCanvas.getContext("2d");

// Add physics/control constants and level storage
const ACCEL = 0.4;
const BRAKE = 0.8;
const GROUND_FRICTION = 0.06;
const AIR_DRAG = 0.005;
const MAX_SPEED = 10;
const MAX_ROT = 0.6;
const ROTATE_SPEED = 0.05;
const SLOPE_ALIGN = 0.15;

// Camera and procedural terrain tuning
const CAMERA_FOLLOW = 0.12;          // how quickly camera follows bike
const CAMERA_TARGET_FACTOR = 0.35;   // bike stays around 35% from the left
const SEG_LEN_MIN = 80;
const SEG_LEN_MAX = 200;
const ELEV_MIN = 40;                 // distance from bottom
const ELEV_MAX = 140;
const MAX_SLOPE = 0.6;               // limit slope between segments (radians)
const BUMP_PROB = 0.25;
const BUMP_HEIGHT = 18;

let bike, ground, gravity, keys, motoGame, levelPoints, cameraX;

// ... existing code ...
function initMoto() {
  bike = {
    x: 50,
    y: 200,
    width: 40,
    height: 20,
    dx: 0,
    dy: 0,
    rotation: 0
  };

  ground = motoCanvas.height - 40;
  gravity = 0.4;
  keys = {};

  cameraX = 0;
  levelPoints = [];
  buildInitialLevel();

  document.addEventListener("keydown", e => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    keys[e.key] = true;
  });
  document.addEventListener("keyup", e => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    keys[e.key] = false;
  });

  // Switch from setInterval to requestAnimationFrame for smoother loop
  if (motoGame) cancelAnimationFrame(motoGame);
  const loop = () => {
    updateMoto();
    motoGame = requestAnimationFrame(loop);
  };
  motoGame = requestAnimationFrame(loop);
}
// ... existing code ...
function updateMoto() {
  // Gravity first
  bike.dy += gravity;

  // Controls: accelerate/brake horizontally; tilt with left/right
  if (keys["ArrowUp"]) {
    bike.dx += ACCEL;
  }
  if (keys["ArrowDown"]) {
    if (bike.dx > 0) bike.dx = Math.max(0, bike.dx - BRAKE);
    else if (bike.dx < 0) bike.dx = Math.min(0, bike.dx + BRAKE);
  }
  if (keys["ArrowLeft"]) bike.rotation -= ROTATE_SPEED;
  if (keys["ArrowRight"]) bike.rotation += ROTATE_SPEED;

  // Clamp rotation while in air
  if (bike.rotation > MAX_ROT) bike.rotation = MAX_ROT;
  if (bike.rotation < -MAX_ROT) bike.rotation = -MAX_ROT;

  // Friction/drag based on contact
  const frontX = bike.x + bike.width - 5;
  const rearX = bike.x + 5;
  const groundFront = groundYAt(frontX);
  const groundRear = groundYAt(rearX);
  const onGround = (bike.y + bike.height >= Math.min(groundFront, groundRear) - 0.01);

  if (!keys["ArrowUp"] && !keys["ArrowDown"]) {
    if (onGround) {
      if (bike.dx > 0) bike.dx = Math.max(0, bike.dx - GROUND_FRICTION);
      else if (bike.dx < 0) bike.dx = Math.min(0, bike.dx + GROUND_FRICTION);
    } else {
      bike.dx *= (1 - AIR_DRAG);
    }
  }

  // Clamp horizontal speed
  if (bike.dx > MAX_SPEED) bike.dx = MAX_SPEED;
  if (bike.dx < -MAX_SPEED) bike.dx = -MAX_SPEED;

  // Integrate position (world coordinates)
  bike.x += bike.dx;
  bike.y += bike.dy;

  // Collision with piecewise-linear ground: sample under both wheels
  const newFrontY = groundYAt(frontX);
  const newRearY = groundYAt(rearX);
  const supportY = Math.min(newFrontY, newRearY);

  if (bike.y + bike.height > supportY) {
    bike.y = supportY - bike.height;
    bike.dy = 0;

    // Align to slope when grounded
    const slopeAngle = Math.atan2(newFrontY - newRearY, frontX - rearX);
    bike.rotation += (slopeAngle - bike.rotation) * SLOPE_ALIGN;
  }

  // Camera follow: keep bike near target screen position
  const targetScreenX = motoCanvas.width * CAMERA_TARGET_FACTOR;
  const delta = (bike.x - (cameraX + targetScreenX));
  cameraX += delta * CAMERA_FOLLOW;
  if (cameraX < 0) cameraX = 0;

  // Procedurally extend terrain ahead and prune behind
  extendLevelIfNeeded();

  drawMoto();
}
// ... existing code ...
function drawMoto() {
  motoCtx.fillStyle = "#1a1a1a";
  motoCtx.fillRect(0, 0, motoCanvas.width, motoCanvas.height);

  // Draw piecewise ground (translated by camera)
  motoCtx.save();
  motoCtx.translate(-cameraX, 0);
  drawGround();

  // Draw bike body (in world coordinates)
  motoCtx.save();
  motoCtx.translate(bike.x + bike.width / 2, bike.y + bike.height / 2);
  motoCtx.rotate(bike.rotation);
  motoCtx.fillStyle = "#FF4500";
  motoCtx.fillRect(-bike.width / 2, -bike.height / 2, bike.width, bike.height);
  motoCtx.restore();

  // Wheels
  motoCtx.fillStyle = "#000";
  motoCtx.beginPath();
  motoCtx.arc(bike.x + 5, bike.y + bike.height, 10, 0, Math.PI * 2);
  motoCtx.arc(bike.x + bike.width - 5, bike.y + bike.height, 10, 0, Math.PI * 2);
  motoCtx.fill();

  motoCtx.restore();
}
// ... existing code ...
function buildInitialLevel() {
  const h = motoCanvas.height;
  const y0 = h - 100; // start height from bottom
  levelPoints.length = 0;
  levelPoints.push({ x: 0, y: y0 });
  // Build enough to cover a few screens
  const targetRight = motoCanvas.width * 2.5;
  while (levelPoints[levelPoints.length - 1].x < targetRight) {
    appendRandomSegment();
  }
}

function extendLevelIfNeeded() {
  const neededRight = cameraX + motoCanvas.width * 3;
  // FIX: recompute rightmost while extending to avoid infinite loop
  while (levelPoints[levelPoints.length - 1].x < neededRight) {
    appendRandomSegment();
  }

  // Prune segments far left to avoid unbounded growth
  const pruneLeft = cameraX - motoCanvas.width * 1.5;
  while (levelPoints.length > 2 && levelPoints[1].x < pruneLeft) {
    levelPoints.shift();
  }
}

function appendRandomSegment() {
  const h = motoCanvas.height;
  const last = levelPoints[levelPoints.length - 1];

  // Pick length
  const len = SEG_LEN_MIN + Math.random() * (SEG_LEN_MAX - SEG_LEN_MIN);

  // Pick target elevation (distance from bottom)
  const currentElev = h - last.y;
  const targetElev = clamp(
    currentElev + (Math.random() * 80 - 40), // small change
    ELEV_MIN,
    ELEV_MAX
  );

  // Convert elevation back to y
  let nextY = h - targetElev;

  // Limit slope between last.y and nextY
  const maxRise = Math.tan(MAX_SLOPE) * len;
  nextY = clamp(nextY, last.y - maxRise, last.y + maxRise);

  // Optionally add a small bump in between
  const nextX = last.x + len;
  if (Math.random() < BUMP_PROB) {
    const midX = last.x + len * (0.4 + Math.random() * 0.2);
    const midY = nextY - BUMP_HEIGHT; // small hill
    levelPoints.push({ x: midX, y: midY });
  }

  levelPoints.push({ x: nextX, y: nextY });
}

function groundYAt(x) {
  // x is in world coordinates
  if (levelPoints.length < 2) return ground;

  // Before start / after end quick clamps
  if (x <= levelPoints[0].x) return levelPoints[0].y;
  if (x >= levelPoints[levelPoints.length - 1].x) return levelPoints[levelPoints.length - 1].y;

  // Find segment that contains x and interpolate
  for (let i = 0; i < levelPoints.length - 1; i++) {
    const p0 = levelPoints[i];
    const p1 = levelPoints[i + 1];
    if (x >= p0.x && x <= p1.x) {
      const t = (x - p0.x) / (p1.x - p0.x || 1);
      return p0.y + t * (p1.y - p0.y);
    }
  }
  return ground; // Fallback
}

function drawGround() {
  // Only draw the portion near the camera to keep it efficient
  const leftView = cameraX - motoCanvas.width * 0.5;
  const rightView = cameraX + motoCanvas.width * 1.5;

  // Find first visible point index
  let startIdx = 0;
  while (startIdx < levelPoints.length - 1 && levelPoints[startIdx + 1].x < leftView) {
    startIdx++;
  }

  motoCtx.fillStyle = "#444";
  motoCtx.beginPath();
  // Start at first in-view point
  const startPoint = levelPoints[startIdx];
  motoCtx.moveTo(startPoint.x, startPoint.y);

  for (let i = startIdx + 1; i < levelPoints.length; i++) {
    const p = levelPoints[i];
    motoCtx.lineTo(p.x, p.y);
    if (p.x > rightView) break;
  }

  // Close shape straight down to bottom at the right view edge (safe and simple)
  motoCtx.lineTo(rightView, motoCanvas.height);
  motoCtx.lineTo(startPoint.x, motoCanvas.height);
  motoCtx.closePath();
  motoCtx.fill();

  // Optional outline
  motoCtx.strokeStyle = "#666";
  motoCtx.lineWidth = 2;
  motoCtx.beginPath();
  motoCtx.moveTo(startPoint.x, startPoint.y);
  for (let i = startIdx + 1; i < levelPoints.length; i++) {
    const p = levelPoints[i];
    motoCtx.lineTo(p.x, p.y);
    if (p.x > rightView) break;
  }
  motoCtx.stroke();
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
// ... existing code ...
function restartMoto() {
  initMoto();
}

initMoto();