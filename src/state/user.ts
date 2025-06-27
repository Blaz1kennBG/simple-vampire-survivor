import { create } from "zustand";
export const PLAYER_LEVELS: {
    [level: number]: {
        next_level_experience: number;
    };
} = {
    1: {
        next_level_experience: 100,
    },
    2: {
        next_level_experience: 200,
    },
    3: {
        next_level_experience: 300,
    },
    4: {
        next_level_experience: 400,
    },
    5: {
        next_level_experience: 500,
    },
};

export interface UserState {
    health: number;
    damage: number;
    movement_speed: number;
    experience: number;
    level: number;
    next_level_experience: number;
    setUser: (state: UserState) => void;
}

export const useUserStore = create<UserState>((set) => ({
    health: 10,
    damage: 1,
    movement_speed: 200,
    level: 1,
    experience: 0, // exp resets to 0 on level up
    next_level_experience: PLAYER_LEVELS[1].next_level_experience,
    setUser: (state: UserState) => set(state),
}));
