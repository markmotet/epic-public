import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import Projects from "./index";

describe("Projects component", () => {
	test("renders the Search component with the correct props", () => {
		const queryClient = new QueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<Projects onShowUpdates={jest.fn()} />
			</QueryClientProvider>,
		);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Search Projects" })).toBeInTheDocument();
	});

	test("calls the onShowUpdates function when the ProjectResults component fires the onSearch event", () => {
		const queryClient = new QueryClient();
		const mockOnShowUpdates = jest.fn();
		render(
			<QueryClientProvider client={queryClient}>
				<Projects onShowUpdates={mockOnShowUpdates} />
			</QueryClientProvider>,
		);
		const projectResultsComponent = screen.getByRole("button", { name: "Search" });
		fireEvent.click(projectResultsComponent, { searching: true });
		expect(mockOnShowUpdates).toHaveBeenCalledWith(true);
	});
});
