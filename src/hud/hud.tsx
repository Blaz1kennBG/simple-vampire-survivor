import { useUserStore } from "../state/user";
import { IRefPhaserGame } from "../PhaserGame";
import React, { useEffect, useState } from "react";

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

    return (
        <div className="flex gap-3 items-center bg-black text-white p-2 w-screen absolute bottom-0 left-0">
            <span>❤ {user.health}</span>
            <span>⚔ {user.damage}</span>
            <span>🥾 {user.movement_speed}</span>
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
        </div>
    );
};
