import { fireEvent, render, screen } from "@testing-library/react";

import ResultsPagination from "./Pagination";

describe("Pagination tests", () => {
	const setPageNum = jest.fn();
	const setPageSize = jest.fn();

	const firstPageNum = 0;
	const lastPageNum = 2;
	const middlePageNum = 1;

	const mockProps = {
		pageNum: firstPageNum,
		pageSize: 10,
		setPageNum: setPageNum,
		setPageSize: setPageSize,
		totalResultCount: 27,
	};

	describe("rendering with the first of two pages being active", () => {
		test("renders 1st page correctly", () => {
			render(<ResultsPagination {...mockProps} pageNum={firstPageNum} />);

			expect(screen.getByText("Showing")).toBeInTheDocument();
			expect(screen.getByRole("combobox")).toBeInTheDocument(); // drop list
			expect(screen.getByText(`of ${mockProps.totalResultCount} results`)).toBeInTheDocument();

			const firstButton = screen.getByRole("button", { name: "go to the first page" });
			expect(firstButton).toBeInTheDocument();
			expect(firstButton).toBeDisabled();

			const prevButton = screen.getByRole("button", { name: "go to the previous page" });
			expect(prevButton).toBeInTheDocument();
			expect(prevButton).toBeDisabled();

			const currentPage = screen.getByRole("button", { name: "page 1" });
			expect(currentPage).toBeInTheDocument();
			expect(currentPage).toHaveAttribute("aria-current", "true");

			expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();

			expect(screen.getByRole("button", { name: "go to the next page" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "go to the last page" })).toBeInTheDocument();
		});
	});

	describe("rendering with the third of three pages being active", () => {
		test("being on the last page disables Next and Last page navigations", () => {
			render(<ResultsPagination {...mockProps} pageNum={lastPageNum} />);

			const currentPage = screen.getByRole("button", { name: "page 3" });
			expect(currentPage).toBeInTheDocument();
			expect(currentPage).toHaveAttribute("aria-current", "true");

			const nextButton = screen.getByRole("button", { name: "go to the next page" });
			expect(nextButton).toBeInTheDocument();
			expect(nextButton).toBeDisabled();

			expect(screen.getByRole("button", { name: "go to the last page" })).toBeInTheDocument();

			const lastButton = screen.getByRole("button", { name: "go to the last page" });
			expect(lastButton).toBeInTheDocument();
			expect(lastButton).toBeDisabled();
		});
	});

	describe("rendering with the second of three pages being active", () => {
		test("Navigation buttons are enabled when on Neither the first or last page", () => {
			render(<ResultsPagination {...mockProps} pageNum={middlePageNum} />);

			const firstButton = screen.getByRole("button", { name: "go to the first page" });
			expect(firstButton).toBeInTheDocument();
			expect(firstButton).toBeEnabled();

			const prevButton = screen.getByRole("button", { name: "go to the previous page" });
			expect(prevButton).toBeInTheDocument();
			expect(prevButton).toBeEnabled();

			const currentPage = screen.getByRole("button", { name: "page 2" });
			expect(currentPage).toBeInTheDocument();
			expect(currentPage).toHaveAttribute("aria-current", "true");

			const nextButton = screen.getByRole("button", { name: "go to the next page" });
			expect(nextButton).toBeInTheDocument();
			expect(nextButton).toBeEnabled();

			expect(screen.getByRole("button", { name: "go to the last page" })).toBeInTheDocument();

			const lastButton = screen.getByRole("button", { name: "go to the last page" });
			expect(lastButton).toBeInTheDocument();
			expect(lastButton).toBeEnabled();
		});
	});

	describe("Navigating with Next and Previous increments pages", () => {
		test("Clicking on next goes from page 1 to page 2", () => {
			render(<ResultsPagination {...mockProps} pageNum={firstPageNum} />);
			let firstButton = screen.getByRole("button", { name: "go to the first page" });
			expect(firstButton).toBeInTheDocument();
			expect(firstButton).toBeDisabled();

			const prevButton = screen.getByRole("button", { name: "go to the previous page" });
			expect(prevButton).toBeInTheDocument();
			expect(prevButton).toBeDisabled();

			const currentPage = screen.getByRole("button", { name: "page 1" });
			expect(currentPage).toBeInTheDocument();
			expect(currentPage).toHaveAttribute("aria-current", "true");

			const nextButton = screen.getByRole("button", { name: "go to the next page" });
			expect(nextButton).toBeInTheDocument();
			expect(nextButton).toBeEnabled();

			expect(screen.getByRole("button", { name: "go to the last page" })).toBeInTheDocument();

			const lastButton = screen.getByRole("button", { name: "go to the last page" });
			expect(lastButton).toBeInTheDocument();
			expect(lastButton).toBeEnabled();

			fireEvent.click(nextButton);
			expect(setPageNum).toHaveBeenCalledWith(firstPageNum + 1);
		});

		test("Clicking on Previous goes from page 2 to 1", () => {
			render(<ResultsPagination {...mockProps} pageNum={middlePageNum} />);

			const prevButton = screen.getByRole("button", { name: "go to the previous page" });
			expect(prevButton).toBeInTheDocument();
			expect(prevButton).toBeEnabled();

			const currentPage = screen.getByRole("button", { name: "page 2" });
			expect(currentPage).toBeInTheDocument();
			expect(currentPage).toHaveAttribute("aria-current", "true");

			fireEvent.click(prevButton);
			expect(setPageNum).toHaveBeenCalledWith(middlePageNum - 1);
		});
	});

	describe("Navigating with << and >> jumps to first and last pages", () => {
		test("Clicking the 'last' button will jump to page 3 from page 1", () => {
			render(<ResultsPagination {...mockProps} pageNum={firstPageNum} />);
			const lastPageButton = screen.getByRole("button", { name: "go to the last page" });
			expect(lastPageButton).toBeInTheDocument();
			expect(lastPageButton).toBeEnabled();
			fireEvent.click(lastPageButton);
			expect(setPageNum).toHaveBeenCalledWith(Math.ceil(mockProps.totalResultCount / mockProps.pageSize) - 1);
		});

		test("Clicking the 'first' button will jump to page 1 from page 3", () => {
			render(<ResultsPagination {...mockProps} pageNum={lastPageNum} />);
			const firstPageButton = screen.getByRole("button", { name: "go to the first page" });
			expect(firstPageButton).toBeInTheDocument();
			expect(firstPageButton).toBeEnabled();
			fireEvent.click(firstPageButton);
			expect(setPageNum).toHaveBeenCalledWith(firstPageNum);
		});
	});

	describe("Clicking the page number in the pagination list navigates between pages", () => {
		test("Clicking 2 moves to page 2", () => {
			render(<ResultsPagination {...mockProps} />);
			const secondPageButton = screen.getByRole("button", { name: "Go to page 2" });
			expect(secondPageButton).toBeInTheDocument();
			expect(secondPageButton).toBeEnabled();
			fireEvent.click(secondPageButton);
			expect(setPageNum).toHaveBeenCalledWith(middlePageNum);
		});
	});
});
