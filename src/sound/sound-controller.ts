// SoundController for PhaserJS
// Usage: SoundController.init(scene); SoundController.play('soundKey');

export class SoundController {
    static scene: Phaser.Scene | null = null;

    static init(scene: Phaser.Scene) {
        SoundController.scene = scene;
    }

    static play(key: string, config?: Phaser.Types.Sound.SoundConfig) {
        if (!SoundController.scene) return;
        if (SoundController.scene.sound.get(key)) {
            SoundController.scene.sound.play(key, config);
        }
    }

    static stop(key: string) {
        if (!SoundController.scene) return;
        const sound = SoundController.scene.sound.get(key);
        if (sound) sound.stop();
    }

    static isPlaying(key: string): boolean {
        if (!SoundController.scene) return false;
        const sound = SoundController.scene.sound.get(key);
        return !!(sound && sound.isPlaying);
    }
}
