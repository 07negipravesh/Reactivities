import { Box, Card, CardContent, CardMedia, Chip, Divider, Typography } from "@mui/material";
import Person from "@mui/icons-material/Person";
import { Link } from "react-router";

type Props = {
    profile: Profile
}

/* KNW_REACT:-This block renders a clickable profile card; e.g., for "Alice" it shows avatar, name, bio, and followers. */
export default function ProfileCard({ profile }: Props) { // Render one profile card for a user.
    return ( // Return the card UI.
        <Link to={`/profiles/${profile.id}`} style={{ textDecoration: 'none' }}> {/* Example: clicking goes to the profile page. */}
            <Card sx={{ borderRadius: 3, p: 3, maxWidth: 250, textDecoration: 'none' }} elevation={4}> {/* Example: compact card with padding. */}
                <CardMedia // Profile image at the top of the card.
                    component='img' // Example: render as an img tag.
                    src={profile?.imageUrl || '/images/user.png'} // Example: use avatar or fallback image.
                    sx={{ width: '100%', zIndex: 50 }} // Example: full-width image on top.
                    alt={profile.displayName + ' image'} // Example: "Alice image" alt text.
                />
                <CardContent> {/* Example: wrap the text content. */}
                    <Box display='flex' flexDirection='column' gap={1}> {/* Example: stack text vertically. */}
                        <Typography variant="h5">{profile.displayName}</Typography> {/* Example: show "Alice". */}
                        {profile.bio &&
                            <Typography
                                variant="body2" // Example: smaller body text.
                                sx={{
                                    textOverflow: 'ellipsis', // Example: add dots if too long.
                                    overflow: 'hidden', // Example: hide extra text.
                                    whiteSpace: 'nowrap' // Example: keep on one line.
                                }}
                            >
                                {profile?.bio} {/* Example: show short bio line. */}
                            </Typography>}
                        {profile.following &&
                            <Chip size='small' label='Following' color="secondary" variant="outlined" />} {/* Example: show Following badge. */}
                    </Box>

                </CardContent>
                <Divider sx={{ mb: 2 }} /> {/* Example: divider before follower count. */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}> {/* Example: icon + text row. */}
                    <Person /> {/* Example: person icon. */}
                    <Typography sx={{ ml: 1 }}> {/* Example: add left margin for text. */}
                        {profile.followersCount} Followers {/* Example: "120 Followers". */}
                    </Typography>

                </Box>
            </Card>
        </Link>

    )
}