import Phaser from "phaser";

export interface ProjectileConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    dirX: number;
    dirY: number;
    speed?: number;
    color?: number;
    size?: number;
}

export class BaseProjectile {
    scene: Phaser.Scene;
    rect: Phaser.GameObjects.Rectangle;
    dirX: number;
    dirY: number;
    speed: number;
    color: number;
    size: number;
    private debug: boolean = false;
    private debugLine?: Phaser.GameObjects.Graphics;

    constructor(config: ProjectileConfig) {
        this.scene = config.scene;
        this.dirX = config.dirX;
        this.dirY = config.dirY;
        this.speed = config.speed ?? 600;
        this.color = config.color ?? 0xffffff;
        this.size = config.size ?? 10;
        this.rect = this.scene.add.rectangle(
            config.x,
            config.y,
            this.size,
            this.size,
            this.color
        );
        this.playStartSound();
        if (this.debug) {
            this.drawDebugLine(config.x, config.y, this.dirX, this.dirY);
        }
    }

    private drawDebugLine(x: number, y: number, dirX: number, dirY: number) {
        this.debugLine = this.scene.add.graphics();
        this.debugLine.lineStyle(2, 0xff0000, 1);
        const length = 1000; // arbitrary long line for debug
        this.debugLine.beginPath();
        this.debugLine.moveTo(x, y);
        this.debugLine.lineTo(x + dirX * length, y + dirY * length);
        this.debugLine.strokePath();
    }

    move(delta: number) {
        this.rect.x += this.dirX * this.speed * delta;
        this.rect.y += this.dirY * this.speed * delta;
    }
    playStartSound() {
        const key = `basic_fire_${Math.floor(Math.random() * 3) + 1}`;
        this.scene.sound.play(key, {
            volume: 0.3,
        });
    }
    getBounds() {
        return this.rect.getBounds();
    }

    destroy() {
        this.rect.destroy();
        if (this.debugLine) {
            this.debugLine.destroy();
        }
    }
}
