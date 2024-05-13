import { fireEvent, render, screen, within } from "@testing-library/react";
import { mockUseDocumentsData, mockUseListsData } from "__mocks__";

import { useSearch } from "contexts/Search";

import { apiConfig } from "queries/endpoints";
import useDocuments from "queries/useDocuments";
import useLists from "queries/useLists";

import DocumentResults from "./Results";

import { formatDateLongMonth } from "services/date";

jest.mock("queries/useDocuments");
jest.mock("queries/useLists");
jest.mock("contexts/Search");

describe("DocumentResults tests", () => {
	const mockSearchState = {
		isSearching: true,
		searchTerm: "test",
		selectedFilters: [],
	};

	beforeEach(() => {
		useSearch.mockReturnValue(mockSearchState);
		useDocuments.mockReturnValue({ isError: false, isSuccess: true, data: [mockUseDocumentsData] });
		useLists.mockReturnValue({ data: mockUseListsData });
	});

	test("should render with the correct data", () => {
		render(<DocumentResults />);

		expect(screen.getByRole("table", { name: "results table" })).toBeInTheDocument();

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUseDocumentsData.meta[0].searchResultsTotal); // header and documents

		for (let i = 0; i < mockUseDocumentsData.searchResults.length; i++) {
			const dataRow = tableRows[i + 1];
			const mockDocument = mockUseDocumentsData.searchResults[i];

			expect(within(dataRow).getByText(mockDocument.displayName)).toBeInTheDocument();

			const docType = mockUseListsData[0].searchResults.find((docType) => docType._id === mockDocument.type);
			expect(within(dataRow).getByText(docType.name)).toBeInTheDocument();

			const authorType = mockUseListsData[0].searchResults.find(
				(author) => author._id === mockDocument.documentAuthorType,
			);
			expect(within(dataRow).getByText(authorType.name)).toBeInTheDocument();

			expect(within(dataRow).getByText(formatDateLongMonth(mockDocument.datePosted))).toBeInTheDocument();

			const projectPhase = mockUseListsData[0].searchResults.find((phase) => phase._id === mockDocument.projectPhase);
			expect(within(dataRow).getByText(projectPhase.name)).toBeInTheDocument();
		}
	});

	test("should render with the correct link cells", () => {
		render(<DocumentResults />);

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUseDocumentsData.meta[0].searchResultsTotal); // header and documents

		const row = tableRows[1];

		const downloadIcon = within(row).getByTestId("FileDownloadOutlinedIcon");
		expect(downloadIcon).toBeInTheDocument();
		expect(downloadIcon.closest("a")).toHaveAttribute(
			"href",
			`${apiConfig.url}/download/${mockUseDocumentsData.searchResults[0]._id}/download/${mockUseDocumentsData.searchResults[0].documentFileName}`,
		);

		const projectLink = within(row).getByRole("link", { name: mockUseDocumentsData.searchResults[0].project.name });
		expect(projectLink).toBeInTheDocument();
		expect(projectLink).toHaveAttribute(
			"href",
			`/p/${mockUseDocumentsData.searchResults[0].project._id}/project-details`,
		);
	});

	test("should open the download link in a new tab when a row is clicked", () => {
		jest.spyOn(window, "open").mockImplementation(() => {});

		render(<DocumentResults />);

		const tableRows = screen.getAllByRole("row");
		expect(tableRows.length).toBe(1 + mockUseDocumentsData.meta[0].searchResultsTotal); // header and document row

		fireEvent.click(tableRows[1]);
		expect(window.open).toHaveBeenCalledWith(
			`${apiConfig.url}/download/${mockUseDocumentsData.searchResults[0]._id}/download/${mockUseDocumentsData.searchResults[0].documentFileName}`,
			"_blank",
		);
	});

	test("should render indication when loading", () => {
		useDocuments.mockReturnValue({ isLoading: true, isError: false });
		render(<DocumentResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Searching...")).toBeInTheDocument();
	});

	test("should render indication of error when error occurs", () => {
		useDocuments.mockReturnValue({ isError: true, isSuccess: false });
		render(<DocumentResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText("Error searching Documents.")).toBeInTheDocument();
	});

	test("should not render the component when there are no search results", () => {
		useDocuments.mockReturnValue({
			isError: false,
			isSuccess: true,
			data: [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
		});

		render(<DocumentResults />);

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByText(`No results found for "${mockSearchState.searchTerm}".`)).toBeInTheDocument();
	});
});
