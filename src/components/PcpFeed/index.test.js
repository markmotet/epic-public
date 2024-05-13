import { fireEvent, render, screen, within } from "@testing-library/react";
import { mockUsePcpsData } from "__mocks__";

import usePcps from "queries/usePcps";

import PcpFeed from "../PcpFeed";

import { HOME_TAB_KEYS } from "constants/home";

jest.mock("queries/usePcps");

describe("PcpFeed tests", () => {
	beforeEach(() => {
		usePcps.mockReturnValue({ isError: false, isSuccess: true, data: [mockUsePcpsData] });
	});

	const mockOnSelectTab = jest.fn();
	describe("UpdatesFeed header and footer rendering", () => {
		test("should render the feed header", () => {
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			expect(screen.getByRole("heading", { level: 1, name: "Public Comment Periods" })).toBeInTheDocument();
			expect(screen.getByText("Upcoming, open, and recently closed Public Comment Periods:")).toBeInTheDocument();
		});

		test("should render the footer and call onSelectTab when 'Search All' button is clicked", () => {
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			const footerButton = screen.getByRole("button", { name: "Search all Public Comment Periods >" });
			expect(footerButton).toBeInTheDocument();
			fireEvent.click(footerButton);

			expect(mockOnSelectTab).toHaveBeenCalledWith(HOME_TAB_KEYS.PUBLIC_COMMENT_PERIODS);
		});
	});

	describe("PcpCard rendering", () => {
		test("should render the expected number of PcpCard components in a list", () => {
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			const pcpList = screen.getByRole("list", { name: "Public Comment Period list" });
			expect(pcpList).toBeInTheDocument();

			const pcpCards = screen.getAllByRole("listitem");
			expect(pcpCards.length).toBe(mockUsePcpsData.meta[0].searchResultsTotal);

			pcpCards.forEach((card, i) => {
				const { project } = mockUsePcpsData.searchResults[i];

				expect(within(card).getByText(`${project.name} - ${project.currentPhaseName.name}`)).toBeInTheDocument();
			});

			expect(mockOnSelectTab).not.toHaveBeenCalled();
		});
	});

	describe("usePcps hook behavior", () => {
		test("should render a loading state when the data is being fetched", () => {
			usePcps.mockReturnValue({ isLoading: true, isError: false, isSuccess: false });
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			const pcpList = screen.getByRole("list", { name: "Public Comment Period list" });
			expect(pcpList).toBeInTheDocument();
			expect(within(pcpList).getByText("Loading...")).toBeInTheDocument();
		});

		test("should render an error state when there is an error fetching the data", () => {
			usePcps.mockReturnValue({ isLoading: false, isError: true, isSuccess: false });
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			const pcpList = screen.getByRole("list", { name: "Public Comment Period list" });
			expect(pcpList).toBeInTheDocument();
			expect(within(pcpList).getByText("Error fetching recent comment periods.")).toBeInTheDocument();
		});
		test("should an indication of no recent pcps when there are none", () => {
			usePcps.mockReturnValue({
				isError: false,
				isSuccess: true,
				data: [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
			});
			render(<PcpFeed onSelectTab={mockOnSelectTab} />);

			expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
			expect(screen.getByText("There are no recent comment periods.")).toBeInTheDocument();
		});
	});
});
