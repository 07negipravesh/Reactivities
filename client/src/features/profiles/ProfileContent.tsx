import { Box, Paper, Tab, Tabs } from "@mui/material";
import { type SyntheticEvent, useState } from "react";
import ProfilePhotos from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";
import ProfileFollowings from "./ProfileFollowings";
import ProfileActivities from "./ProfileActivities";

export default function ProfileContent() {
    const [value, setValue] = useState(0);

    // Summary: This section updates the active tab and renders its matching panel;
    // e.g., clicking "Photos" switches to the photos view.
    // Create a handler that reacts to tab clicks; e.g., user picks tab 2.
    const handleChange = (_: SyntheticEvent, newValue: number) => {
        // Store the newly selected tab index in state; e.g., setValue(2).
        setValue(newValue); 
    };

    // Define the tabs and their panels in one list; e.g., index 0 maps to About
    // content.
    const tabContent = [
        // Add the About tab with its component; e.g., label "About" shows
        // ProfileAbout.
        { label: 'About', content: <ProfileAbout /> },
        // Add the Photos tab with its component; e.g., label "Photos" shows
        // ProfilePhotos.
        { label: 'Photos', content: <ProfilePhotos /> },
        // Add the Events tab with its component; e.g., label "Events" shows
        // ProfileActivities.
        { label: 'Events', content: <ProfileActivities />},
        // Add the Followers tab and pass the active tab index; e.g., value 3
        // highlights Followers.
        { label: 'Followers', content: <ProfileFollowings activeTab={value} /> },
        // Add the Following tab and pass the active tab index; e.g., value 4
        // highlights Following.
        { label: 'Following', content: <ProfileFollowings activeTab={value} />  }
    ];

    // Return the layout for the tabs and content area; e.g., a vertical tab list
    // with a panel.
    return (
        // Wrap the area in a styled Box using Paper; e.g., a card-like
        // container.
        <Box
            // Render this Box as a Paper element; e.g., use Paper styling.
            component={Paper}
            // Add top margin for spacing; e.g., mt={2} adds space above.
            mt={2}
            // Add inner padding for breathing room; e.g., p={3} adds padding.
            p={3}
            // Use a Paper elevation for shadow; e.g., elevation 3 shows depth.
            elevation={3}
            // Fix the height of the container; e.g., 500px tall panel.
            height={500}
            // Set flex layout and rounded corners; e.g., side-by-side tabs and
            // content.
            sx={{ display: 'flex', alignItems: 'flex-start', borderRadius: 3 }}
        >
            {/*  // Render a vertical, scrollable tab list; e.g., left-side
                // navigation. */}
            <Tabs
                // Stack tabs vertically; e.g., a column of tabs.
                orientation="vertical"
                // Allow scrolling if tabs overflow; e.g., many tabs still accessible.
                variant="scrollable"
                // Bind the active tab index; e.g., value 1 selects Photos.
                value={value}
                // Update state when a tab changes; e.g., clicking a tab calls
                // handleChange.
                onChange={handleChange}
                // Add a right border and size; e.g., 200px wide tab rail.
                sx={{ borderRight: 1, height: 450, minWidth: 200 }}
            >
            {/*   // Loop over each tab definition to render a Tab; e.g., create
                // 5 tabs. */}
                {tabContent.map((tab, index) => (
                    // Render one tab with a label; e.g., label "About" for index
                    // 0.
                    <Tab key={index} label={tab.label} sx={{mr: 3}} />
                ))}
            </Tabs>
            {/*  // Render the content area beside the tabs; e.g., right-side
                // panel. */}
            <Box sx={{ flexGrow: 1, p: 3, pt: 0 }}>
                {/* // Show the panel for the active tab; e.g., value 2 shows
                    // Events. */}
                {tabContent[value].content}
            </Box>
        </Box>
    )
}