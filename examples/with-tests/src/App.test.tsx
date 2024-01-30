import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Todos } from "./App";
import { staticHandlers } from "./mocks/handlers";

const testQueryClient = new QueryClient({
	defaultOptions: { queries: { retry: false, staleTime: 0 } },
});

const RenderComponent = () => {
	return render(
		<QueryClientProvider client={testQueryClient}>
			<Todos />
		</QueryClientProvider>,
	);
};

describe("Todos tests", () => {
	it("should show a list of todos", async () => {
		const res = staticHandlers.config.todos.getResponse();
		RenderComponent();

		expect(await screen.findByText(res.data[0].name)).not.toBeNull();
	});
});
