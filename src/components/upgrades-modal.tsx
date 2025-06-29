import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useUserStore } from "../state/user";
import { IRefPhaserGame } from "../PhaserGame";
import { EVENTS } from "../events/events";
import { EventBus } from "../game/EventBus";
import { SingleUpgrade, UPGRADES } from "../upgrades";

export const UpgradesModal: React.FC<{
    phaser: React.RefObject<IRefPhaserGame | null>;
}> = ({ phaser }) => {
    let [isOpen, setIsOpen] = useState(false);
    const [upgrades, setUpgrades] = useState<SingleUpgrade[]>([]); // Define the type of upgrades as needed
    const user = useUserStore();
    // Define the type for upgrade keys based on UPGRADES object keys
    type UpgradeKey = keyof typeof UPGRADES;

    useEffect(() => {}, [user]);

    useEffect(() => {
        EventBus.on(EVENTS.USER_LEVEL_UP, () => {
            const maxLevelUpgrades = Object.entries(UPGRADES).reduce(
                (acc, [key, value]) => {
                    acc[key as UpgradeKey] = Object.keys(value).length;

                    return acc;
                },
                {} as Record<UpgradeKey, number>
            );

            const availableUpgradeCategories = Object.entries(UPGRADES)
                .filter(
                    ([key]) =>
                        key in user.upgrades &&
                        (user.upgrades as Record<string, any>)[key].level <
                            maxLevelUpgrades[key as UpgradeKey]
                )
                .map(([key, value]) => ({
                    key,
                    upgrade: value,
                }))
                .reduce((accumulator, current) => {
                    const isUpgradeMaxLevel =
                        user.upgrades[current.key].level >=
                        maxLevelUpgrades[current.key];
                    const nextLevelUpgade =
                        UPGRADES[current.key][
                            user.upgrades[current.key].level + 1
                        ];

                    if (!isUpgradeMaxLevel) {
                        accumulator.push(nextLevelUpgade);
                    }
                    return accumulator;
                }, [] as SingleUpgrade[]);

            const randomUpgrades = [] as SingleUpgrade[];

            for (const _ of availableUpgradeCategories) {
                if (
                    availableUpgradeCategories.length === 0 ||
                    randomUpgrades.length === 2
                ) {
                    break;
                }
                const randomIndex = Math.floor(
                    Math.random() * availableUpgradeCategories.length
                );
                randomUpgrades.push(availableUpgradeCategories[randomIndex]);
                availableUpgradeCategories.splice(randomIndex, 1);
            }
            if (randomUpgrades.length === 0) {
                console.warn("No available upgrades found");
                return;
            }
            setUpgrades(randomUpgrades);
            setIsOpen(true);

            EventBus.emit(EVENTS.GAME_PAUSE);
        });
    }, []);

    function onUpgradeSelect(selectedUpgrade: SingleUpgrade) {
        const updatedUser = user;
        Object.entries(selectedUpgrade.user_keys_upgrade).forEach(
            ([key, value]) => {
                if (key in updatedUser.upgrades[selectedUpgrade.key]) {
                    updatedUser.upgrades[selectedUpgrade.key][key] =
                        value as any;
                }
            }
        );
        user.setUser(updatedUser);
        EventBus.emit(EVENTS.USER_UPDATE, updatedUser);
        onCloseModalHandler();
    }

    function onCloseModalHandler() {
        setIsOpen(false);
        EventBus.emit(EVENTS.GAME_RESUME);
    }
    const UpgradeCard: React.FC<{ upgrade: SingleUpgrade }> = ({ upgrade }) => {
        return (
            <div className="flex min-h-[400px] w-[340px] flex-col rounded-sm bg-gradient-to-b from-black from-25% to-orange-200 py-5 px-8 text-center text-white">
                <h1>{upgrade.title}</h1>
                <p className="my-auto">{upgrade.description}</p>
                <button
                    onClick={() => {
                        onUpgradeSelect(upgrade);
                        onCloseModalHandler();
                    }}
                    className=" mb-5 px-3 py-1 text-sm bg-blue-400 text-white rounded hover:bg-blue-500"
                >
                    SELECT
                </button>
                {/* <div className="mt-auto mb-5">
                    <p>Damage 24</p>
                    <p>Rockets 1 {">"} 2</p>
                    <p>Cooldown 3s</p>
                </div> */}
            </div>
        );
    };
    return (
        <Dialog
            open={isOpen}
            onClose={onCloseModalHandler}
            className="relative z-50"
        >
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-gray-900/50 ">
                <DialogPanel className="p-12">
                    <div className="flex flex-row gap-10">
                        {upgrades.map((upgrade) => (
                            <UpgradeCard
                                key={upgrade.title}
                                upgrade={upgrade}
                            />
                        ))}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};
