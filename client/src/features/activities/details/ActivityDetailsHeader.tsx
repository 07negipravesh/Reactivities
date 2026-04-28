import { Card, CardMedia, Box, Typography, Chip } from "@mui/material";
import { Link } from "react-router";
import { formatDate } from "../../../lib/util/util";
import { useActivities } from "../../../lib/hooks/useActivities";
import StyledButton from "../../../app/shared/components/StyledButton";

type Props = {
    activity: Activity
}

// Summary: Renders an activity header with image, host info, and action buttons based on host/attendee status; example: a host sees “Cancel Activity”, while a user sees “Join Activity”.
export default function ActivityDetailsHeader({activity}: Props) { // Creates the header component using one activity object; example: <ActivityDetailsHeader activity={activity} />.
    const { updateAttendance } = useActivities(activity.id); // Gets mutation helpers to join/cancel/reactivate attendance; example: updateAttendance.mutate("id-1").

    return ( // Returns the JSX layout for this header; example: return <Card>...</Card>.
        <Card sx={{ position: 'relative', mb: 2, backgroundColor: 'transparent', overflow: 'hidden' }}> {/* Main wrapper card for image + overlay content; example: one card containing all header UI. */}
            {activity.isCancelled && ( // Shows next block only if activity is cancelled; example: true -> show badge.
                <Chip // Displays a small status chip; example: “Cancelled” tag.
                    sx={{ position: 'absolute', left: 40, top: 20, zIndex: 1000, borderRadius: 1 }} // Positions chip over the image so it is visible; example: top-left overlay.
                    color="error" // Uses error theme color to signal cancellation; example: red chip style.
                    label="Cancelled" // Sets chip text users read; example: label = Cancelled.
                /> // Ends chip element render; example: chip appears above image.
            )} {/* Ends cancelled conditional block; example: when false, nothing renders here. */}
            <CardMedia // Renders the activity category image; example: music.jpg banner.
                component="img" // Tells CardMedia to output an image tag; example: <img .../>.
                height="300" // Keeps a fixed header image height for consistent UI; example: 300px.
                image={`/images/categoryImages/${activity.category}.jpg`} // Builds image path from category name; example: /images/categoryImages/drinks.jpg.
                alt={`${activity.category} image`} // Adds accessibility text for screen readers; example: "drinks image".
            /> {/* Ends image section; example: banner image shown. */}
            <Box sx={{ // Starts overlay container style object; example: bottom text area over image.
                position: 'absolute', // Places overlay on top of CardMedia; example: floating content layer.
                bottom: 0, // Sticks overlay to card bottom edge; example: footer-style overlay.
                width: '100%', // Makes overlay span full card width; example: from left to right.
                color: 'white', // Sets default text color for readability; example: white title text.
                padding: 2, // Adds inner spacing around text/buttons; example: theme spacing unit 2.
                display: 'flex', // Uses flex layout to align two columns; example: info left, actions right.
                flexDirection: 'row', // Arranges children horizontally; example: side-by-side layout.
                justifyContent: 'space-between', // Pushes columns to opposite sides; example: left and right edges.
                alignItems: 'flex-end', // Aligns bottom of both columns neatly; example: buttons align with text block bottom.
                background: 'linear-gradient(to top, rgba(0, 0, 0, 1.0), transparent)', // Adds dark gradient so text is readable on image; example: black fade at bottom.
                boxSizing: 'border-box', // Includes padding inside width calculation; example: avoids overflow at 100% width.
            }}> {/* Ends style object and opens overlay content; example: overlay now contains title and buttons. */}
                <Box> {/* Wraps title/date/host details together; example: left info column. */}
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{activity.title}</Typography> {/* Shows activity title prominently; example: “City Marathon”. */}
                    <Typography variant="subtitle1">{formatDate(activity.date)}</Typography> {/* Shows formatted activity date; example: “04 Mar 2026”. */}
                    <Typography variant="subtitle2"> {/* Starts host line text style; example: small subtitle text. */}
                        Hosted by <Link to={`/profiles/${activity.hostId}`} style={{ color: 'white', fontWeight: 'bold' }}> {/* Links host name to host profile page; example: /profiles/host-23. */}
                            {activity.hostDisplayName} {/* Displays host display name text; example: “Pravesh”. */}
                        </Link> {/* Ends host profile link; example: clickable name complete. */}
                    </Typography> {/* Ends host subtitle line; example: host info row complete. */}
                </Box> {/* Ends left info column wrapper; example: details block finished. */}

                <Box sx={{ display: 'flex', gap: 2 }}> {/* Wraps action buttons with horizontal gap; example: two spaced buttons. */}
                    {activity.isHost ? ( // Chooses host actions if current user is host; example: true -> manage/cancel buttons.
                        <> {/* Fragment groups multiple host buttons without extra DOM node; example: two sibling buttons. */}
                            <StyledButton // Host control button for cancel/reactivate; example: “Cancel Activity”.
                                variant='contained' // Uses solid filled style for strong action; example: contained button.
                                color={activity.isCancelled ? 'success' : 'error'} // Green when reactivating, red when cancelling; example: cancelled=true -> success.
                                onClick={() => updateAttendance.mutate(activity.id)} // Runs server mutation on click; example: click toggles activity state.
                                loading={updateAttendance.isPending} // Shows loading state during request; example: spinner while pending.
                            > {/* Opens button content area; example: text label comes next. */}
                                {activity.isCancelled ? 'Re-activate Activity' : 'Cancel Activity'} {/* Shows label based on cancel state; example: false -> “Cancel Activity”. */}
                            </StyledButton> {/* Ends host cancel/reactivate button; example: first host action done. */}
                            <StyledButton // Host navigation button to management page; example: “Manage Event”.
                                variant="contained" // Uses same filled style for consistency; example: primary contained button.
                                color="primary" // Applies primary theme color; example: blue button.
                                component={Link} // Makes button act as router link; example: navigation without full reload.
                                to={`/manage/${activity.id}`} // Builds route to manage this activity; example: /manage/act-44.
                                disabled={activity.isCancelled} // Prevents manage action when cancelled; example: cancelled=true disables button.
                            > {/* Opens manage button content; example: label text comes next. */}
                                Manage Event {/* Visible manage button label; example: click to edit/manage event. */}
                            </StyledButton> {/* Ends manage button; example: second host action done. */}
                        </> /* Ends host fragment branch; example: host branch complete. */
                    ) : ( // Otherwise renders attendee action branch; example: non-host user sees join/cancel attendance.
                        <StyledButton // Attendee button to join or cancel attendance; example: “Join Activity”.
                            variant="contained" // Keeps style consistent with other actions; example: solid button.
                            color={activity.isGoing ? 'primary' : 'info'} // Uses primary when already going, info when not; example: isGoing=false -> info.
                            onClick={() => updateAttendance.mutate(activity.id)} // Triggers attendance toggle for attendee; example: click joins/leaves activity.
                            loading={updateAttendance.isPending || activity.isCancelled} // Shows loading and blocks when cancelled; example: pending=true shows loader.
                        > {/* Opens attendee button label area; example: dynamic text below. */}
                            {activity.isGoing ? 'Cancel Attendance' : 'Join Activity'} {/* Switches label based on going status; example: true -> “Cancel Attendance”. */}
                            {/* Ends attendee action button; example: attendee action complete. */}
                        </StyledButton>
                    )} {/*  Ends host/attendee conditional render; example: exactly one branch is shown.  */}
                </Box> {/* Ends actions container on the right; example: button section complete. */}
            </Box> {/* Ends bottom overlay content box; example: gradient section complete. */}
            {/* Ends outer card wrapper; example: full header component UI complete. */}
        </Card>
    ) // Ends returned JSX expression; example: component output finalized.
} // Ends component function definition; example: function closes here.

