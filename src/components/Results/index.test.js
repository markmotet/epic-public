import { render, screen, within } from "@testing-library/react";

import Results from "components/Results";

describe("Results Table tests", () => {
	const setOrder = jest.fn();
	const setOrderBy = jest.fn();
	const setPageNum = jest.fn();
	const setPageSize = jest.fn();
	const onRowClick = jest.fn();

	const mockProps = {
		columns: [
			{ name: "Name", value: "name", sortName: "name" },
			{ name: "Type", value: "type", sortName: "type" },
			{ name: "Index", value: "index", sortName: "index" },
		],
		data: [
			{ name: "row 1", type: "Alpha-data", index: 1, key: 123 },
			{ name: "row 2", type: "Beta-data", index: 2, key: 234 },
			{ name: "row 3", type: "Charlie-data", index: 3, key: 345 },
		],
		order: "desc",
		orderBy: "score",
		pageNum: 0,
		pageSize: 10,
		setOrder: setOrder,
		setOrderBy: setOrderBy,
		setPageNum: setPageNum,
		setPageSize: setPageSize,
		onRowClick: onRowClick,
		totalResultCount: 10,
	};
	test("Renders the correct table headers", () => {
		render(<Results {...mockProps} />);
		const tableHeadCells = screen.getAllByRole("columnheader");
		const columnNames = tableHeadCells.map((cell) => cell.textContent);
		expect(columnNames).toEqual(mockProps.columns.map((item) => item.name));
	});

	test("The Rows are in the correct default order", () => {
		render(<Results {...mockProps} />);
		const tableRows = screen.getAllByRole("row");
		const dataRows = tableRows.slice(1);
		const firstColumnData = dataRows.map((row) => {
			return within(row).getAllByRole("cell")[0].textContent;
		});
		expect(firstColumnData).toEqual(mockProps.data.map((item) => item.name));
	});

	test("Table displays data fields that have corresponding columns", () => {
		render(<Results {...mockProps} />);
		const tableRows = screen.getAllByRole("row");
		const dataRows = tableRows.slice(1);
		const rowDataList = dataRows.map((row) => {
			return within(row)
				.getAllByRole("cell")
				.map((cell) => {
					return cell.textContent;
				});
		});
		expect(rowDataList).toEqual(mockProps.data.map((item) => [item.name, item.type, item.index.toString()]));
	});

	test("Table does not display fields which have no corresponding columns", () => {
		render(<Results {...mockProps} />);
		expect(screen.queryByText("123")).not.toBeInTheDocument();
		expect(screen.queryByText("234")).not.toBeInTheDocument();
		expect(screen.queryByText("345")).not.toBeInTheDocument();
	});
});
