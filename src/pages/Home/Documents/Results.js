import { useEffect, useMemo, useState } from "react";
import { makeStyles } from "tss-react/mui";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { useSearch } from "contexts/Search";

import useDocuments from "queries/useDocuments";
import useLists from "queries/useLists";

import Results from "components/Results";

import { formatDateLongMonth } from "services/date";
import { getDocumentDownloadLink, getProjectPath } from "services/navigation";

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

const DocumentResults = () => {
	const { isSearching, searchTerm, selectedFilters } = useSearch();
	const [order, setOrder] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER);
	const [orderBy, setOrderBy] = useState(TABLE_DEFAULTS.DEFAULT_SORT.DEFAULT_ORDER_BY);
	const [pageNum, setPageNum] = useState(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	const [pageSize, setPageSize] = useState(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);

	const { classes } = useStyles();

	const tableColumns = [
		{
			name: "Document Name",
			value: "displayName",
			sortName: "displayName",
		},
		{
			name: "Project Name",
			value: "project",
			sortName: "project.name",
			isLink: true,
			linkValue: "projectLink",
		},
		{
			name: "Document Type",
			value: "type",
			sortName: "type",
		},
		{
			name: "Author",
			value: "documentAuthorType",
			sortName: "documentAuthorType",
		},
		{
			name: "Document Date",
			value: "datePosted",
			sortName: "datePosted",
		},
		{
			name: "Project Phase",
			value: "projectPhase",
			sortName: "projectPhase",
		},
		{
			name: "Download",
			value: "downloadIcon",
			sortName: "",
			isLink: true,
			linkValue: "downloadLink",
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
		data: documentsData = [{ searchResults: [], meta: [{ searchResultsTotal: 0 }] }],
	} = useDocuments(searchTerm, selectedFilters, tableParameters, { enabled: isSearching });

	const documents = useMemo(() => {
		const getConstant = (id) => {
			const constant = constantList.find((constant) => constant.key === id);
			return constant ? constant.name : "";
		};

		return documentsData[0].searchResults.map(
			({
				_id,
				datePosted,
				displayName,
				documentAuthorType,
				documentFileName,
				internalOriginalName,
				project,
				projectPhase,
				type,
			}) => ({
				datePosted: formatDateLongMonth(new Date(datePosted)),
				displayName,
				documentAuthorType: getConstant(documentAuthorType),
				downloadIcon: <FileDownloadOutlinedIcon />,
				downloadLink: getDocumentDownloadLink(displayName, documentFileName, _id, internalOriginalName),
				key: _id,
				project: project.name,
				projectLink: getProjectPath(project._id),
				projectPhase: getConstant(projectPhase),
				type: getConstant(type),
			}),
		);
	}, [documentsData, constantList]);

	const metaData = useMemo(() => documentsData[0].meta, [documentsData]);

	useEffect(() => {
		setPageSize(TABLE_DEFAULTS.DEFAULT_PAGE_SIZE);
		setPageNum(TABLE_DEFAULTS.DEFAULT_CURRENT_PAGE);
	}, [isSearching]);

	return (
		<div className={classes.container}>
			{isLoading && (
				<div aria-live="polite" className={classes.info}>
					Searching...
				</div>
			)}
			{isError && <div className={classes.error}>Error searching Documents.</div>}
			{isSuccess && documents.length === 0 && <div className={classes.info}>No results found for "{searchTerm}".</div>}
			{isSuccess && documents?.length > 0 && isSearching && searchTerm && (
				<Results
					columns={tableColumns}
					data={documents}
					onRowClick={(row) => window.open(row.downloadLink, "_blank")}
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

export default DocumentResults;
