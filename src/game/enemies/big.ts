import Phaser from "phaser";

export interface EnemyConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    speed?: number;
    hp?: number;
    color?: number;
    size?: number;
    damage?: number;
    experience?: number;
    onDestroy?: () => void;
}

export class BigEnemy {
    scene: Phaser.Scene;
    rect: Phaser.GameObjects.Rectangle;
    speed: number;
    hp: number;
    hitTimer: number = 0;
    color: number;
    size: number;
    damage = 3;
    exp = 3;
    onDestroy = () => {};
    constructor(config: EnemyConfig) {
        this.scene = config.scene;
        this.speed = config.speed ?? 40;
        this.hp = config.hp ?? 10;
        this.color = config.color ?? 0xff69b4; // pink
        this.size = config.size ?? 35;
        this.onDestroy = config.onDestroy ?? (() => {});
        this.rect = this.scene.add.rectangle(
            config.x,
            config.y,
            this.size,
            this.size,
            this.color
        );
    }

    moveToward(target: Phaser.Math.Vector2, delta: number) {
        const dx = target.x - this.rect.x;
        const dy = target.y - this.rect.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const dirX = dx / dist;
            const dirY = dy / dist;
            this.rect.x += dirX * this.speed * delta;
            this.rect.y += dirY * this.speed * delta;
        }
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        this.hitTimer = 0.1;
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    updateHitFeedback(delta: number) {
        if (this.hitTimer > 0) {
            this.hitTimer -= delta;
            this.rect.setFillStyle(0xffff33); // flash yellow
            if (this.hitTimer <= 0) {
                this.rect.setFillStyle(this.color); // back to original color
                this.hitTimer = 0;
            }
        }
    }

    destroy() {
        this.rect.destroy();
        if (this.onDestroy) {
            this.onDestroy();
        }
    }

    getBounds() {
        return this.rect.getBounds();
    }
}
