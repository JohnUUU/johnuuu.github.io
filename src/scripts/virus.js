export const virus = function () {
    function Asteroids() {
        if (!window.ASTEROIDS) {
            window.ASTEROIDS = { enemiesKilled: 0 };
        }

        function Vector(x, y) {
            this.x = x;
            this.y = y;
        }

        Vector.prototype = {
            add: function (vec) {
                this.x += vec.x;
                this.y += vec.y;
                return this;
            },
            mul: function (factor) {
                this.x *= factor;
                this.y *= factor;
                return this;
            },
            cp: function () {
                return new Vector(this.x, this.y);
            }
        };

        const that = this;
        const INTERVAL = 30;
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.scrollHeight;
        const maxSpeed = 200;

        this.enemies = [];

        function updateEnemyIndex() {
            that.enemies = [
                ...Array.from(document.querySelectorAll(".desktop-icon")),
                ...Array.from(document.querySelectorAll(".draggable-window"))
            ]
            that.enemies.forEach((enemy) => {
                if (!enemy.movement) {
                    enemy.movement = {
                        pos: new Vector(enemy.offsetLeft, enemy.offsetTop),
                        vel: new Vector(
                            (4 * Math.random() - 2) * maxSpeed,
                            (4 * Math.random() - 2) * maxSpeed
                        )
                    };
                }
                enemy.style.position = "absolute";
            });
        }

        function updatePositions(tDelta) {
            that.enemies.forEach((enemy) => {
                const movement = enemy.movement;

                movement.pos.x = parseFloat(enemy.style.left) || enemy.offsetLeft;
                movement.pos.y = parseFloat(enemy.style.top) || enemy.offsetTop;

                movement.pos.add(movement.vel.cp().mul(tDelta));
                const taskbar = document.querySelector(".taskbar");

                movement.vel.x += -1 + Math.random();
                movement.vel.y += -1 + Math.random() * 9.8 * 0.3;

                if (movement.pos.x < 0 || movement.pos.x + enemy.offsetWidth > w) {
                    movement.vel.x *= -1;
                    movement.pos.x = Math.max(0, Math.min(w - enemy.offsetWidth, movement.pos.x));
                }
                if (movement.pos.y < 0 || movement.pos.y + enemy.offsetHeight > h - (taskbar?.offsetHeight || 0)) {
                    movement.vel.y *= -1;
                    movement.pos.y = Math.max(0, Math.min(h - enemy.offsetHeight - (taskbar?.offsetHeight || 0), movement.pos.y));
                }

                enemy.style.left = `${movement.pos.x}px`;
                enemy.style.top = `${movement.pos.y}px`;
            });
        }

        updateEnemyIndex();

        const gameLoop = () => {
            updatePositions(0.03);
        };

        const gameLoopInterval = setInterval(gameLoop, INTERVAL);

        window.addEventListener("resize", () => {
            updateEnemyIndex();
        });

        this.cleanup = () => {
            clearInterval(gameLoopInterval);
            window.removeEventListener("resize", updateEnemyIndex);
        };
    }

    if (!window.ASTEROIDSPLAYERS) {
        window.ASTEROIDSPLAYERS = [];
    }
    window.ASTEROIDSPLAYERS.push(new Asteroids());
};

export const antivirus = function () {
    if (window.ASTEROIDSPLAYERS) {
        window.ASTEROIDSPLAYERS.forEach((game) => {
            if (game.cleanup) {
                game.cleanup();
            }
        });
        window.ASTEROIDSPLAYERS = []; 
    }

    if (window.ASTEROIDS) {
        delete window.ASTEROIDS;
    }
};