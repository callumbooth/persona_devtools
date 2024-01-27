import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { PersonaDevTools } from "../../src/main";
import "./App.css";

import axios from "axios";
import PersonasConfig from "./config/personas";
import { handlers } from "./mocks/handlers";

const queryClient = new QueryClient();

const Todos = () => {
	// Access the client
	const queryClient = useQueryClient();

	// Queries
	const query = useQuery({
		queryKey: ["todos"],
		queryFn: async () => {
			const res = (await axios.get("http://localhost:4000/todos")).data;

			return res;
		},
	});

	// Mutations
	const mutation = useMutation({
		mutationFn: async () => {
			await axios.post("/todos", { name: "my new todo", completed: false });
		},
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	return (
		<div>
			<ul>
				{query.data?.map((todo) => (
					<li key={todo.id}>{todo.name}</li>
				))}
			</ul>

			<button
				type="button"
				onClick={() => {
					mutation.mutate();
				}}
			>
				Add Todo
			</button>
		</div>
	);
};

const Homepage = () => {
	const queryClient = useQueryClient();
	return (
		<>
			<h1>Vite + React</h1>

			<h2>Todos</h2>
			<Todos />

			<PersonaDevTools
				handlers={handlers}
				onHandlerUpdate={(options) => {
					queryClient.invalidateQueries();
				}}
			/>
		</>
	);
};

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Homepage />
		</QueryClientProvider>
	);
}

export default App;
