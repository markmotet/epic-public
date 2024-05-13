import PropTypes from "prop-types";
import { useMemo } from "react";
import { makeStyles } from "tss-react/mui";

import Button from "@mui/material/Button";

import useRecentActivity from "queries/useRecentActivity";

import UpdateCard from "./UpdateCard";

import { HOME_TAB_KEYS } from "constants/home";

const useStyles = makeStyles()((theme) => ({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "0.625rem",
		padding: "1rem 1rem 1rem 3rem",
		flex: "0 0 66%",
	},
	error: {
		color: theme.palette.error.main,
	},
	header: {
		color: "white",
		display: "flex",
		padding: "3rem, 0.625rem, 0.625rem, 0",
		justifyContent: "space-between",
	},
	headerTitle: {
		fontWeight: 700,
		fontSize: "2rem",
		color: "black",
		margin: "0.625rem 0 0 0",
	},
	line: {
		width: "2.25rem",
		height: "2rem",
		borderBottom: "5px solid #FCBA19",
	},
	updatesButton: {
		alignSelf: "end",
		fontSize: "1.25rem",
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

const UpdatesFeed = ({ onSelectTab }) => {
	const { classes } = useStyles();

	const { isLoading, isError, isSuccess, data = [] } = useRecentActivity();

	const updates = useMemo(
		() =>
			data.map(({ _id, content, dateUpdated, headline, documentUrl, project, pcp }) => ({
				key: _id,
				updateContent: content,
				updateDate: dateUpdated,
				updateName: headline,
				project,
				documentUrl,
				pcp,
			})),
		[data],
	);

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<div>
					<div className={classes.line} />
					<h1 className={classes.headerTitle}>Updates</h1>
				</div>
				<Button
					className={classes.updatesButton}
					color="primary"
					variant="text"
					onClick={() => onSelectTab(HOME_TAB_KEYS.UPDATES)}
				>
					Search all Updates &gt;
				</Button>
			</div>
			<ul aria-label="Updates list" className={classes.cardList}>
				{isLoading && <div aria-live="polite"> Loading...</div>}
				{isError && <div className={classes.error}>Error fetching recent updates.</div>}
				{isSuccess && data.length === 0 && <div>There are no recent updates.</div>}
				{isSuccess &&
					data.length > 0 &&
					updates.map((update) => (
						<li key={update.key}>
							<UpdateCard {...update} />
						</li>
					))}
			</ul>
		</div>
	);
};

UpdatesFeed.propTypes = {
	onSelectTab: PropTypes.func.isRequired,
};

export default UpdatesFeed;
