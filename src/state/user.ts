import { create } from "zustand";
import { UPGRADES } from "../upgrades";
export const PLAYER_LEVELS: {
    [level: number]: {
        next_level_experience: number;
    };
} = {
    1: {
        next_level_experience: 20,
    },
    2: {
        next_level_experience: 50,
    },
    3: {
        next_level_experience: 100,
    },
    4: {
        next_level_experience: 200,
    },
    5: {
        next_level_experience: 350,
    },
};

interface Upgrade {
    key: string;
    level: number;
    max_level: number;
    enabled: boolean;
    [prop: string]: string | number | boolean | undefined;
}

export interface UserState {
    health: number;
    damage: number;
    movement_speed: number;
    experience: number;
    level: number;
    next_level_experience: number;

    setUser: (state: UserState) => void;
    upgrades: {
        [key: string]: Upgrade;
    };
}

export const useUserStore = create<UserState>((set) => ({
    health: 10,
    damage: 5,
    movement_speed: 159,
    level: 1,
    experience: 0, // exp resets to 0 on level up
    next_level_experience: PLAYER_LEVELS[1].next_level_experience,

    setUser: (state: UserState) => set(state),
    upgrades: {
        movement_speed: {
            key: "movement_speed",
            max_level: Object.keys(UPGRADES.movement_speed).length,
            enabled: false,
            level: 0,
            movement_speed: 150,
        },
        rockets: {
            key: "rockets",
            max_level: Object.keys(UPGRADES.rockets).length,
            enabled: false,
            level: 0,
            projectile_amount: 1,
            attack_speed: 2000, // ms per shot
            projectile_speed: 500,
            damage: 5,
            speed_multiplier: 1.0,
            projectile_margin: 10,
            projectile_delay: 100,
            rocket_margin: 40,
            rocket_delay: 80,
        },
        basic_laser: {
            key: "basic_laser",
            max_level: Object.keys(UPGRADES.basic_laser).length,
            enabled: true,
            level: 0,
            projectile_amount: 1,
            attack_speed: 1000, // seconds per shot
            projectile_speed: 1000,
            damage: 5,
            speed_multiplier: 1.0,
            projectile_width: 10,
            projectile_height: 10,
            projectile_margin: 10,
            projectile_delay: 100,
        },
    },
}));
