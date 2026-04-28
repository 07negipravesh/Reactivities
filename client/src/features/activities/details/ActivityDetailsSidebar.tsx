import { Paper, Typography, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip } from "@mui/material";
import { Link } from "react-router";

type Props = {
    activity: Activity
}

// Summary: Shows a sidebar with attendee count and a list of attendees, including “Following” and “Host” badges; example: if 3 users joined, it shows “3 people going” and marks the host.
export default function ActivityDetailsSidebar({ activity }: Props) { // Defines the sidebar component that receives one activity; example: <ActivityDetailsSidebar activity={activity} />.
    return ( // Returns the sidebar JSX UI; example: return (<Paper>...</Paper>).
        <> {/* Uses a fragment to return multiple root elements; example: count card + attendee list. */}
            <Paper // First card displays attendee count summary.
                sx={{ // Starts style object for the summary card.
                    textAlign: 'center', // Centers text for clean heading layout; example: “5 people going” centered.
                    border: 'none', // Removes default paper border; example: flat look.
                    backgroundColor: 'primary.main', // Uses primary theme color as background; example: app primary blue.
                    color: 'white', // Makes text readable on dark background; example: white heading text.
                    p: 2, // Adds inner spacing around content; example: theme padding 2.
                }} // Ends style object for summary card.
            > {/* Opens summary card content area. */}
                <Typography variant="h6"> {/* Displays count in heading style; example: medium-large text. */}
                    {activity.attendees.length} people going {/* Shows total attendee count; example: “12 people going”. */}
                </Typography> {/* Ends attendee count text. */}
            </Paper> {/* Ends summary card block. */}
            <Paper sx={{ padding: 2 }}> {/* Second card wraps full attendee list; example: list container with padding. */}
                {activity?.attendees.map(a => ( // Loops through each attendee to render one row; example: renders row for each user.
                    <Grid key={a.id} container alignItems="center"> {/* Creates a row container for one attendee; example: row keyed by user id. */}
                        <Grid size={8}> {/* Left column takes more width for profile info; example: 8/12 grid columns. */}
                            <List sx={{ display: 'flex', flexDirection: 'column' }}> {/* Uses list structure for attendee item; example: vertical list layout. */}
                                <ListItem component={Link} to={`/profiles/${a.id}`}> {/* Makes attendee row clickable to profile; example: /profiles/user-1. */}
                                    <ListItemAvatar> {/* Wraps avatar area for list alignment; example: image slot in row. */}
                                        <Avatar // Renders attendee profile picture.
                                            variant="rounded" // Uses rounded avatar shape style; example: rounded square avatar.
                                            alt={a.displayName + ' image'} // Provides accessible alt text; example: “Alex image”.
                                            src={a.imageUrl} // Sets avatar image URL from attendee data; example: https://.../avatar.jpg.
                                            sx={{ width: 75, height: 75, mr: 3 }} // Sets avatar size and right margin; example: 75x75 with spacing.
                                        /> {/* Ends avatar element. */}
                                    </ListItemAvatar> {/* Ends avatar wrapper. */}
                                    <ListItemText> {/* Wraps attendee name and badges text block. */}
                                        <Typography variant="h6">{a.displayName}</Typography> {/* Shows attendee display name; example: “Jordan”. */}
                                        {a.following && ( // Conditionally shows “Following” when current user follows attendee; example: true -> show badge text.
                                            <Typography variant="body2" color="orange"> {/* Styles follow indicator text; example: small orange label. */}
                                                Following {/* Displays following marker text; example: “Following”. */}
                                                {/* Ends following text element. */}
                                            </Typography>
                                        )}  {/* // Ends following conditional block. */} 
                                    </ListItemText> {/* Ends attendee text content block. */}
                                </ListItem> {/* Ends clickable attendee list item. */}
                            </List> {/* Ends list wrapper. */}
                        </Grid> {/* Ends left column. */}
                        <Grid size={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}> {/* Right column aligns status chip to the right; example: host badge area. */}
                            {a.id === activity.hostId && ( // Shows host chip only for attendee who is host; example: matching id -> show host tag.
                                <Chip // Renders host status chip.
                                    label="Host" // Text label for host role; example: Host.
                                    color="warning" // Uses warning color for emphasis; example: amber chip.
                                    variant='filled' // Uses filled chip style for stronger visibility; example: solid background chip.
                                    sx={{ borderRadius: 2 }} // Rounds chip corners slightly; example: softer pill shape.
                                /> // Ends host chip element.
                            )}  {/* // Ends host conditional block. */} 

                        </Grid> {/* Ends right column. */}
                        {/* Ends one attendee row. */}
                    </Grid>
                ))}   {/* // Ends attendees map loop. */} 
            </Paper> {/* Ends attendee list card. */}
        </>
    ); // Ends return statement.
} // Ends component function.