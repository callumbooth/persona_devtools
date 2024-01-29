import { add, isFuture } from "date-fns";

export const isBrowser = () => typeof window !== "undefined";

export interface SeedKeyConfig {
	expiry: string;
	value: number;
	previousKey: string | null;
}

export const findOrCreateSeedKey = (fixedKey?: number): number => {
	if (fixedKey) {
		return fixedKey;
	}

	let seedKey: number;

	if (process.env.NODE_ENV === "test") {
		seedKey = Math.random();
	} else if (isBrowser()) {
		const seedDataStr = window.sessionStorage.getItem("seed-key");
		const seedData = seedDataStr
			? (JSON.parse(seedDataStr) as SeedKeyConfig)
			: undefined;

		if (seedData && isFuture(new Date(seedData.expiry))) {
			seedKey = seedData.value;
		} else {
			const newKey = Math.random();
			const expiry = add(new Date(), {
				hours: 1,
			});

			seedKey = newKey;

			window.sessionStorage.setItem(
				"seed-key",
				JSON.stringify({
					expiry,
					value: newKey,
					previousKey: seedData?.value || null,
				}),
			);
		}
	} else {
		seedKey = 0;
	}

	return Math.floor(seedKey * 10000);
};
