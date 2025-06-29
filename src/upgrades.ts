export interface SingleUpgrade {
    level: number;
    title: string;
    description: string;
    user_keys_upgrade: any;
    key: string;
}

export const UPGRADES: {
    [key: string]: {
        [level: number]: SingleUpgrade;
    };
} = {
    rockets: {
        1: {
            key: "rockets",
            level: 1,
            title: "Rocket Intern",
            description:
                "You’ve just learned which end goes boom. You can now launch a single rocket!",
            user_keys_upgrade: {
                level: 1,
                enabled: true,
                projectile_amount: 1,
                projectile_speed: 600,
                attack_speed: 2000, // seconds per shot (example: 2.0s)
                rocket_margin: 40,
                rocket_delay: 80,
            },
        },
        2: {
            key: "rockets",
            level: 2,
            title: "Rocket Enthusiast",
            description:
                "You’re getting the hang of this! Now you can juggle two rockets at once.",
            user_keys_upgrade: {
                level: 2,
                enabled: true,
                projectile_amount: 2,
                projectile_speed: 600,
                attack_speed: 2000, // seconds per shot (example: 2.0s)
                rocket_margin: 40,
                rocket_delay: 100,
            },
        },
        3: {
            key: "rockets",
            level: 3,
            title: "Rocket Specialist",
            description:
                "Your expertise lets you coordinate a trio of rockets. The explosions multiply!",
            user_keys_upgrade: {
                level: 3,
                enabled: true,
                projectile_amount: 3,
                projectile_speed: 600,
                attack_speed: 2000, // seconds per shot (example: 2.0s)
                rocket_margin: 40,
                rocket_delay: 120,
            },
        },
        4: {
            key: "rockets",
            level: 4,
            title: "Rocket Renegade",
            description:
                "You break all safety protocols and unleash a quartet of rockets. Chaos reigns.",
            user_keys_upgrade: {
                level: 4,
                enabled: true,
                projectile_amount: 4,
                projectile_speed: 600,
                attack_speed: 2000, // seconds per shot (example: 2.0s)
                rocket_margin: 40,
                rocket_delay: 130,
            },
        },
        5: {
            key: "rockets",
            level: 5,
            title: "ROCKET APOCALYPSE",
            description:
                "THE CHAOS SETS IN. THE ROCKETS WILL FALL. NOTHING IS SAFE. EVERYTHING EXPLODES!",
            user_keys_upgrade: {
                level: 5,
                enabled: true,
                projectile_amount: 5,
                projectile_speed: 900,
                attack_speed: 2000, // seconds per shot (example: 2.0s)
                rocket_margin: 40,
                rocket_delay: 140,
            },
        },
    },
    basic_laser: {
        1: {
            key: "basic_laser",
            level: 1,
            title: "Laser Pointer",
            description:
                "You found a basic laser pointer. It shoots... eventually.",
            user_keys_upgrade: {
                level: 1,
                attack_speed: 900, // seconds per shot (example: 1.0s)
                projectile_width: 10,
                projectile_height: 11,
            },
        },
        2: {
            key: "basic_laser",
            level: 2,
            title: "Laser Hobbyist",
            description: "You tinker with the laser and it fires a bit faster.",
            user_keys_upgrade: {
                attack_speed: 800,
                level: 2,
                projectile_width: 15,
                projectile_height: 12,
            },
        },
        3: {
            key: "basic_laser",
            level: 3,
            title: "Laser Technician",
            description:
                "Your technical prowess increases the laser's firing rate.",
            user_keys_upgrade: {
                level: 3,
                attack_speed: 600,
                projectile_width: 20,
                projectile_height: 13,
            },
        },
        4: {
            key: "basic_laser",
            level: 4,
            title: "Laser Surgeon",
            description:
                "Your precision allows for rapid laser shots. Enemies beware!",
            user_keys_upgrade: {
                level: 4,
                attack_speed: 400,
                projectile_width: 25,
                projectile_height: 14,
            },
        },
        5: {
            key: "basic_laser",
            level: 5,
            title: "LASER MACHINE",
            description:
                "YOU ARE THE LASER. THE AIR IS FILLED WITH BLINDING LIGHT. NOTHING CAN ESCAPE.",
            user_keys_upgrade: {
                level: 5,
                attack_speed: 200,
                projectile_width: 35,
                projectile_height: 16,
            },
        },
    },
    movement_speed: {
        1: {
            key: "movement_speed",
            level: 1,
            title: "Speed Walker",
            description:
                "You’ve learned to walk faster. Enemies will have a harder time catching you.",
            user_keys_upgrade: {
                level: 1,
                movement_speed: 250,
            },
        },
        2: {
            key: "movement_speed",
            level: 2,
            title: "Jogger",
            description:
                "You can now jog away from danger. Your speed increases further.",
            user_keys_upgrade: {
                level: 2,
                movement_speed: 350,
            },
        },
        3: {
            key: "movement_speed",
            level: 3,
            title: "Runner",
            description:
                "You can run circles around your enemies. Your speed is now formidable.",
            user_keys_upgrade: {
                level: 3,
                movement_speed: 500,
            },
        },
        4: {
            key: "movement_speed",
            level: 4,
            title: "Sprinter",
            description:
                "You can sprint away from danger. Your speed is now exceptional.",
            user_keys_upgrade: {
                level: 4,
                movement_speed: 600,
            },
        },
        5: {
            key: "movement_speed",
            level: 5,
            title: "LIGHTNING BOLT",
            description:
                "YOU ARE THE STORM. NOTHING CAN CATCH YOU. YOU ARE UNSTOPPABLE.",
            user_keys_upgrade: {
                level: 5,
                movement_speed: 700,
            },
        },
    },
};

/* 
UNUSED
    projectile_speed_multiplier: {
        1: {
            key: "projectile_speed_multiplier",
            level: 1,
            title: "Speedy Shooter",
            description:
                "Your projectiles now travel faster. Enemies will have a harder time dodging them.",
            user_keys_upgrade: {
                level: 1,
                speed_multiplier: 1.2,
            },
        },
        2: {
            key: "projectile_speed_multiplier",
            level: 2,
            title: "Rapid Fire",
            description:
                "Your projectiles travel even faster. Enemies will struggle to avoid them.",
            user_keys_upgrade: {
                level: 2,
                speed_multiplier: 1.5,
            },
        },
        3: {
            key: "projectile_speed_multiplier",
            level: 3,
            title: "Blazing Speed",
            description:
                "Your projectiles are now blazing fast. Enemies will find it nearly impossible to dodge them.",
            user_keys_upgrade: {
                level: 3,
                speed_multiplier: 2.0,
            },
        },
        4: {
            key: "projectile_speed_multiplier",
            level: 4,
            title: "Lightning Projectiles",
            description:
                "Your projectiles move at lightning speed. Enemies stand no chance.",
            user_keys_upgrade: {
                level: 4,
                speed_multiplier: 3.0,
            },
        },
        5: {
            key: "projectile_speed_multiplier",
            level: 5,
            title: "PROJECTILE APOCALYPSE",
            description:
                "YOUR PROJECTILES ARE UNSTOPPABLE. NOTHING CAN ESCAPE THEIR WRATH.",
            user_keys_upgrade: {
                level: 5,
                speed_multiplier: 5.0,
            },
        },
    },

*/
