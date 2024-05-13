import { useMemo } from "react";
import { useState } from "react";
import { makeStyles } from "tss-react/mui";

import { useSearch } from "contexts/Search";

import usePcps from "queries/usePcps";

import Results from "components/Results";

import { formatDateLongMonth } from "services/date.js";
import { getPcpPath, getProjectPath } from "services/navigation";
import { getStatus } from "services/pcp";

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

const CommentPeriodResults = () => {
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
			name: "Project Phase",
			value: "phaseName",
			sortName: "phaseName",
		},
		{
			name: "Public-Comment Period Date",
			value: "dateRange",
			sortName: "dateStarted",
		},
		{
			name: "Status",
			value: "status",
			sortName: "dateStarted",
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

	const {
		isLoading,
		isError,
		isSuccess,
		data = [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
	} = usePcps(searchTerm, selectedFilters, tableParameters, { enabled: isSearching });

	const pcps = useMemo(
		() =>
			data[0].searchResults.map(({ _id, dateCompleted, dateStarted, metURL, phaseName, project }) => ({
				dateRange: `${formatDateLongMonth(new Date(dateStarted))} - ${formatDateLongMonth(new Date(dateCompleted))}`,
				key: _id,
				metURL,
				phaseName,
				projectId: project._id,
				projectLink: getProjectPath(project._id),
				projectName: project.name,
				status: getStatus(dateStarted, dateCompleted),
			})),
		[data],
	);

	const metaData = useMemo(() => data[0].meta, [data]);
	const totalResultCount = metaData.length > 0 ? metaData[0].searchResultsTotal : 0;

	return (
		<div className={classes.container}>
			{isLoading && (
				<div aria-live="polite" className={classes.info}>
					Searching...
				</div>
			)}
			{isError && <div className={classes.error}>Error searching Public Comment Periods.</div>}
			{isSuccess && pcps.length === 0 && <div className={classes.info}>No results found for "{searchTerm}".</div>}
			{isSuccess && pcps.length > 0 && isSearching && searchTerm && (
				<Results
					columns={tableColumns}
					data={pcps}
					onRowClick={(row) => window.open(getPcpPath(row.metURL, row.key, row.projectId))}
					order={order}
					orderBy={orderBy}
					pageNum={pageNum}
					pageSize={pageSize}
					setOrder={setOrder}
					setOrderBy={setOrderBy}
					setPageNum={setPageNum}
					setPageSize={setPageSize}
					totalResultCount={totalResultCount}
				/>
			)}
		</div>
	);
};

export default CommentPeriodResults;
