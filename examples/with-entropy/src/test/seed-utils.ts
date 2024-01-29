import { findOrCreateSeedKey } from "@/src/seeding";
import { Faker, faker } from "@faker-js/faker";

const seedKey = findOrCreateSeedKey(undefined);

console.log("--SEED KEY---", seedKey);

function withCustomModule<
	S extends Faker,
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
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
