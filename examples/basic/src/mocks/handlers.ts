import { http, HttpResponse, passthrough } from "msw";
import { mapHandlersToSetup, withOptions } from "persona_devtools";
import { Todo } from "../api/todo/types";

const data: Record<string, Todo> = {
	a: {
		id: 0,
		name: "todo a",
		completed: false,
	},
	b: {
		id: 0,
		name: "todo b",
		completed: false,
	},
};

export const handlers = {
	todos: withOptions(
		{
			dataset: { options: { a: "a", b: "b" } as const },
			amount: 1,
		},
		(config) => {
			return Array.from({ length: config.amount }, (_, i) => ({
				...data[config.dataset],
				id: i,
			}));
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
