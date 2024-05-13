import PropTypes from "prop-types";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { makeStyles } from "tss-react/mui";

import { useSearch } from "contexts/Search";

import useProjects from "queries/useProjects";

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

const ProjectResults = ({ onSearch }) => {
	const { isSearching, searchTerm, selectedFilters } = useSearch();
	const [order, setOrder] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER);
	const [orderBy, setOrderBy] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER_BY);
	const [pageNum, setPageNum] = useState(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	const [pageSize, setPageSize] = useState(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);

	const { classes } = useStyles();
	const tableColumns = [
		{
			name: "Name",
			value: "name",
			sortName: "name",
		},
		{
			name: "Proponent",
			value: "proponent",
			sortName: "proponent.name",
		},
		{
			name: "Type",
			value: "type",
			sortName: "type",
		},
		{
			name: "Date",
			value: "dateUpdated",
			sortName: "dateUpdated",
		},
		{
			name: "Region",
			value: "region",
			sortName: "region",
		},
		{
			name: "Phase",
			value: "currentPhaseName",
			sortName: "currentPhaseName.name",
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
	} = useProjects(searchTerm, selectedFilters, tableParameters, { enabled: isSearching });

	const projects = useMemo(
		() =>
			data[0].searchResults.map(({ _id, currentPhaseName, dateUpdated, name, proponent, region, type }) => ({
				currentPhaseName: currentPhaseName.name,
				dateUpdated: formatDateLongMonth(new Date(dateUpdated)),
				key: _id,
				name,
				proponent: proponent.name,
				region,
				type,
			})),
		[data],
	);

	const metaData = useMemo(() => data[0].meta, [data]);

	useEffect(() => {
		onSearch(isSearching);
		setPageSize(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);
		setPageNum(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	}, [isSearching, onSearch]);

	return (
		<div className={classes.container}>
			{isLoading && (
				<div aria-live="polite" className={classes.info}>
					{" "}
					Searching...
				</div>
			)}
			{isError && <div className={classes.error}>Error searching Projects.</div>}
			{isSuccess && projects.length === 0 && <div className={classes.info}>No results found for "{searchTerm}".</div>}
			{isSuccess && projects.length > 0 && isSearching && searchTerm && (
				<Results
					columns={tableColumns}
					data={projects}
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

ProjectResults.propTypes = {
	onSearch: PropTypes.func.isRequired,
};

export default ProjectResults;
