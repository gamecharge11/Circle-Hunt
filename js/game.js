function main() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  function newProjectile(e) {
    increment++;
    if (increment != 1) {
      if (!cooldown && !player.dead) {
        loadedAudio[0].pause();
        loadedAudio[0].load();
        loadedAudio[0].play();

        let targetX = e.clientX,
          targetY = e.clientY;
        projectiles.push(
          new Projectile(
            "white",
            13,
            player.x + player.w / 2,
            player.y + player.h / 2,
            targetX,
            targetY
          )
        );
        cooldown = true;
        setTimeout(function () {
          cooldown = false;
        }, COOLDOWN_TIME);
      }
    }
  }
  function UUID() {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }
  function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const PLR_S = 50;
  let P_Y = canvas.height / 4;
  const GRAVITY = 3;
  const JUMP_H = -45;
  const speed = 17;
  const limitENM = 5;
  const COOLDOWN_TIME = 500;
  const assets = [
    "player.png",
    "player dead.png",
    "enemy.png",
    "bullet.png",
    "heart.png",
  ];
  const audio = ["shoot.mp3||0.5"];
  const keys = {
    left: false,
    right: false,
    up: false,
  };

  let speedEnemy = canvas.width / 165;
  let enemyRate = 750;
  let rateSpawn = getRandomNumberBetween(10000, 15000);
  let score = 0;
  let cooldown = false;
  let projectiles = [];
  let uuidPRJ = [];
  let enemies = [];
  let uuidENM = [];
  let hearts = [];
  let text = [];
  let uuidTXT = [];
  let loaded = [];
  let loadedAudio = [];
  let increment = 0;

  function load() {
    assets.forEach((element) => {
      var image = new Image();
      image.src = "../Assets/images/" + element;
      loaded.push(image);
    });
    audio.forEach((element) => {
      var split = element.split("||");
      var audio = new Audio("../Assets/audio/" + split[0]);
      audio.volume = split[1];
      loadedAudio.push(audio);
    });
    requestAnimationFrame(loop);
  }
  class Player {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.dead = false;
      this.velocityY = 1;
      this.health = 100;
    }

    draw() {
      ctx.beginPath();
      ctx.shadowBlur = 0;
      if (!player.dead) {
        ctx.drawImage(loaded[0], this.x, this.y, 50, 50);
      } else {
        ctx.drawImage(loaded[1], this.x, this.y, 50, 50);
      }
      ctx.fill();
    }

    update() {
      this.draw();
      if (this.y <= canvas.height - P_Y - this.h) {
        if (this.velocityY != 0) {
          this.y += this.velocityY;
          this.velocityY += GRAVITY;
        }
      } else {
        this.velocityY = 0;
        this.y = canvas.height - P_Y - this.h;
      }
    }
  }
  class Enemy {
    constructor(r) {
      this.x = null;
      this.y = null;
      this.r = r;
      this.radians = 0;

      this.spawn = Math.floor(Math.random() * 3);
      if (this.spawn == 0) {
        this.x = -30;
        this.y = getRandomNumberBetween(0, canvas.height - P_Y - player.h - 60);
      } else if (this.spawn == 1) {
        this.x = getRandomNumberBetween(0, canvas.width);
        this.y = -30;
      } else if (this.spawn == 2) {
        this.x = canvas.width + 30;
        this.y = getRandomNumberBetween(0, canvas.height - P_Y - player.h - 60);
      }
      this.uuid = UUID();
      uuidENM.push(this.uuid);
      this.index = null;
      enemies.forEach((enemy, index) => {
        if (enemy.uuid == this.uuid) {
          this.index = index;
        }
      });
    }

    draw() {
      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.drawImage(loaded[2], this.x, this.y, 40, 40);
      ctx.fill();
    }

    update() {
      if (!player.dead) {
        this.radian = Math.atan2(
          player.y + player.h / 2 - this.y,
          player.x + this.r / 2 - this.x
        );
        if (
          distance(
            this.x + this.r / 2,
            this.y + this.r / 2,
            player.x + player.w / 2,
            player.y + player.h / 2
          ) < this.r
        ) {
          enemies.splice(this.index, 1);
          this.index = null;
          player.health -= 15;
          if (score >= 1) {
            text.push(
              new CanvasText(
                this.x + 30,
                this.y - 25,
                "40",
                "main",
                "white",
                `-1`,
                0
              )
            );
          }
          uuidENM.splice(this.index, 1);
        }
        this.x += Math.cos(this.radian) * speedEnemy;
        this.y += Math.sin(this.radian) * speedEnemy;
      }
      this.draw();
    }
  }

  class CanvasText {
    constructor(x, y, size, font, color, txt, type) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.font = font;
      this.color = color;
      this.text = txt;
      this.type = type;
      this.index = null;
      this.uuid = UUID();
      uuidTXT.push(this.uuid);
      this.index = null;
      for (let i = 0; i < text.length; i++) {
        if (text[i].uuid == this.uuid) {
          this.index = i;
        }
      }
      this.draw();
      setTimeout(function () {
        text.splice(this.index, 1);
      }, 1000);
    }

    draw() {
      ctx.beginPath();
      ctx.shadowColor = this.color;
      ctx.font = `${this.size}px ${this.font}`;
      ctx.fillStyle = this.color;
      ctx.fillText(this.text, this.x, this.y);
      ctx.fill();
    }

    update() {
      this.draw();
    }
  }

  class Projectile {
    constructor(color, radius, x, y, targetX, targetY) {
      this.color = color;
      this.radius = radius;
      this.removed = false;
      this.x = x;
      this.y = y;
      this.radians = Math.atan2(targetY - this.y, targetX - this.x);
      this.index = null;
      this.speed = 20;
      for (let i = 0; i < projectiles.length; i++) {
        if (projectiles[i].uuid == this.uuid) {
          this.index = i;
        }
      }
      this.uuid = UUID();
      uuidPRJ.push(this.uuid);
    }

    update() {
      if (!player.dead) {
        this.x += Math.cos(this.radians) * this.speed;
        this.y += Math.sin(this.radians) * this.speed;
        enemies.forEach((enemy, index) => {
          if (
            distance(
              this.x + this.radius / 2,
              this.y + this.radius / 2,
              enemy.x + enemy.r / 2,
              enemy.y + enemy.r / 2
            ) < enemy.r
          ) {
            text.push(
              new CanvasText(
                this.x + 10,
                this.y + 10,
                "40",
                "main",
                "white",
                `+1`,
                1
              )
            );
            score++;
            this.speed -= 5;
            if (this.speed <= 5) {
              projectiles.splice(this.index, 1);
              this.removed = true;
            }
            uuidENM.splice(index, 1);
            enemies.splice(index, 1);
          }
        });
      }
    }

    draw(index) {
      if (!this.removed) {
        this.update();
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.drawImage(loaded[3], this.x, this.y, 26, 26);
        ctx.fill();
      }
    }

    destroy(index) {
      if (this.y <= 0) {
        projectiles.splice(index, 1);
        uuidPRJ.splice(index, 1);
      } else if (this.x <= 0) {
        projectiles.splice(index, 1);
        uuidPRJ.splice(index, 1);
      } else if (this.y >= canvas.height - P_Y - this.radius) {
        projectiles.splice(index, 1);
        uuidPRJ.splice(index, 1);
      } else if (this.x >= canvas.width) {
        projectiles.splice(index, 1);
        uuidPRJ.splice(index, 1);
      }
    }
  }

  class Bar {
    constructor(width, height, percentage) {
      this.width = width;
      this.height = height;
      this.percentage = percentage;
      this.max = false;
      this.x = canvas.width / 2 - this.width / 2;
    }
    draw() {
      if (!this.max) {
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `white`;
        ctx.rect(
          canvas.width / 2 - this.width / 2,
          40,
          this.width,
          this.height
        );
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `red`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "red";
        ctx.rect(
          canvas.width / 2 - this.width / 2,
          40,
          (this.percentage / 100) * this.width,
          this.height
        );
        ctx.fill();
      }
    }
    update() {
      this.draw();
      if (player.health > 100) {
        player.health = 100;
      } else if (player.health <= 0) {
        bar.percentage = 0;
      } else {
        this.percentage = player.health;
      }
    }
  }

  class Heart {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 40;
      this.h = 40;
    }

    draw() {
      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.drawImage(loaded[4], this.x, this.y, this.w, this.h);
      ctx.fill();
    }

    update() {
      if (
        distance(
          this.x + this.w / 2,
          this.y + this.h / 2,
          player.x + player.w / 2,
          player.y + player.h / 2
        ) < this.w
      ) {
        hearts = [];
        player.health += 10;
      }
      this.draw();
    }
  }

  const player = new Player(canvas.width / 2 - PLR_S / 2, 200, PLR_S, PLR_S);
  const bar = new Bar(400, 30, 100);

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.font = `40px sub`;
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, 30, 70);
    ctx.fill();

    window.addEventListener("keydown", function (e) {
      switch (e.keyCode) {
        case 32:
          keys.up = true;
          break;
        case 65:
          keys.left = true;
          break;
        case 68:
          keys.right = true;
          break;
      }
    });

    window.addEventListener("keyup", function (e) {
      switch (e.keyCode) {
        case 32:
          keys.up = false;
          break;
        case 65:
          keys.left = false;
          break;
        case 68:
          keys.right = false;
          break;
        case 87:
          keys.up = false;
          break;
      }
    });
    if (!player.dead) {
      if (keys.left) {
        if (player.x >= 0) {
          player.x -= speed;
        }
        if (keys.up) {
          if (player.velocityY == 0) {
            player.velocityY = JUMP_H;
            player.velocityY += 0.1;
          }
        }
      } else if (keys.right) {
        if (player.x <= canvas.width - player.w) {
          player.x += speed;
        }
        if (keys.up) {
          if (player.velocityY == 0) {
            player.velocityY = JUMP_H;
            player.velocityY += 0.1;
          }
        }
      } else if (keys.up) {
        if (player.velocityY == 0) {
          player.velocityY = JUMP_H;
          player.velocityY += 0.1;
        }
      }
    }
    if (player.x <= 0) {
      player.x = 0;
    } else if (player.x >= canvas.width - player.w) {
      player.x = canvas.width - player.w;
    }

    projectiles.forEach((element) => {
      element.draw();
    });
    bar.update();
    player.update();
    hearts.forEach((element) => {
      element.update();
    });
    enemies.forEach((element) => {
      element.update();
    });
    text.forEach((element, index) => {
      element.update();
    });

    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, canvas.height, canvas.width, -P_Y);
    ctx.fill();

    if (player.health <= 0) {
      player.dead = true;
      document.getElementById("gameOver").style.opacity = "1";
      document.getElementById("gameOver").innerHTML = `
    <h1>Game Over!</h1>
    <br /><br /><br />
    <h2>Score: <span id="score"></span></h2>
    <br /><br />
    <button id="playAgain" onclick="javascript:location.reload()">Play Again</button>
    `;
      document.body.style.cursor = "auto";
      document.getElementById("score").innerHTML = score.toString();
    }
    if (player.health > 100) {
      player.health = 100;
    }
    if (!player.dead) {
      requestAnimationFrame(loop);
    }
  }

  setInterval(function () {
    if (hearts.length == 0 && player.health < 100 && !player.dead) {
      hearts.push(
        new Heart(
          Math.random() * canvas.width,
          getRandomNumberBetween(
            canvas.height - (P_Y + 40),
            canvas.height - P_Y + (JUMP_H * GRAVITY + 40)
          )
        )
      );
      rateSpawn = getRandomNumberBetween(7000, 10000);
    }
  }, rateSpawn);
  setInterval(function () {
    if (enemies.length + 1 <= limitENM && !player.dead) {
      if (Math.floor(Math.random() * 3) <= 1) {
        enemies.push(new Enemy(20));
        speedEnemy += 0.01;
      }
    }
  }, enemyRate);

  window.addEventListener("click", function (e) {
    newProjectile(e);
  });

  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    P_Y = canvas.height / 4;
    speedEnemy = canvas.width / 165;
  });
  window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  load();
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }
}
