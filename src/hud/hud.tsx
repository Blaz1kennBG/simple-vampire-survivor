import { PLAYER_LEVELS, useUserStore } from "../state/user";
import { IRefPhaserGame } from "../PhaserGame";
import React, { useEffect, useState } from "react";
import { EventBus } from "../game/EventBus";
import { EVENTS } from "../events/events";

interface HudProps {
    phaser: React.RefObject<IRefPhaserGame | null>;
}

export const Hud: React.FC<HudProps> = ({ phaser }) => {
    // You can use phaser.current?.game or phaser.current?.scene here if needed
    const user = useUserStore();
    const [levelProgress, setLevelProgress] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Calculate level progress as a percentage
        const progress = user.experience / user.next_level_experience;

        setLevelProgress(progress);
    }, [user]);
    useEffect(() => {
        EventBus.on(EVENTS.USER_LEVEL_UP, () => {
            const user = useUserStore.getState();
            const nextLevel = PLAYER_LEVELS[user.level + 1];
            if (nextLevel) {
                user.setUser({
                    ...user,
                    level: user.level + 1,
                    experience: 0, // Reset experience on level up
                    next_level_experience: nextLevel.next_level_experience, // Update next level experience
                });
            } else {
                console.warn("No next level found for level:", user.level + 1);
            }
        });
    }, []);
    return (
        <div className="flex gap-3 items-center bg-black text-white p-2 w-screen absolute bottom-0 left-0">
            <span>❤ {user.health}</span>
            <span>⚔ {user.damage}</span>
            <span>🥾 {user.movement_speed}</span>
            <span>
                🏅
                {user.level}
            </span>
            <div className="flex flex-col mb-2">
                <div className="flex flex-row w-full justify-between items-center">
                    <span>{user.experience}</span>
                    <span>{user.next_level_experience}</span>
                </div>
                <div className="level-progress w-[300px]">
                    <div
                        className="bg-gray-300 h-2 rounded-full overflow-hidden"
                        style={{ width: "100%" }}
                    >
                        <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${levelProgress * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <button
                className="px-3 py-1 text-sm bg-blue-400 text-white rounded hover:bg-blue-500"
                onClick={() => {
                    const game = phaser.current?.game;
                    if (!game) return;

                    // Emit level up event
                    EventBus.emit(EVENTS.USER_LEVEL_UP);

                    // Update user state
                    user.setUser({
                        ...user,
                        level: user.level + 1,
                        experience: 0, // Reset experience on level up
                        next_level_experience: user.next_level_experience + 20, // Example increment
                    });
                }}
            >
                Level up
            </button>

            <button
                className="px-3 py-1 text-sm bg-blue-400 text-white rounded hover:bg-blue-500"
                onClick={() => {
                    const game = phaser.current?.game;
                    if (!game) return;
                    console.log("Pausing game");
                    EventBus.emit(EVENTS.GAME_PAUSE);
                }}
            >
                Pause
            </button>
            <button
                className="px-3 py-1 text-sm bg-blue-400 text-white rounded hover:bg-blue-500"
                onClick={() => {
                    const game = phaser.current?.game;
                    if (!game) return;

                    EventBus.emit(EVENTS.GAME_RESUME);
                }}
            >
                Resume
            </button>
        </div>
    );
};
