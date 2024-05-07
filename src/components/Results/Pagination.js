import PropTypes from "prop-types";
import { makeStyles } from "tss-react/mui";

import { Button, Pagination, TablePagination } from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

import { TABLE_DEFAULTS } from "constants/filters.js";

const useStyles = makeStyles()((theme) => ({
	container: {
		display: "flex",
		fontSize: "0.875rem",
		width: "100%",
	},
	subcontainer: {
		display: "flex",
		marginLeft: "auto",
		paddingRight: "2rem",
	},
	pageNavigation: {
		alignItems: "center",
		display: "flex",
	},
	tablePagination: {
		"& .MuiTablePagination-input": {
			fontWeight: 700,
			margin: "auto",
		},
	},
	pageStep: {
		borderRadius: "0.25rem",
		color: theme.palette.text.primary,
		fontSize: "0.875rem",
		lineHeight: "1.5",
		padding: "0.375rem 0.5rem",
	},
	pageJump: {
		borderRadius: "0.25rem",
		height: "1.75rem",
		padding: "0",
		"& svg": {
			fontSize: "1.75rem",
			color: theme.palette.text.primary,
		},
	},
	pagination: {
		"& button.Mui-selected": {
			backgroundColor: "#15446E",
			color: "#FFFFFF",
		},
		"& button.Mui-selected:hover": {
			backgroundColor: "#45749E",
			color: "#FFFFFF",
		},
		"& .MuiPagination-ul": {
			gap: "0.375rem",
		},
	},
}));

const ResultsPagination = ({ pageNum, pageSize, setPageNum, setPageSize, totalResultCount }) => {
	const { classes } = useStyles();

	// MUI Pagination component is 1-indexed
	const pageNumberOffset = 1;
	const isFirstPage = pageNum === 0;
	const isLastPage = pageNum === Math.ceil(totalResultCount / pageSize) - 1;

	const getDisplayedRowsLabel = (count) => {
		const result = count > 1 ? "results" : "result";
		return count < TABLE_DEFAULTS.DEFAULT_ROWS_PER_PAGE[0]
			? `Showing ${count} of ${count} ${result}`
			: `of ${count} ${result}`;
	};

	const getPageNumberOptions = () => {
		// creates the list of page numbers for pagination
		const pageOptions = TABLE_DEFAULTS.DEFAULT_ROWS_PER_PAGE.filter((number) => number <= totalResultCount);
		if (totalResultCount > 0) {
			pageOptions.push({ value: totalResultCount, label: "All" });
		}
		return pageOptions;
	};

	const handleChangeRowsPerPage = (event) => {
		setPageSize(parseInt(event.target.value, 10));
		setPageNum(0);
	};

	return (
		<div className={classes.container}>
			<div className={classes.subcontainer}>
				<TablePagination
					className={classes.tablePagination}
					component="div"
					count={totalResultCount}
					labelRowsPerPage="Showing"
					labelDisplayedRows={({ count }) => getDisplayedRowsLabel(count)}
					page={pageNum}
					onPageChange={setPageNum}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPage={pageSize <= totalResultCount ? pageSize : totalResultCount}
					rowsPerPageOptions={getPageNumberOptions()}
					showFirstButton={false}
					showLastButton={false}
					slotProps={{
						select: {
							IconComponent: KeyboardArrowDownIcon,
						},
						actions: {
							nextButton: {
								style: { display: "none" },
							},
							previousButton: {
								style: { display: "none" },
							},
						},
					}}
				/>
				<div className={classes.pageNavigation}>
					<Button
						aria-label="go to the first page"
						className={classes.pageJump}
						disabled={isFirstPage}
						onClick={() => setPageNum(0)}
						type="button"
					>
						<KeyboardDoubleArrowLeftIcon />
					</Button>
					<Button
						aria-label="go to the previous page"
						className={classes.pageStep}
						disabled={isFirstPage}
						onClick={() => setPageNum(pageNum - 1)}
						type="button"
					>
						Previous
					</Button>
					<Pagination // 1 indexed
						className={classes.pagination}
						count={Math.ceil(totalResultCount / pageSize)}
						hideNextButton={true}
						hidePrevButton={true}
						onChange={(event, newPage) => setPageNum(newPage - pageNumberOffset)}
						page={pageNum + pageNumberOffset}
						shape="rounded"
						size="small"
					/>
					<Button
						aria-label="go to the next page"
						className={classes.pageStep}
						disabled={isLastPage}
						onClick={() => setPageNum(pageNum + 1)}
						type="button"
					>
						Next
					</Button>
					<Button
						aria-label={"go to the last page"}
						className={classes.pageJump}
						disabled={isLastPage}
						onClick={() => setPageNum(Math.ceil(totalResultCount / pageSize) - 1)}
						type="button"
					>
						<KeyboardDoubleArrowRightIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};

ResultsPagination.propTypes = {
	pageNum: PropTypes.number.isRequired,
	pageSize: PropTypes.number.isRequired,
	setPageNum: PropTypes.func.isRequired,
	setPageSize: PropTypes.func.isRequired,
	totalResultCount: PropTypes.number.isRequired,
};

export default ResultsPagination;
