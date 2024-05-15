import { PropTypes } from "prop-types";
import { useMemo } from "react";
import { makeStyles } from "tss-react/mui";

import { Button } from "@mui/material";

import usePcps from "queries/usePcps";

import PcpCard from "./PcpCard";
import pcpImage from "./pcpImage.jpeg";

import { formatDateOnlyISO, subtractDays } from "services/date";

import { HOME_TAB_KEYS } from "constants/home";

const useStyles = makeStyles()((theme) => ({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "0.625rem",
		padding: "1rem 3rem 1rem 1rem",
		flex: "0 0 33%",
		color: theme.palette.text.primary,
		"@media (max-width: 44rem)": {
			flex: "1 0 100%",
			padding: "1rem",
		},
	},
	error: {
		color: theme.palette.error.main,
	},
	header: {
		color: "white",
		display: "flex",
		padding: "4rem, 0.625rem, 0.625rem, 0",
		justifyContent: "space-between",
		width: "100%",
		flexDirection: "column",
	},
	headerTitle: {
		fontWeight: "700",
		fontSize: "1.5rem",
		color: "black",
		margin: "0.625rem 0 0 0",
	},
	line: {
		width: "2.25rem",
		height: "2rem",
		borderBottom: "5px solid #FCBA19",
	},
	subheader: {
		color: theme.palette.text.primary,
		borderBottom: "1px solid #585858",
		paddingBottom: "0.625rem",
	},
	deck: {
		color: "black",
		background: "white",
		display: "flex",
		gap: "0.625rem",
		flexDirection: "column",
		boxShadow: "0.125rem 0.5rem 0.625rem 0 #00000026",
	},
	image: {
		height: "12rem",
		"& img": {
			height: "100%",
			width: "100%",
			objectFit: "cover",
		},
	},
	content: {
		padding: "0 2rem 0 1rem",
	},
	footer: {
		color: "white",
		display: "flex",
		padding: "0.625rem 1rem 0.625rem 0",
		width: "100%",
	},
	pcpButton: {
		fontSize: "1.25rem",
		paddingLeft: "0",
	},
	cardList: {
		display: "flex",
		flexDirection: "column",
		gap: "0.625rem",
		listStyleType: "none",
		marginTop: "0",
		padding: "0",
	},
}));

const PcpFeed = ({ onSelectTab }) => {
	const { classes } = useStyles();

	const thirtyDaysAgo = formatDateOnlyISO(subtractDays(new Date(), 30));
	const recentPcpsFilter = [
		{
			filterKey: "pcpRecent",
			key: thirtyDaysAgo,
		},
	];
	const recentTableParams = {
		pageSize: 1000,
		sortBy: {
			order: "desc",
			orderBy: "dateStarted",
		},
	};

	const {
		isLoading,
		isError,
		isSuccess,
		data = [{ searchResults: [] }],
	} = usePcps("", recentPcpsFilter, recentTableParams, { enabled: true });
	const pcps = useMemo(
		() =>
			data[0].searchResults.map(({ _id, dateCompleted, dateStarted, project }) => ({
				dateCompleted,
				dateStarted,
				key: _id,
				phaseName: project.currentPhaseName.name,
				projectName: project.name,
			})),
		[data],
	);

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<div>
					<div className={classes.line} />
					<h1 className={classes.headerTitle}>Public Comment Periods</h1>
				</div>
			</div>
			<div className={classes.deck}>
				<div className={classes.image}>
					<img alt="Man at computer" aria-hidden="true" src={pcpImage} />
				</div>
				<div className={classes.content}>
					<div className={classes.subheader}>Upcoming, open, and recently closed Public Comment Periods:</div>
					<ul aria-label="Public Comment Period list" className={classes.cardList}>
						{isLoading && <div aria-live="polite">Loading...</div>}
						{isError && <div className={classes.error}>Error fetching recent comment periods.</div>}
						{isSuccess && data[0].searchResults.length === 0 && <div>There are no recent comment periods.</div>}
						{isSuccess &&
							data[0].meta[0]?.searchResultsTotal > 0 &&
							pcps.map((pcp) => (
								<li key={pcp.key}>
									<PcpCard {...pcp} />
								</li>
							))}
					</ul>

					<div className={classes.footer}>
						<Button
							className={classes.pcpButton}
							color="primary"
							variant="text"
							onClick={() => onSelectTab(HOME_TAB_KEYS.PUBLIC_COMMENT_PERIODS)}
						>
							Search all Public Comment Periods &gt;
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

PcpFeed.propTypes = {
	onSelectTab: PropTypes.func.isRequired,
};

export default PcpFeed;
