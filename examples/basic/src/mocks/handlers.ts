import { http, HttpResponse, passthrough } from "msw";
import { mapHandlersToSetup, withOption, withOptions } from "../../../src/main";
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
		(getValues) => {
			return http.get("http://localhost:4000/todos", () => {
				const values = getValues();

				if (values.passthrough) {
					return passthrough();
				}

				return HttpResponse.json(
					Array.from({ length: values.amount }, (_, i) => ({
						...data[values.dataset],
						id: i,
					})),
				);
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
