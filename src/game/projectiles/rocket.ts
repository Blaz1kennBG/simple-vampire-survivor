export interface ProjectileConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    arcHeight?: number;
    speed?: number;
    color?: number;
    width?: number;
    height?: number;
}
export class RocketProjectile {
    scene: Phaser.Scene;
    rect: Phaser.GameObjects.Rectangle;
    start: Phaser.Math.Vector2;
    control: Phaser.Math.Vector2;
    end: Phaser.Math.Vector2;
    t: number = 0;
    speed: number;
    color: number;
    width: number;
    height: number;
    arcing: boolean = true;
    straightDir: Phaser.Math.Vector2;
    prevArcPos: Phaser.Math.Vector2 | null = null;
    minArcTime: number = 0.8; // seconds, minimum arc duration
    arcElapsed: number = 0;
    private debug: boolean = false;
    private debugLine?: Phaser.GameObjects.Graphics;

    constructor(config: ProjectileConfig) {
        this.scene = config.scene;
        this.speed = config.speed ?? 600;
        this.color = config.color ?? 0xffffff;

        this.width = config.width ?? 30;
        this.height = config.height ?? 10;

        this.start = new Phaser.Math.Vector2(config.x, config.y);
        this.end = new Phaser.Math.Vector2(config.targetX, config.targetY);

        // Control point: behind the player (opposite direction of target), offset by arcHeight
        const toTarget = this.end.clone().subtract(this.start).normalize();
        const perp = new Phaser.Math.Vector2(-toTarget.y, toTarget.x); // Perpendicular for arc
        const arcHeight = config.arcHeight ?? 80;
        const control = this.start
            .clone()
            .subtract(toTarget.clone().scale(arcHeight * 0.5))
            .add(perp.clone().scale(arcHeight));
        this.control = control;

        this.rect = this.scene.add.rectangle(
            this.start.x,
            this.start.y,
            config.width ?? this.width,
            config.height ?? this.height,
            this.color
        );
        this.playStartSound();
        // Calculate straight direction for after arc
        this.straightDir = new Phaser.Math.Vector2(0, 0);

        
        if (this.debug) {
            this.drawDebugLine();
        }
    }
    playStartSound() {
        this.scene.sound.play("rocket_fire", {
            volume: 0.1,
        });
    }
    move(delta: number) {
        if (this.arcing) {
            this.arcElapsed += delta;
            // Calculate arc duration: max of minArcTime or normal speed/distance
            const arcTime = Math.max(
                this.minArcTime,
                Phaser.Math.Distance.BetweenPoints(this.start, this.end) /
                    this.speed
            );
            this.t = Math.min(1, this.arcElapsed / arcTime);
            if (this.t >= 1) {
                this.t = 1;
                this.arcing = false;
                // Set position to end of arc
                this.rect.x = this.end.x;
                this.rect.y = this.end.y;
                // Calculate straight direction and speed from last arc segment
                if (this.prevArcPos) {
                    const dir = new Phaser.Math.Vector2(
                        this.end.x - this.prevArcPos.x,
                        this.end.y - this.prevArcPos.y
                    );
                    this.straightDir = dir.clone().normalize();
                    // Set speed to match last arc segment's speed
                    this.speed = dir.length() / delta;
                }
            } else {
                // Quadratic Bézier interpolation
                const x = Phaser.Math.Interpolation.QuadraticBezier(
                    this.t,
                    this.start.x,
                    this.control.x,
                    this.end.x
                );
                const y = Phaser.Math.Interpolation.QuadraticBezier(
                    this.t,
                    this.start.y,
                    this.control.y,
                    this.end.y
                );
                // Store previous arc position for speed calculation
                this.prevArcPos = new Phaser.Math.Vector2(
                    this.rect.x,
                    this.rect.y
                );
                this.rect.x = x;
                this.rect.y = y;
                // Rotate to face the direction of movement (arc tangent)
                const dx = x - this.prevArcPos.x;
                const dy = y - this.prevArcPos.y;
                if (dx !== 0 || dy !== 0) {
                    this.rect.rotation = Math.atan2(dy, dx);
                }
            }
        } else {
            // Move straight in the direction after arc, with the same speed as last arc segment
            this.rect.x += this.straightDir.x * this.speed * delta;
            this.rect.y += this.straightDir.y * this.speed * delta;
            // Rotate to face the straight direction
            this.rect.rotation = Math.atan2(
                this.straightDir.y,
                this.straightDir.x
            );
        }
    }

    private drawDebugLine() {
        this.debugLine = this.scene.add.graphics();
        this.debugLine.lineStyle(2, 0xff0000, 1);
        // Use Phaser.Curves.QuadraticBezier to get points along the curve
        const curve = new Phaser.Curves.QuadraticBezier(
            this.start,
            this.control,
            this.end
        );
        const points = curve.getPoints(32); // 32 segments for smoothness
        this.debugLine.beginPath();
        this.debugLine.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.debugLine.lineTo(points[i].x, points[i].y);
        }
        this.debugLine.closePath();
        this.debugLine.strokePath();
    }

    getBounds() {
        return this.rect.getBounds();
    }

    destroy() {
        this.rect.destroy();
        if (this.debugLine) {
            this.debugLine.destroy();
        }
        this.scene.sound.play("rocket_explode", {
            volume: 0.2,
        });
    }
}
