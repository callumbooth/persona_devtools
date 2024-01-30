import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { BASE_API_URL } from "../../config/constants";
import { Todo } from "./types";

const getTodosConfig = () => ({
	queryKey: ["todos"],
	queryFn: async () => {
		console.log("getting todos");
		const res = (await axios.get<Todo[]>(`${BASE_API_URL}/todos`)).data;

		return res;
	},
});

export const useGetTodos = () => {
	return useQuery(getTodosConfig());
};

export const usePostTodo = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			await axios.post<never, AxiosResponse<never>, Omit<Todo, "id">>(
				`${BASE_API_URL}/todos`,
				{
					name: "my new todo",
					completed: false,
				},
			);
		},
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries(getTodosConfig());
		},
	});
};
