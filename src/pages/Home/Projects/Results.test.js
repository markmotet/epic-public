import { render, screen, within } from "@testing-library/react";
import { mockUseProjectsData } from "__mocks__/projects";

import { useSearch } from "contexts/Search";

import useProjects from "queries/useProjects";

import ProjectResults from "./Results";

import { formatDateLongMonth } from "services/date.js";
import { getProjectPath } from "services/navigation";

jest.mock("contexts/Search");
jest.mock("queries/useProjects");
jest.mock("services/navigation");

describe("ProjectResults", () => {
	const mockSearchState = {
		isSearching: true,
		searchTerm: "test",
		selectedFilters: [],
	};
	const onSearchMock = jest.fn();

	beforeEach(() => {
		useSearch.mockReturnValue(mockSearchState);
		useProjects.mockReturnValue({ isError: false, isSuccess: true, data: [mockUseProjectsData] });
		getProjectPath.mockReturnValue("/project/1");
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test("should render the ProjectResults component", () => {
		render(<ProjectResults onSearch={onSearchMock} />);

		expect(screen.getByText("Project 1")).toBeInTheDocument();
	});

	test("should call onSearch callback when isSearching changes", () => {
		render(<ProjectResults onSearch={onSearchMock} />);

		expect(onSearchMock).toHaveBeenCalledWith(true);
	});

	test("should render with the correct data", () => {
		render(<ProjectResults onSearch={onSearchMock} />);

		expect(screen.getByRole("table", { name: "results table" })).toBeInTheDocument();

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUseProjectsData.meta[0].searchResultsTotal); // header and pcps

		for (let i = 0; i < mockUseProjectsData.searchResults.length; i++) {
			const dataRow = tableRows[i + 1];
			const mockProject = mockUseProjectsData.searchResults[i];
			expect(within(dataRow).getByText(mockProject.name)).toBeInTheDocument();
			expect(within(dataRow).getByText(mockProject.currentPhaseName.name)).toBeInTheDocument();
			expect(within(dataRow).getByText(formatDateLongMonth(mockProject.dateUpdated))).toBeInTheDocument();
			expect(within(dataRow).getByText(mockProject.proponent.name)).toBeInTheDocument();
			expect(within(dataRow).getByText(mockProject.region)).toBeInTheDocument();
			expect(within(dataRow).getByText(mockProject.type)).toBeInTheDocument();
		}
	});

	test("should render indication when loading", () => {
		useProjects.mockReturnValue({ isLoading: true, isError: false });
		render(<ProjectResults onSearch={onSearchMock} />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Searching...")).toBeInTheDocument();
	});

	test("should render indication of error when error occurs", () => {
		useProjects.mockReturnValue({ isError: true, isSuccess: false });
		render(<ProjectResults onSearch={onSearchMock} />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Error searching Projects.")).toBeInTheDocument();
	});

	test("should not render the component when there are no search results", () => {
		useProjects.mockReturnValue({
			isError: false,
			isSuccess: true,
			data: [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
		});

		render(<ProjectResults onSearch={onSearchMock} />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText(`No results found for "${mockSearchState.searchTerm}".`)).toBeInTheDocument();
	});
});
