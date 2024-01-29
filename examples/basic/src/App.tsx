import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { PersonaDevTools } from "persona_devtools";
import "./App.css";

import { useGetTodos, usePostTodo } from "./api/todo/todo";

import { appQueryClient } from "./config/queryClient";
import { handlers } from "./mocks/handlers";

const Todos = () => {
	// Queries
	const query = useGetTodos();

	// Mutations
	const mutation = usePostTodo();

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

			<h2>Todos - base example</h2>
			<Todos />

			<PersonaDevTools
				handlers={handlers}
				onHandlerUpdate={async () => {
					await queryClient.cancelQueries();
					queryClient.invalidateQueries();
				}}
			/>
		</>
	);
};

function App() {
	return (
		<QueryClientProvider client={appQueryClient}>
			<Homepage />
		</QueryClientProvider>
	);
}

export default App;
