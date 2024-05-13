export const mockMetPcp = {
	_id: "1",
	dateCompleted: "2023-04-01T00:00:00.000Z",
	dateStarted: "2023-03-01T00:00:00.000Z",
	metURL: "https://example.com",
	name: "Met PCP 1",
	phaseName: "Phase 1",
	project: { _id: "7", currentPhaseName: { name: "Phase 2" }, name: "Project C" },
};

export const mockPcp = {
	_id: "2",
	dateCompleted: "2050-04-01T00:00:00.000Z",
	dateStarted: "2050-03-01T00:00:00.000Z",
	name: "PCP 2",
	phaseName: "Phase 2",
	project: { _id: "8", currentPhaseName: { name: "Phase 1" }, name: "Project B" },
};

export const mockUsePcpsData = {
	searchResults: [mockMetPcp, mockPcp, { ...mockPcp, _id: "3" }],
	meta: [{ searchResultsTotal: 3 }],
};
