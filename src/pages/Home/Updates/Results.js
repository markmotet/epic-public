import { useEffect, useMemo, useState } from "react";
import { makeStyles } from "tss-react/mui";

import { useSearch } from "contexts/Search";

import useLists from "queries/useLists";
import useUpdates from "queries/useUpdates";

import Results from "components/Results";

import { formatDateLongMonth } from "services/date.js";
import { getProjectPath } from "services/navigation";

import { TABLE_DEFAULTS } from "constants/filters";

const useStyles = makeStyles()((theme) => ({
	container: {
		backgroundColor: "#FFFFFF",
	},
	error: {
		padding: "1rem 3rem",
		color: theme.palette.error.main,
	},
	info: {
		padding: "1rem 3rem",
	},
}));

const UpdatesResults = () => {
	const { isSearching, searchTerm, selectedFilters } = useSearch();
	const [order, setOrder] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER);
	const [orderBy, setOrderBy] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER_BY);
	const [pageNum, setPageNum] = useState(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	const [pageSize, setPageSize] = useState(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);

	const { classes } = useStyles();
	const tableColumns = [
		{
			name: "Project Name",
			value: "projectName",
			sortName: "project.name",
			isLink: true,
			linkValue: "projectLink",
		},
		{
			name: "Current Project Phase",
			value: "phaseName",
			sortName: "phaseName",
		},
		{
			name: "Type of Update",
			value: "type",
			sortName: "type",
		},
		{
			name: "Update Publish Date",
			value: "dateAdded",
			sortName: "dateAdded",
		},
	];

	const tableParameters = {
		pageNum,
		pageSize,
		sortBy: {
			order: order,
			orderBy: orderBy,
		},
	};

	const { data: listsData = [{ searchResults: [] }] } = useLists({ enabled: true });
	const constantList = useMemo(
		() =>
			listsData[0].searchResults.map(({ _id, name }) => ({
				name,
				key: _id,
			})),
		[listsData],
	);

	const {
		isLoading,
		isError,
		isSuccess,
		data: updatesData = [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
	} = useUpdates(searchTerm, selectedFilters, tableParameters, { enabled: isSearching });

	const updates = useMemo(() => {
		const getConstant = (id) => {
			const constant = constantList.find((constant) => constant.key === id);
			return constant ? constant.name : "";
		};
		return updatesData[0].searchResults.map(({ _id, complianceAndEnforcement, dateAdded, project, type }) => ({
			dateAdded: formatDateLongMonth(new Date(dateAdded)),
			key: _id,
			phaseName: getConstant(project.currentPhaseName),
			projectId: project._id,
			projectLink: getProjectPath(project._id),
			projectName: project.name,
			type: complianceAndEnforcement ? `${type} / C&E` : type,
		}));
	}, [constantList, updatesData]);

	const metaData = useMemo(() => updatesData[0].meta, [updatesData]);

	useEffect(() => {
		setPageSize(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);
		setPageNum(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	}, [isSearching]);

	return (
		<div className={classes.container}>
			{isLoading && (
				<div aria-live="polite" className={classes.info}>
					{" "}
					Searching...
				</div>
			)}
			{isError && <div className={classes.error}>Error searching Updates.</div>}
			{isSuccess && updates.length === 0 && <div className={classes.info}>No results found for "{searchTerm}".</div>}
			{isSuccess && updates.length > 0 && isSearching && searchTerm && (
				<Results
					columns={tableColumns}
					data={updates}
					onRowClick={(row) => window.open(getProjectPath(row.key))}
					order={order}
					orderBy={orderBy}
					pageNum={pageNum}
					pageSize={pageSize}
					setOrder={setOrder}
					setOrderBy={setOrderBy}
					setPageNum={setPageNum}
					setPageSize={setPageSize}
					totalResultCount={metaData.length > 0 ? metaData[0].searchResultsTotal : 0}
				/>
			)}
		</div>
	);
};

export default UpdatesResults;
