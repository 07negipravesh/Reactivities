import { Avatar, Popover } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router";
import ProfileCard from "../../../features/profiles/ProfileCard";

type Props = {
    profile: Profile;
}

// Summary: Shows an avatar that links to a profile and opens a hover popover with a profile card; example: when you hover over a user's avatar, a small card appears with their info.
export default function AvatarPopover({ profile }: Props) { // Defines the AvatarPopover component that receives a profile; example: AvatarPopover({ profile: user }).
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); // Stores the element that anchors the popover; example: anchorEl = avatarElement.

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => { // Handles mouse enter to open the popover; example: onMouseEnter triggers open.
        setAnchorEl(event.currentTarget); // Sets the hovered element as the popover anchor; example: anchorEl becomes the Avatar DOM node.
    }; // Ends the open handler definition; example: handler ready for events.

    const handlePopoverClose = () => { // Handles mouse leave to close the popover; example: onMouseLeave triggers close.
        setAnchorEl(null); // Clears the anchor so the popover closes; example: anchorEl = null.
    }; // Ends the close handler definition; example: handler ready for events.

    const open = Boolean(anchorEl); // Converts anchor presence to a boolean open state; example: open = true when anchorEl exists.

    return ( // Starts the JSX output for this component; example: return (<Avatar ... />).
        <> {/*  Uses a fragment to group multiple elements; example: <>...</> wraps Avatar and Popover. */}
            <Avatar // Renders the user's avatar image; example: <Avatar src="/me.png" />.
                src={profile.imageUrl} // Sets the avatar image source from the profile; example: src="/avatars/jane.png".
                component={Link} // Renders the avatar as a link component; example: Avatar behaves like <Link>.
                to={`/profiles/${profile.id}`} // Links to the profile page by id; example: "/profiles/123".
                sx={{ // Starts style overrides for the avatar; example: sx={{ border: 3 }}.
                    border: profile.following ? 3 : 0, // Adds a border if following the user; example: following true -> border 3.
                    borderColor: 'secondary.main' // Uses the theme secondary color for the border; example: borderColor = secondary.
                }} // Ends the style overrides; example: sx closed.
                onMouseEnter={handlePopoverOpen} // Opens popover on hover; example: hover -> open handler runs.
                onMouseLeave={handlePopoverClose} // Closes popover when leaving; example: mouse out -> close handler runs.
            />  {/*  // Ends the Avatar element; example: avatar rendered. */}
            <Popover // Renders the popover that shows the profile card; example: <Popover open={true}>.
                id='mouse-over-popover' // Gives the popover a stable id; example: id="mouse-over-popover".
                sx={{ pointerEvents: 'none', borderRadius: 3 }} // Disables pointer events and rounds corners; example: hover doesn't steal focus.
                open={open} // Controls visibility using the open state; example: open={true} shows it.
                anchorEl={anchorEl} // Anchors the popover to the hovered element; example: anchorEl=avatarElement.
                anchorOrigin={{ // Sets where the popover attaches on the anchor; example: bottom-left of avatar.
                    vertical: 'bottom', // Anchors vertically at the bottom; example: vertical="bottom".
                    horizontal: 'left', // Anchors horizontally at the left; example: horizontal="left".
                }} // Ends anchor origin settings; example: anchorOrigin closed.
                transformOrigin={{ // Sets the popover's transform origin; example: top-left of popover.
                    vertical: 'top', // Aligns transform origin to top; example: vertical="top".
                    horizontal: 'left', // Aligns transform origin to left; example: horizontal="left".
                }} // Ends transform origin settings; example: transformOrigin closed.
                onClose={handlePopoverClose} // Closes popover when it should dismiss; example: clicking away closes it.
                disableRestoreFocus // Prevents focus from being restored; example: focus stays where it was.
            >   {/*  // Ends opening tag of Popover; example: children follow.*/}
                <ProfileCard profile={profile} />   {/*  // Shows the profile details inside; example: card for user info.*/}
            </Popover> {/*  // Ends the Popover element; example: popover closed.*/} 
        </> // Ends the fragment wrapper; example: fragment closed.
    ); // Ends the return statement; example: JSX returned.
} // Ends the component function; example: function complete.