import { http, HttpResponse, passthrough } from "msw";
import { mapHandlersToSetup, withOption, withOptions } from "../../../src/main";

export const handlers = {
	todos: withOptions(
		{
			dataset: { options: { a: "do A", b: "do B" } as const },
			amount: 1,
		},
		(getValues) => {
			const values = getValues();
			console.log("here", values);
			return http.get("http://localhost:4000/todos", () => {
				return HttpResponse.json([{ id: 1, name: "some todo", completed: false }]);
			});
		},
	),
};

export const mappedHandlers = mapHandlersToSetup(handlers, {
	current: {
		todos: "a",
	},
});
