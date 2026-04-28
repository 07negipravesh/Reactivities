import AccessTime from "@mui/icons-material/AccessTime";
import Place from "@mui/icons-material/Place";
import { Avatar, Box, Button, Card, CardContent, CardHeader, Chip, Divider, Typography } from "@mui/material";
import { Link } from "react-router";
import { formatDate } from "../../../lib/util/util";
import AvatarPopover from "../../../app/shared/components/AvatarPopover";

type Props = {
    activity: Activity;
}

/* KNW_REACT:-This block renders one activity card; e.g., for "Yoga Class" it shows host, time, venue, attendees, and a View button. */
export default function ActivityCard({ activity }: Props) { // Render an activity card for a single activity.
    const label = activity.isHost ? 'You are hosting' : 'You are going'; // Example: host sees "You are hosting".
    const color = activity.isHost ? 'secondary' : activity.isGoing ? 'warning' : 'default'; // Example: going uses warning color.

    return ( // Return the card UI.
        <Card elevation={3} sx={{ borderRadius: 3 }}> {/* Example: raised card with rounded corners. */}
            <Box display='flex' alignItems='center' justifyContent='space-between'> {/* Example: header row split left/right. */}
                <CardHeader // Card header containing avatar and title.
                    avatar={<Avatar sx={{ height: 80, width: 80 }}  // Example: large host avatar.
                        src={activity.hostImageUrl}  // Example: host image URL used here.
                        alt='Image of host' // Example: alt text for accessibility.
                    />} // Close avatar element.
                    title={activity.title} // Example: "Yoga Class" title.
                    slotProps={{ // Customize title text style.
                        title: {
                            fontWeight: 'bold', // Example: bold title.
                            fontSize: 20 // Example: 20px title size.
                        }
                    }}
                    subheader={ // Subheader showing host link.
                        <>
                            Hosted by{' '}  {/*Example: prefix text.*/}
                            <Link to={`/profiles/${activity.hostId}`}>Bob</Link> {/* Example: link to host profile. */}
                        </>
                    }
                />
                <Box display='flex' flexDirection='column' gap={2} mr={2}> {/* Example: right-side badges column. */}
                    {(activity.isHost || activity.isGoing) && <Chip label={label} variant="outlined" color={color} sx={{ borderRadius: 2 }} />} {/* Example: show "You are going" chip. */}
                    {activity.isCancelled && <Chip label='Cancelled' color='error' sx={{ borderRadius: 2 }} />} {/* Example: show Cancelled chip if true. */}
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} /> {/* Example: space-separated divider. */}
            <CardContent sx={{ p: 0 }}> {/* Example: zero padding for tight layout. */}
                <Box display="flex" alignItems="center" mb={2} px={2}> {/* Example: date/venue row. */}
                    <Box display='flex' flexGrow={0} alignItems='center'> {/* Example: time group. */}
                        <AccessTime sx={{ mr: 1 }} /> {/* Example: clock icon. */}
                        <Typography variant="body2" noWrap> {/* Example: small text no wrap. */}
                            {formatDate(activity.date)} {/* Example: formatted date shown here. */}
                        </Typography>
                    </Box>

                    <Place sx={{ ml: 3, mr: 1 }} /> {/* Example: location icon. */}
                    <Typography variant="body2">{activity.venue}</Typography> {/* Example: "Central Park" venue. */}
                </Box>
                <Divider /> {/* Example: divider before attendees. */}
                <Box display='flex' gap={2} sx={{ backgroundColor: 'grey.200', py: 3, pl: 3 }}> {/* Example: attendee strip. */}
                    {activity.attendees.map(a => ( // Render each attendee avatar.
                        <AvatarPopover profile={a} key={a.id} /> // Example: attendee avatar with popover.
                    ))}
                </Box>
            </CardContent>
            <CardContent sx={{ paddingBottom: 3 }}> {/* Example: description block. */}
                <Typography variant="body2"> {/* Example: description text. */}
                    {activity.description} {/* Example: "Morning yoga session". */}
                </Typography>
                <Button // View button linking to activity details.
                    component={Link} // Example: render as Link.
                    to={`/activities/${activity.id}`} // Example: navigate to activity detail route.
                    variant="contained" // Example: filled button style.
                    color="primary" // Example: primary color button.
                    sx={{ display: 'flex', justifySelf: 'self-end', borderRadius: 3 }} // Example: align and round button.
                >
                    View
                </Button>
            </CardContent>
        </Card>
    )
}