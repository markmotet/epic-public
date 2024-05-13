import { fireEvent, render, screen, within } from "@testing-library/react";
import { mockUsePcpsData } from "__mocks__";

import { useSearch } from "contexts/Search";

import usePcps from "queries/usePcps";

import CommentPeriodResults from "./Results";

import { formatDateLongMonth } from "services/date";
import { getStatus } from "services/pcp";

jest.mock("queries/usePcps");
jest.mock("contexts/Search");

describe("CommentPeriodResults tests", () => {
	const mockSearchState = {
		isSearching: true,
		searchTerm: "test",
		selectedFilters: [],
	};

	beforeEach(() => {
		useSearch.mockReturnValue(mockSearchState);
		usePcps.mockReturnValue({ isError: false, isSuccess: true, data: [mockUsePcpsData] });
	});

	test("should render with the correct data", () => {
		render(<CommentPeriodResults />);

		expect(screen.getByRole("table", { name: "results table" })).toBeInTheDocument();

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUsePcpsData.meta[0].searchResultsTotal); // header and pcps

		for (let i = 0; i < mockUsePcpsData.searchResults.length; i++) {
			const dataRow = tableRows[i + 1];
			const mockPcp = mockUsePcpsData.searchResults[i];

			expect(within(dataRow).getByText(mockPcp.phaseName)).toBeInTheDocument();
			expect(within(dataRow).getByText(mockPcp.project.name)).toBeInTheDocument();
			expect(
				within(dataRow).getByText(
					`${formatDateLongMonth(mockPcp.dateStarted)} - ${formatDateLongMonth(mockPcp.dateCompleted)}`,
				),
			).toBeInTheDocument();
			expect(within(dataRow).getByText(getStatus(mockPcp.dateStarted, mockPcp.dateCompleted))).toBeInTheDocument();
		}
	});

	test("should render with the correct linked project cell", () => {
		render(<CommentPeriodResults />);

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUsePcpsData.meta[0].searchResultsTotal); // header and pcps

		const row = tableRows[1];

		const projectLink = within(row).getByRole("link", { name: mockUsePcpsData.searchResults[0].project.name });
		expect(projectLink).toBeInTheDocument();
		expect(projectLink).toHaveAttribute("href", `/p/${mockUsePcpsData.searchResults[0].project._id}/project-details`);
	});

	test("should open the MET URL when a MET pcp row is clicked", () => {
		jest.spyOn(window, "open").mockImplementation(() => {});

		render(<CommentPeriodResults />);

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUsePcpsData.meta[0].searchResultsTotal); // header and pcps

		fireEvent.click(tableRows[1]);
		expect(window.open).toHaveBeenCalledWith(mockUsePcpsData.searchResults[0].metURL);
	});

	test("should render indication when loading", () => {
		usePcps.mockReturnValue({ isLoading: true, isError: false });
		render(<CommentPeriodResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Searching...")).toBeInTheDocument();
	});

	test("should render indication of error when error occurs", () => {
		usePcps.mockReturnValue({ isError: true, isSuccess: false });
		render(<CommentPeriodResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Error searching Public Comment Periods.")).toBeInTheDocument();
	});

	test("should not render the component when there are no search results", () => {
		usePcps.mockReturnValue({
			isError: false,
			isSuccess: true,
			data: [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
		});
		render(<CommentPeriodResults />);

		expect(screen.getByText(`No results found for "${mockSearchState.searchTerm}".`)).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
