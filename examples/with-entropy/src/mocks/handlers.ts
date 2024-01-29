import { http, HttpResponse, passthrough } from "msw";
import { mapHandlersToSetup, withOptions } from "persona_devtools";
import { faker } from "seed-utils";
import { Todo } from "../api/todo/types";

const createTodo = () => {
	return {
		id: faker.number.int(),
		name: faker.person.jobTitle(),
		completed: false,
	};
};

const data: Record<string, () => Todo> = {
	a: () => createTodo(),
	b: () => createTodo(),
};

export const handlers = {
	todos: withOptions(
		{
			dataset: { options: { a: "a", b: "b" } as const },
			amount: 1,
		},
		(getValues) => {
			return http.get("http://localhost:4000/todos", () => {
				const values = getValues();

				if (values.passthrough) {
					return passthrough();
				}

				return HttpResponse.json(
					Array.from({ length: values.amount }, (_) => data[values.dataset]()),
				);
			});
		},
	),
	//Prospective api to help with using these handlers in tests.
	// other: withOptions(
		//Set the handler first
		// (getResponse) => {
		// 	return http.get("http://localhost:4000/todos", () => {
		// 		const response = getResponse();

		// 		if (response.passthrough) {
		// 			return passthrough();
		// 		}

		// 		return HttpResponse.json(response.data);
		// 	});
		// },

		//Set the response data, setting it here allow us to create a static response for testing by just passing in a fixed config
		// (config) => {
		// 	return Array.from({ length: config.amount }, (_) => data[config.dataset]());
		// },

		// Set the config, this is optional, but if used sets up the leva options.
		// {
		// 	dataset: { options: { a: "a", b: "b" } as const },
		// 	amount: 1,
		// },
	// ),
};

export const mappedHandlers = mapHandlersToSetup(handlers, {
	current: {
		todos: {
			dataset: "a",
			amount: 2,
		},
	},
});
