import { render, screen, within } from "@testing-library/react";
import { mockUseListsData, mockUseUpdatesData } from "__mocks__";

import { useSearch } from "contexts/Search";

import useLists from "queries/useLists";
import useUpdates from "queries/useUpdates";

import UpdatesResults from "./Results";

import { formatDateLongMonth } from "services/date";

jest.mock("contexts/Search");
jest.mock("queries/useLists");
jest.mock("queries/useUpdates");

describe("UpdatesResults tests", () => {
	const mockSearchState = {
		isSearching: true,
		searchTerm: "test",
		selectedFilters: [],
	};

	beforeEach(() => {
		useLists.mockReturnValue({ data: mockUseListsData });
		useSearch.mockReturnValue(mockSearchState);
		useUpdates.mockReturnValue({ isError: false, isSuccess: true, data: [mockUseUpdatesData] });
	});

	test("should render with the correct data", () => {
		render(<UpdatesResults />);

		expect(screen.getByRole("table", { name: "results table" })).toBeInTheDocument();

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUseUpdatesData.meta[0].searchResultsTotal); // header and pcps

		for (let i = 0; i < mockUseUpdatesData.searchResults.length; i++) {
			const dataRow = tableRows[i + 1];
			const mockUpdate = mockUseUpdatesData.searchResults[i];

			expect(within(dataRow).getByText(mockUpdate.project.name)).toBeInTheDocument();

			const projectPhase = mockUseListsData[0].searchResults.find(
				(phase) => phase._id === mockUpdate.project.currentPhaseName,
			);
			expect(within(dataRow).getByText(projectPhase.name)).toBeInTheDocument();

			expect(within(dataRow).getByText(formatDateLongMonth(mockUpdate.dateAdded))).toBeInTheDocument();
			expect(
				within(dataRow).getByText(mockUpdate.complianceAndEnforcement ? `${mockUpdate.type} / C&E` : mockUpdate.type),
			).toBeInTheDocument();
		}
	});

	test("should render indication when loading", () => {
		useUpdates.mockReturnValue({ isLoading: true, isError: false });
		render(<UpdatesResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Searching...")).toBeInTheDocument();
	});

	test("should render indication of error when error occurs", () => {
		useUpdates.mockReturnValue({ isError: true, isSuccess: false });
		render(<UpdatesResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Error searching Updates.")).toBeInTheDocument();
	});

	test("should not render the Results table component when there are no search results", () => {
		useUpdates.mockReturnValue({
			isError: false,
			isSuccess: true,
			data: [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
		});
		render(<UpdatesResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText(`No results found for "${mockSearchState.searchTerm}".`)).toBeInTheDocument();
	});
});
