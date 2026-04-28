import CalendarToday from "@mui/icons-material/CalendarToday";
import Info from "@mui/icons-material/Info";
import Place from "@mui/icons-material/Place";
import { Box, Button, Divider, Grid, Paper, Typography } from "@mui/material";
import { formatDate } from "../../../lib/util/util";
import { useState } from "react";
import MapComponent from "../../../app/shared/components/MapComponent";

type Props = {
    activity: Activity
}

// Summary: Renders activity info sections (description, date, location) and toggles a map view; example: click “Show Map” to display the venue map, then click “Hide Map” to close it.
export default function ActivityInfo({activity}: Props) { // Defines the info component for one activity; example: <ActivityInfo activity={activity} />.
    const [mapOpen, setMapOpen] = useState(false); // Stores whether the map is visible; example: false means map hidden.
    return ( // Returns the info panel UI; example: return (<Paper>...</Paper>).
        <Paper sx={{ mb: 2 }}> {/* Wraps the full info block in a paper card; example: one card with spacing below. */}

            <Grid container alignItems="center" pl={2} py={1}> {/* Row for description with icon + text; example: info icon and description line. */}
                <Grid size={1}> {/* Narrow column for the icon; example: 1/12 width. */}
                    <Info color="info" fontSize="large" /> {/* Info icon helps users identify details section; example: blue info symbol. */}
                </Grid> {/* Ends description icon column. */}
                <Grid size={11}> {/* Wide column for description content; example: 11/12 width text area. */}
                    <Typography>{activity.description}</Typography> {/* Shows the activity description text; example: “Morning jogging session”. */}
                </Grid> {/* Ends description text column. */}
            </Grid> {/* Ends description row. */}
            <Divider /> {/* Visual separator between description and date rows; example: horizontal line. */}
            <Grid container alignItems="center" pl={2} py={1}> {/* Row for date with calendar icon; example: date line in details card. */}
                <Grid size={1}> {/* Icon column for date row; example: small left column. */}
                    <CalendarToday color="info" fontSize="large" /> {/* Calendar icon indicates date info; example: blue calendar icon. */}
                </Grid> {/* Ends date icon column. */}
                <Grid size={11}> {/* Text column for formatted date; example: right side date text. */}
                    <Typography>{formatDate(activity.date)}</Typography> {/* Formats and shows activity date; example: “04 Mar 2026”. */}
                </Grid> {/* Ends date text column. */}
            </Grid> {/* Ends date row. */}
            <Divider /> {/* Separator before location section; example: line between date and place. */}

            <Grid container alignItems="center" pl={2} py={1}> {/* Row for location and map toggle button; example: venue + city + show map action. */}
                <Grid size={1}> {/* Left icon column for location; example: 1/12 width marker area. */}
                    <Place color="info" fontSize="large" /> {/* Place icon signals location details; example: map pin icon. */}
                </Grid> {/* Ends location icon column. */}
                <Grid size={11} display='flex' justifyContent='space-between' alignItems='center'> {/* Right column spaces text and button apart; example: location left, button right. */}
                    <Typography> {/* Wraps venue and city text; example: readable location line. */}
                        {activity.venue}, {activity.city} {/* Displays exact venue and city; example: “Central Park, New York”. */}
                    </Typography> {/* Ends location text. */}
                    {/* Toggle button for showing or hiding the map; example: click to show/hide venue map. */}
                    <Button
                        sx={{whiteSpace: 'nowrap', mx: 2}} // Keeps text on one line and adds horizontal margin; example: “Show Map” doesn’t wrap.
                        onClick={() => setMapOpen(!mapOpen)}
                    >
                        {mapOpen ? 'Hide Map' : 'Show Map'} {/* Changes label based on current state; example: open=true shows “Hide Map”. */}
                    </Button> {/* Ends map toggle button. */}
                </Grid> {/* Ends location content column. */}
            </Grid> {/* Ends location row. */}
            {mapOpen && ( // Renders map only when mapOpen is true; example: true -> map appears.
                <Box sx={{height: 400, zIndex: 1000, display: 'block'}}> {/* Container for map with fixed height; example: 400px tall map area. */}
                    <MapComponent // Reusable map component for venue location.
                        position={[activity.latitude, activity.longitude]} // Passes latitude and longitude coordinates; example: [40.7128, -74.0060].
                        venue={activity.venue} // Passes venue name for map marker/popup; example: “Central Park”.
                    />
                    {/* Ends map component render. */}
                    {/* Ends map container box. */}
                </Box>

            )} {/* // Ends conditional map rendering block. */} 
            {/* Ends outer info paper card. */}
        </Paper>
    ) // Ends return expression.
} // Ends ActivityInfo component.