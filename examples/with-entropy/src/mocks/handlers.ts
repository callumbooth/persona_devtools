import { mapHandlersToSetup, withOptions } from "@persona-ui/msw";
import { http, HttpResponse, passthrough } from "msw";
import { faker } from "seed-utils";
import { Todo } from "../api/todo/types";

const createTodo = (): Todo => {
	return {
		id: faker.number.int(),
		name: faker.person.jobTitle(),
		completed: false,
	};
};

export const handlers = {
	todos: withOptions(
		{
			dataset: { options: ["a", "b"] as const },
			amount: 1,
		},
		(config) => {
			console.log("original res");
			return Array.from({ length: config.amount }, (_) => createTodo());
		},
		(getResponse) => {
			return http.get("http://localhost:4000/todos", () => {
				const res = getResponse();

				if (res.passthrough) {
					return passthrough();
				}

				return HttpResponse.json(res.data);
			});
		},
	),
};

export const mappedHandlers = mapHandlersToSetup(handlers, {
	current: {
		todos: {
			dataset: "a",
			amount: 2,
		},
	},
});
