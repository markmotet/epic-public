import { render, screen } from "@testing-library/react";

import { useSearch } from "contexts/Search";

import useProjects from "queries/useProjects";

import ProjectResults from "./Results";

import { formatDateLongMonth } from "services/date.js";
import { getProjectPath } from "services/navigation";

jest.mock("contexts/Search");
jest.mock("queries/useProjects");
jest.mock("services/date.js");
jest.mock("services/navigation");

describe("ProjectResults", () => {
	beforeEach(() => {
		useSearch.mockReturnValue({
			isSearching: true,
			searchTerm: "test",
			selectedFilters: [],
		});

		useProjects.mockReturnValue({
			data: [
				{
					searchResults: [
						{
							_id: "1",
							currentPhaseName: { name: "Phase 1" },
							dateUpdated: "2023-04-01",
							name: "Project 1",
							proponent: { name: "Proponent 1" },
							region: "Region 1",
							type: "Type 1",
						},
					],
					meta: [{ searchResultsTotal: 1 }],
				},
			],
		});

		formatDateLongMonth.mockReturnValue("April 1, 2023");
		getProjectPath.mockReturnValue("/project/1");
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test("should render the ProjectResults component", () => {
		render(<ProjectResults onSearch={jest.fn()} />);
		expect(screen.getByText("Project 1")).toBeInTheDocument();
	});

	test("should call onSearch callback when isSearching changes", () => {
		const onSearchMock = jest.fn();
		render(<ProjectResults onSearch={onSearchMock} />);
		expect(onSearchMock).toHaveBeenCalledWith(true);
	});

	test("should set the default table parameters", () => {
		render(<ProjectResults onSearch={jest.fn()} />);
		expect(screen.getByText("April 1, 2023")).toBeInTheDocument();
		expect(screen.getByText("Proponent 1")).toBeInTheDocument();
		expect(screen.getByText("Type 1")).toBeInTheDocument();
		expect(screen.getByText("Region 1")).toBeInTheDocument();
		expect(screen.getByText("Phase 1")).toBeInTheDocument();
	});
});
