import { Faker, faker } from "@faker-js/faker";
import { findOrCreateSeedKey } from "persona_devtools";

const seedKey = findOrCreateSeedKey(undefined);

console.log("--SEED KEY---", seedKey);

function withCustomModule<
	S extends Faker,
	// biome-ignore lint/suspicious/noExplicitAny: any is required
	T extends Record<string, (...args: any[]) => any>,
	U extends S & { custom: T },
>(base: S, value: T): U {
	return {
		// Previous modules
		...base,
		// Custom Modules
		custom: value,
	} as U;
}

const customModules = {} as const;

const fakerPlus = withCustomModule(faker, customModules);

faker.seed(seedKey);

export { fakerPlus as faker };
