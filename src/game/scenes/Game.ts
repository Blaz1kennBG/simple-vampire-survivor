import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { BaseEnemy } from "../enemies/base";
import { BaseProjectile } from "../projectiles/base";
import { BigEnemy } from "../enemies/big";
import { RocketProjectile } from "../projectiles/rocket";
import { PLAYER_LEVELS, UserState, useUserStore } from "../../state/user";
import { EVENTS } from "../../events/events";
const enemyClassMap = {
    base: BaseEnemy,
    big: BigEnemy,
};

// 2. Define your spawn chances (can be changed at runtime)
let enemyChances = {
    base: 0.7,
    big: 0.3,
};
export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    playerControls: {
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        up: Phaser.Input.Keyboard.Key;
    };
    user: UserState = useUserStore.getState(); // Zustand store for user state
    player = {
        model: undefined as Phaser.GameObjects.Rectangle | undefined,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        speed: this.user.movement_speed,
        acceleration: 1200,
        friction: 1000,
        hp: this.user.health,
        damage: this.user.damage,
        invulnerableUntil: 0,
        colors: {
            default: 0x39ff14,
            highlight: 0xffff33,
        },
    };
    enemies: BaseEnemy[] = [];
    maxEnemies = 2; // max number of enemies on screen
    enemyMovementSpeed = 50;
    playerProjectiles: any[] = [];

    projectileFireRates = {
        basic_laser: Infinity, // ms
        rockets: Infinity,
    };
    projectileLastFire = {
        rockets: 0,
        basic_laser: 0,
    };
    spawnTimestamp = Date.now() + 1; // initial spawn time, 3 seconds from now
    projectileDamage = {
        rocket: 5,
        basic: 1,
    };

    unsubscribeUserStore: () => void; // For Zustand store subscription

    /**
     * Progressive difficulty config
     * All values are easily customizable for tuning game difficulty
     */
    difficultyConfig = {
        // Base HP for base enemy type
        baseEnemyHp: 2,
        // Base damage for base enemy type
        baseEnemyDamage: 1,
        // Base HP for big enemy type
        bigEnemyHp: 5,
        // Base damage for big enemy type
        bigEnemyDamage: 3,
        // How much HP increases per minute of game time
        hpIncreasePerMinute: 1, // HP added per minute
        // How much damage increases per minute of game time
        damageIncreasePerMinute: 0.5, // Damage added per minute
        // Maximum multiplier for HP scaling
        maxHpMultiplier: 10,
        // Maximum multiplier for damage scaling
        maxDamageMultiplier: 5,
        // Starting max enemies on screen
        baseMaxEnemies: 4,
        // How many more enemies are allowed per minute
        maxEnemiesIncreasePerMinute: 4, // Enemies added per minute
        // Maximum cap for enemies on screen
        maxEnemiesCap: 20,
        // Minimum allowed interval between spawns (ms)
        minSpawnInterval: 250, // ms
        // How much to decrease spawn interval per minute (ms)
        spawnIntervalDecreasePerMinute: 50, // ms decrease per minute
    };
    gameStartTime = Date.now();

    constructor() {
        super("Game");
    }

    create() {
        this.cameras.main.setBackgroundColor("#121212");
        this.setupPlayer();
        this.playerControls = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        }) as any;
        // Subscribe to Zustand store for live stat updates

        const user = useUserStore.getState();
        this.player.hp = user.health;
        this.player.damage = user.damage;
        this.player.speed = user.movement_speed;
        // Subscribe to Zustand store for live stat updates

        this.unsubscribeUserStore = useUserStore.subscribe((user) => {
            this.player.hp = user.health;
            this.player.damage = user.damage;
            this.player.speed = user.movement_speed;
        });
        EventBus.emit("current-scene-ready", this);
        this.game.sound.play("music_1", {
            loop: true,
            volume: 0.2,
        });

        this.setupEventListeners();
    }
    loadSounds() {
        this.load.audio("rocket_fire", "sounds/rocket-fire.wav");
        this.load.audio("rocket_explode", " sounds/rocket-explode.wav");
        this.load.audio("basic_fire_1", "sounds/basic-fire-1.wav");
        this.load.audio("basic_fire_2", "sounds/basic-fire-2.wav");
        this.load.audio("basic_fire_3", "sounds/basic-fire-3.wav");
        this.load.audio("music_1", "sounds/music-1.mp3");
    }
    preload() {
        this.loadSounds();
    }

    setupEventListeners() {
        EventBus.on(EVENTS.GAME_PAUSE, () => {
            this.scene.pause();
        });
        EventBus.on(EVENTS.GAME_RESUME, () => {
            this.scene.resume();
        });
    }
    setupPlayer() {
        const currUser = useUserStore.getInitialState();
        this.user = currUser;
        this.player.position = {
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
        };
        this.player.velocity = { x: 0, y: 0 };
        this.player.model = this.add.rectangle(
            this.player.position.x,
            this.player.position.y,
            35,
            35,
            this.player.colors.default
        );
        this.player.model.setDepth(10); // Ensure player is above other objects

        // Sync player stats from store in case they changed before game start
        const user = useUserStore.getState();
        this.player.hp = user.health;
        this.player.damage = user.damage;
        this.player.speed = user.movement_speed;

          if (user.upgrades.rockets?.enabled) {
                this.projectileFireRates.rockets = user.upgrades.rockets
                    .attack_speed as number;
            }
            if (user.upgrades.basic_laser?.enabled) {
                this.projectileFireRates.basic_laser =
                    user.upgrades.basic_laser.attack_speed as number;
            }
        


        EventBus.on(EVENTS.USER_UPDATE, (updatedUser: UserState) => {
            this.user = updatedUser;
            this.player.hp = updatedUser.health;
            this.player.damage = updatedUser.damage;
            this.player.speed = updatedUser.movement_speed;
            if (updatedUser.upgrades.rockets?.enabled) {
                this.projectileFireRates.rockets = updatedUser.upgrades.rockets
                    .attack_speed as number;
            }
            if (updatedUser.upgrades.basic_laser?.enabled) {
                this.projectileFireRates.basic_laser =
                    updatedUser.upgrades.basic_laser.attack_speed as number;
            }
        });
    }
    update() {
        this.updatePlayerPosition();
        this.spawnEnemyAtRandomPosition();
        this.moveEnemiesTowardPlayer();
        this.checkCollisionWithEnemies();
        this.fireProjectileHandler();
        this.moveProjectiles();
        // Update logic for the game scene can be added here
    }
    updatePlayerPosition() {
        const delta = this.game.loop.delta / 1000;
        let moveX = 0;
        let moveY = 0;
        if (this.playerControls.up.isDown) moveY -= 1;
        if (this.playerControls.down.isDown) moveY += 1;
        if (this.playerControls.left.isDown) moveX -= 1;
        if (this.playerControls.right.isDown) moveX += 1;
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const norm = Math.sqrt(2) / 2;
            moveX *= norm;
            moveY *= norm;
        }

        // Accelerate towards input direction
        if (moveX !== 0 || moveY !== 0) {
            this.player.velocity.x += moveX * this.player.acceleration * delta;
            this.player.velocity.y += moveY * this.player.acceleration * delta;
            // Clamp velocity to max speed
            const speed = Math.sqrt(
                this.player.velocity.x ** 2 + this.player.velocity.y ** 2
            );
            if (speed > this.player.speed) {
                const scale = this.player.speed / speed;
                this.player.velocity.x *= scale;
                this.player.velocity.y *= scale;
            }
        } else {
            // Apply friction to slow down
            const vx = this.player.velocity.x;
            const vy = this.player.velocity.y;
            const v = Math.sqrt(vx * vx + vy * vy);
            if (v > 0) {
                const decel = this.player.friction * delta;
                const newV = Math.max(0, v - decel);
                if (newV === 0) {
                    this.player.velocity.x = 0;
                    this.player.velocity.y = 0;
                } else {
                    const scale = newV / v;
                    this.player.velocity.x *= scale;
                    this.player.velocity.y *= scale;
                }
            }
        }

        // Update position
        this.player.position.x += this.player.velocity.x * delta;
        this.player.position.y += this.player.velocity.y * delta;

        this.player.model!.setPosition(
            this.player.position.x,
            this.player.position.y
        );
    }
    pickEnemyType(chances: Record<string, number>): string {
        const entries = Object.entries(chances);
        const total = entries.reduce((sum, [, chance]) => sum + chance, 0);
        let r = Math.random() * total;
        for (const [key, chance] of entries) {
            if (r < chance) return key;
            r -= chance;
        }
        // fallback
        return entries[0][0];
    }
    getCurrentDifficulty() {
        // Calculate elapsed time since game start
        const elapsedMs = Date.now() - this.gameStartTime;
        // Convert to minutes
        const elapsedMin = elapsedMs / 60000;
        // HP multiplier increases with time, capped
        const hpMult = Math.min(
            1 + elapsedMin * this.difficultyConfig.hpIncreasePerMinute,
            this.difficultyConfig.maxHpMultiplier
        );
        // Damage multiplier increases with time, capped
        const dmgMult = Math.min(
            1 + elapsedMin * this.difficultyConfig.damageIncreasePerMinute,
            this.difficultyConfig.maxDamageMultiplier
        );
        // Return both multipliers
        return { hpMult, dmgMult };
    }
    getCurrentMaxEnemies() {
        // Calculate elapsed time since game start
        const elapsedMs = Date.now() - this.gameStartTime;
        // Convert to minutes
        const elapsedMin = elapsedMs / 10000;
        // Max enemies increases with time, capped
        const maxEnemies = Math.min(
            Math.floor(
                this.difficultyConfig.baseMaxEnemies +
                    elapsedMin *
                        this.difficultyConfig.maxEnemiesIncreasePerMinute
            ),
            this.difficultyConfig.maxEnemiesCap
        );
        // console.log({maxEnemies})
        return maxEnemies;
    }
    getCurrentSpawnInterval() {
        // Calculate elapsed time since game start
        const elapsedMs = Date.now() - this.gameStartTime;
        // Convert to minutes
        const elapsedMin = elapsedMs / 60000;
        // Spawn interval decreases with time, floored at minSpawnInterval
        const interval = Math.max(
            this.difficultyConfig.baseMaxEnemies * 1000 -
                elapsedMin *
                    this.difficultyConfig.spawnIntervalDecreasePerMinute,
            this.difficultyConfig.minSpawnInterval
        );
        return interval;
    }
    spawnEnemyAtRandomPosition() {
        // Update maxEnemies based on elapsed time
        this.maxEnemies = this.getCurrentMaxEnemies();
        // Only spawn if under maxEnemies
        if (this.enemies.length === this.maxEnemies) return;
        const now = Date.now();
        // Calculate current spawn interval
        const interval = this.getCurrentSpawnInterval();
        // Only spawn if enough time has passed
        if (now < this.spawnTimestamp) return;
        // Set next spawn time
        this.spawnTimestamp = now + interval;
        // Random position at edge of screen
        const edge = Phaser.Math.Between(0, 3);
        let x = 0,
            y = 0;
        if (edge === 0) {
            x = 0;
            y = Phaser.Math.Between(0, this.scale.height);
        } else if (edge === 1) {
            x = this.scale.width;
            y = Phaser.Math.Between(0, this.scale.height);
        } else if (edge === 2) {
            x = Phaser.Math.Between(0, this.scale.width);
            y = 0;
        } else {
            x = Phaser.Math.Between(0, this.scale.width);
            y = this.scale.height;
        }
        // Pick enemy type based on chances
        const enemyType = this.pickEnemyType(enemyChances);
        const EnemyClass =
            enemyClassMap[enemyType as keyof typeof enemyClassMap];
        // Get current difficulty multipliers
        const { hpMult, dmgMult } = this.getCurrentDifficulty();
        let hp = 1,
            damage = 1;
        // Scale HP and damage based on type and difficulty
        if (enemyType === "base") {
            hp = Math.round(this.difficultyConfig.baseEnemyHp * hpMult);
            damage = Math.round(
                this.difficultyConfig.baseEnemyDamage * dmgMult
            );
        } else if (enemyType === "big") {
            hp = Math.round(this.difficultyConfig.bigEnemyHp * hpMult);
            damage = Math.round(this.difficultyConfig.bigEnemyDamage * dmgMult);
        }
        // Pass scaled stats to enemy constructor
        const color = Phaser.Display.Color.RandomRGB().color;
        const enemy = new EnemyClass({ scene: this, x, y, hp, damage, color, });
        this.enemies.push(enemy);
    }

    /**
     * Moves all enemies toward the player's current position.
     * Handles visual feedback for hit effect.
     */
    moveEnemiesTowardPlayer() {
        const delta = this.game.loop.delta / 1000;
        for (const enemy of this.enemies) {
            enemy.updateHitFeedback(delta);
            enemy.moveToward(
                new Phaser.Math.Vector2(
                    this.player.position.x,
                    this.player.position.y
                ),
                delta
            );
        }
    }

    checkCollisionWithEnemies() {
        for (const enemy of this.enemies) {
            const enemyPosition = enemy.getBounds();
            const playerPosition = this.player.model!.getBounds();
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    playerPosition,
                    enemyPosition
                )
            ) {
                // Only take damage if not invulnerable
                const now = Date.now();
                if (now >= this.player.invulnerableUntil) {
                    this.player.hp -= 1;
                    this.player.invulnerableUntil = now + 1000; // 1 second invulnerability
                    this.player.model!.setFillStyle(
                        this.player.colors.highlight
                    );
                    console.log("Player hit! HP:", this.player.hp);
                }
                // Handle collision logic here, e.g., reset player position or reduce health
                return;
            } else {
                // Only reset color if not invulnerable
                if (Date.now() >= this.player.invulnerableUntil) {
                    this.player.model!.setFillStyle(this.player.colors.default);
                }
            }
        }
    }

    onPlayerHit(enemy: BaseEnemy) {
        this.player.model!.setFillStyle(this.player.colors.highlight); // Highlight player on hit
        // Handle player hit logic, e.g., reduce health, play sound, etc.
        this.player.hp -= enemy.hp; // Example: reduce player HP by enemy's HP
        console.log("Player hit! Remaining HP:", this.player.hp);
        if (this.player.hp <= 0) {
            console.log("Game Over!");
            // Handle game over logic here, e.g., restart game or show game over screen
        }
    }

    /**
     * Fires all projectiles from the player towards the closest enemy.
     * Calls individual fire methods for each projectile type.
     */
    fireProjectileHandler() {
        const now = Date.now();
        if (this.enemies.length === 0) return;
        let closestEnemy = this.enemies[0];
        let minDistSq = Number.POSITIVE_INFINITY;
        const px = this.player.position.x;
        const py = this.player.position.y;
        for (const enemy of this.enemies) {
            const ex = enemy.rect.x;
            const ey = enemy.rect.y;
            const distSq = (ex - px) * (ex - px) + (ey - py) * (ey - py);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closestEnemy = enemy;
            }
        }
        const dx = closestEnemy.rect.x - px;
        const dy = closestEnemy.rect.y - py;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;
        const dirX = dx / len;
        const dirY = dy / len;
        if (this.user.upgrades.rockets.enabled) {
            this.fireRocketProjectiles(now, px, py, closestEnemy);
        }
        this.fireBasicProjectile(now, px, py, dirX, dirY);
    }

    /**
     * Fires a volley of rocket projectiles with delay and margin between spawns.
     */
    fireRocketProjectiles(
        now: number,
        px: number,
        py: number,
        closestEnemy: BaseEnemy
    ) {
        const rocket_properties = this.user.upgrades.rockets;
        if (!this.player.model) {
            return;
        }
        if (
            now >
            this.projectileLastFire.rockets + this.projectileFireRates.rockets
        ) {
            this.projectileLastFire.rockets = now;
            const rocketSpawns: { x: number; y: number }[] = [];
            for (
                let i = 0;
                i < Number(rocket_properties.projectile_amount ?? 0);
                i++
            ) {
                let spawnX: number,
                    spawnY: number,
                    attempts = 0,
                    valid = false;
                while (!valid && attempts < 20) {
                    const spawn = this.getRandomProjectileSpawn(
                        px,
                        py,
                        this.player.model.width / 1.5,
                        this.player.model.height / 1.5
                    );
                    spawnX = spawn.spawnX;
                    spawnY = spawn.spawnY;
                    valid = true;
                    for (const prev of rocketSpawns) {
                        const dist = Math.sqrt(
                            (spawnX - prev.x) ** 2 + (spawnY - prev.y) ** 2
                        );
                        const margin = Number(
                            rocket_properties.projectile_margin ?? 0
                        );
                        if (!isNaN(margin) && dist < margin) {
                            valid = false;
                            break;
                        }
                    }
                    attempts++;
                }
                rocketSpawns.push({ x: spawnX!, y: spawnY! });
                setTimeout(() => {
                    this.playerProjectiles.push({
                        type: "rocket",
                        instance: new RocketProjectile({
                            scene: this,
                            x: spawnX!,
                            y: spawnY!,
                            targetX: closestEnemy.rect.x,
                            targetY: closestEnemy.rect.y,
                            arcHeight: 250,
                            speed: rocket_properties.projectile_speed as number,
                        }),
                    });
                }, i * Number(rocket_properties.rocket_delay ?? 0));
            }
        }
    }

    /**
     * Fires a basic projectile instantly.
     */
    fireBasicProjectile(
        now: number,
        px: number,
        py: number,
        dirX: number,
        dirY: number
    ) {
        const basic_laser_properties = this.user.upgrades.basic_laser;
        if (
            now >
            this.projectileLastFire.basic_laser + this.projectileFireRates.basic_laser
        ) {
            this.projectileLastFire.basic_laser = now;
            this.playerProjectiles.push({
                type: "basic",
                instance: new BaseProjectile({
                    scene: this,
                    x: px,
                    y: py,
                    dirX,
                    dirY,
                    speed: basic_laser_properties.projectile_speed as number,
                    color: 0xffffff,
                    width: basic_laser_properties.projectile_width as number,
                    height: basic_laser_properties.projectile_height as number,
                }),
            });
        }
    }
    getRandomProjectileSpawn(
        playerX: number,
        playerY: number,
        playerWidth: number,
        playerHeight: number,
        offset: number = 20
    ) {
        // Randomize spawn side: 0=top, 1=bottom, 2=left, 3=right
        const side = Phaser.Math.Between(0, 3);
        let spawnX = playerX,
            spawnY = playerY;

        if (side === 0) {
            // top
            spawnX =
                playerX +
                Phaser.Math.Between(-playerWidth / 2, playerWidth / 2);
            spawnY = playerY - playerHeight / 2 - offset;
        } else if (side === 1) {
            // bottom
            spawnX =
                playerX +
                Phaser.Math.Between(-playerWidth / 2, playerWidth / 2);
            spawnY = playerY + playerHeight / 2 + offset;
        } else if (side === 2) {
            // left
            spawnX = playerX - playerWidth / 2 - offset;
            spawnY =
                playerY +
                Phaser.Math.Between(-playerHeight / 2, playerHeight / 2);
        } else {
            // right
            spawnX = playerX + playerWidth / 2 + offset;
            spawnY =
                playerY +
                Phaser.Math.Between(-playerHeight / 2, playerHeight / 2);
        }
        return { spawnX, spawnY };
    }
    /**
     * Moves all projectiles using their stored direction (dirX, dirY).
     * Removes projectiles if they go out of bounds or hit an enemy.
     * Applies damage to enemies and visual feedback.
     */
    moveProjectiles() {
        const delta = this.game.loop.delta / 1000;
        for (const projectileObj of [...this.playerProjectiles]) {
            const { type, instance: projectile } = projectileObj;
            projectile.move(delta);
            // Remove if out of bounds
            if (
                projectile.rect.x < 0 ||
                projectile.rect.x > this.cameras.main.width ||
                projectile.rect.y < 0 ||
                projectile.rect.y > this.cameras.main.height
            ) {
                projectile.destroy();
                this.playerProjectiles = this.playerProjectiles.filter(
                    (p) => p !== projectileObj
                );
                continue;
            }
            // Check collision with enemies
            for (const enemy of this.enemies) {
                const enemyPosition = enemy.getBounds();
                const projectilePosition = projectile.getBounds();
                if (
                    Phaser.Geom.Intersects.RectangleToRectangle(
                        projectilePosition,
                        enemyPosition
                    )
                ) {
                    // Collision detected: apply damage based on projectile type
                    enemy.takeDamage(
                        this.projectileDamage[
                            type as keyof typeof this.projectileDamage
                        ] ?? this.player.damage
                    );
                    // Remove projectile
                    projectile.destroy();
                    this.playerProjectiles = this.playerProjectiles.filter(
                        (p) => p !== projectileObj
                    );
                    // Remove enemy if HP <= 0
                    if (enemy.hp <= 0) {
                        this.enemies = this.enemies.filter((e) => e !== enemy);
                        this.onEnemyHit(enemy);
                        console.log("Enemy killed!");
                    } else {
                    }
                    break;
                }
            }
        }
    }
    /**
     * Handles logic when an enemy is killed by the player.
     * - Awards experience to the player based on the enemy's exp value.
     * - Handles player leveling up, including multiple level-ups if enough exp is gained.
     * - Caps the player's level and experience at the maximum defined in PLAYER_LEVELS.
     * - Updates the Zustand user store with new experience, level, and next level experience requirements.
     *
     * @param enemy The enemy instance that was killed.
     */
    onEnemyHit(enemy: BaseEnemy) {
        // Get exp value for this enemy type (default to 1 if not set)
        const exp = (enemy as any).exp ?? 1;

        // Get current user state from Zustand
        const user = useUserStore.getState();
        let newExp = (user.experience + exp) 
        const hasNextLevel = PLAYER_LEVELS[user.level + 1];
        if (newExp >= user.next_level_experience && hasNextLevel) {
            EventBus.emit(EVENTS.USER_LEVEL_UP);
        } else {
            // Update user state with new experience
            useUserStore.setState({
                ...user,
                experience: newExp,
            });
        }
    }
    // Add cleanup for the subscription
    destroy() {
        if (this.unsubscribeUserStore) {
            this.unsubscribeUserStore();
        }
        // super.destroy();
    }
}
