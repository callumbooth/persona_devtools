import { PersonaConfig, inferOptions } from "../../../src/types";
import { handlers } from "../mocks/handlers";

type InferedOptions = inferOptions<typeof handlers>;

const PersonasConfig = {
	admin: {
		label: "Admin",
		options: {
			todos: "a",
		},
	},
	longTermUser: {
		label: "Long term user",
		options: {
			todos: "a",
		},
	},
	newUser: {
		label: "New User",
		options: {
			todos: "b",
		},
	},
	custom: {
		label: "Custom",
		user: {
			role: "admin",
		},
		options: {
			todos: "a",
		},
	},
} satisfies PersonaConfig<InferedOptions>;

export default PersonasConfig;
