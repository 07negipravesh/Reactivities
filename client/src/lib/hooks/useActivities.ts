import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import { useAccount } from "./useAccount";
import { useStore } from "./useStore";

export const useActivities = (id?: string) => {
    const queryClient = useQueryClient();
    const location = useLocation();
    const { currentUser } = useAccount();
    const {activityStore: {filter, startDate}} = useStore();

    /* KNW_REACT:-This uses React Query’s useInfiniteQuery to load activities in pages 
                  (infinite scroll style) and shape the data for the UI.
    */
    const { data: activitiesGroup, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =  // Get paged data and pagination controls.
    useInfiniteQuery<PagedList<Activity, string>>({ // Infinite query for activities with cursor paging.
        queryKey: ['activities', filter, startDate], // Cache key varies by filter and start date.
        queryFn: async ({ pageParam = null }) => { // Fetch a page using the cursor param.

            const response = await agent.get<PagedList<Activity, string>>('/activities', { // Call API for activities page.
                params: { // Send cursor paging and filters.
                    cursor: pageParam, // Cursor for the next page.
                    pageSize: 3, // Fixed page size.
                    filter, // Activity filter value.
                    startDate // Start date filter.
                }
            });
            return response.data; // Use response payload as page data.
        },
        placeholderData: keepPreviousData, // Keep previous pages visible while fetching.
        initialPageParam: null, // Start with a null cursor.
        getNextPageParam: (lastPage) => lastPage.nextCursor, // Use next cursor from last page.
        enabled: !id && location.pathname === '/activities' && !!currentUser, // Only run on list route with a user.
        select: (data) => ({ // Transform each activity for UI-friendly fields.
            ...data, // Preserve top-level query data.
            pages: data.pages.map((page) => ({ // Map through each page.
                ...page, // Preserve page metadata.
                items: page.items.map((activity) => { // Map each activity in the page.
                    const host = activity.attendees.find((x) => x.id === activity.hostId); // Find the host attendee.
                    return { // Return activity with derived flags.
                        ...activity, // Keep original activity fields.
                        isHost: currentUser?.id === activity.hostId, // Mark if current user is host.
                        isGoing: activity.attendees.some((x) => x.id === currentUser?.id), // Mark if current user is attending.
                        hostImageUrl: host?.imageUrl, // Attach host image URL.
                    };
                }),
            })),
        }) 
    });

    /* KNW_REACT:-This block fetches one activity by id, then shapes the
       result for the UI. */
    // Query a single activity by id.
    const { isLoading: isLoadingActivity, data: activity } = useQuery<Activity>({
        // Cache key scoped to the activity id.If ['activities', id] change or
        // refresh the url then only queryFn will get called and api call will
        // go to server.
        queryKey: ['activities', id],
        // Fetch the activity details.
        queryFn: async () => {

            // Call API for the activity.
            const response = await agent.get<Activity>(`/activities/${id}`);
            // Use response payload as activity data.
            return response.data;
        },
        /* enabled:
            Only run queryFn when id and current user exist.
            (*)So this line prevents calling /activities/${id} too early, such as:-
            (*)before route params load (id undefined),
            (*)or before auth/user is loaded (currentUser null).
         */
        enabled: !!id && !!currentUser,
        /* select: clause runs on click of "Cancel Attendencae","Join Activity" etc. 
            but queryFn will not triggered because query data/observer state is being 
            re-processed for UI (especially after cache updates and re-renders).
        */
        // Select transforms the raw API data before it reaches the UI.
        select: data => {

            // Identify the host attendee from the list.
            const host = data.attendees.find(x => x.id === data.hostId);
            // Return a new activity object with derived UI flags.
            return {
                // Preserve original activity fields.
                ...data,
                // Derived flag: current user is the host.
                isHost: currentUser?.id === data.hostId,
                // Derived flag: current user is attending.
                isGoing: data.attendees.some(x => x.id === currentUser?.id),
                // Derived field: host image for display.
                hostImageUrl: host?.imageUrl
            }
        }
    });    

    /* KNW_REACT:-This block updates an activity and, on success, refreshes its cached query. */
    const updateActivity = useMutation({ // Create a mutation for updating an activity.
        mutationFn: async (activity: Activity) => { // Mutation function receives the activity to update.
            await agent.put(`/activities/${activity.id}`, activity); // Send PUT request with updated activity data.
        },
        onSuccess: async () => { // After a successful update, trigger cache refresh logic.
            await queryClient.invalidateQueries({ // Mark the matching query as stale to refetch fresh data.
                queryKey: ['activities', activity?.id] // Target the single-activity cache entry by id.
            })
        }
    });

   // Summary: Creates a new activity on the server, then refreshes
   // activity-list cache so UI shows latest data.
   // Example: after creating “React Meetup”, the activities list updates.
    const createActivity = useMutation({
        // Defines a mutation for creating a new activity.
        // Example: createActivity.mutate(formValues).
        mutationFn: async (activity: Activity) => {
            // Runs the API call that creates the activity.
            // Example: send one Activity object to backend.
            const response = await agent.post('/activities', activity);
            // Sends POST request with activity payload.
            // Example: POST /activities { title: "Yoga" }.
            return response.data;
            // Returns created activity data from API response.
            // Example: returns object with generated id.
        }, // Ends mutation function definition.
        onSuccess: async () => {
            // Runs after create API succeeds to refresh related cached data.
            // Example: success callback after POST 200.
          /* Why used here:-
            (*)after creating a new activity, cached activity lists/details may be outdated.
            (*)invalidation triggers refresh so the new activity appears without manual reload.     
            
            Example:-
            you create “Yoga Class” → mutation succeeds → this invalidates ['activities', ...] 
            queries → activities list refetches and shows “Yoga Class”.                        
          */ 
            await queryClient.invalidateQueries({
                // Marks matching queries stale so they refetch fresh data.
                // Example: trigger list refresh.
                queryKey: ['activities']
                // Targets all queries starting with 'activities'.
                // Example: list page query gets refreshed.
            }) // Ends invalidate call.
        } // Ends success handler.
    }) // Ends createActivity mutation setup.

    // Summary: This mutation deletes one activity on the server, then refreshes
    // activity queries so the deleted item disappears from the UI.
    // Example: If id = "a1", it calls DELETE /activities/a1 and then reloads
    // the activities list.
    // Create a delete mutation so this logic runs through React Query
    // mutation flow.
    // Example: Calling deleteActivity.mutate("a1") starts the delete process.
    const deleteActivity = useMutation({
        // Define the async function that receives the activity id to
        // delete.
        // Example: id could be "12345" from a delete button click.
        mutationFn: async (id: string) => {
            // Send DELETE request to remove that activity from backend
            // storage.
            // Example: DELETE /activities/12345 removes activity 12345.
            await agent.delete(`/activities/${id}`);
        },
        // Run this after successful deletion to sync UI with latest
        // server data.
        // Example: After delete succeeds, list page fetches fresh activities.
        onSuccess: async () => {
            // Mark activities queries as stale so React Query refetches
            // updated list data.
            // Example: Cached ["activities"] list is refreshed without
            // manual page reload.
            await queryClient.invalidateQueries({
                // Target all queries that start with the "activities"
                // key.
                // Example: Activities list query with this key gets invalidated.
                queryKey: ['activities']
            })
        }
    })

    /* KNW_REACT:-This block optimistically toggles attendance; e.g., click Attend and your name appears instantly, then rolls back if the API fails. */
    const updateAttendance = useMutation({ // Create a mutation for attending/unattending an activity.
        /* KNW_REACT :-Call order is: 
                         onMutate (optimistic cache update) first we wills ee thing in UI level
                       → mutationFn (real API call to /activities/{id}/attend)  Second we will see thing in database level to happened
                       → onSuccess or onError.        
        */

        //mutationFn calls agent.post(...) to toggle attendance.
        mutationFn: async (id: string) => { // Mutation function receives the activity id.

            await agent.post(`/activities/${id}/attend`); // Call API to toggle attendance.
        },
        //onMutate updates cache instantly so the UI feels fast, and saves prevActivity to restore if request fails.
        onMutate: async (activityId: string) => { // Optimistically update cache before server responds.

            await queryClient.cancelQueries({ queryKey: ['activities', activityId] }); // Cancel in-flight queries for this activity.

            const prevActivity = queryClient.getQueryData<Activity>(['activities', activityId]); // Snapshot previous activity for rollback.

            queryClient.setQueryData<Activity>(['activities', activityId], oldActivity => { // Update cached activity optimistically.
                if (!oldActivity || !currentUser) { // Guard against missing data or user.
                    return oldActivity; // Keep previous cache if we cannot update.
                }

                const isHost = oldActivity.hostId === currentUser.id; // Check if current user is host.
                const isAttending = oldActivity.attendees.some(x => x.id === currentUser.id); // Check if current user is attending.

                return { // Return updated activity with new attendance state.
                    ...oldActivity, // Preserve existing activity fields.
                    isCancelled: isHost ? !oldActivity.isCancelled : oldActivity.isCancelled, // Hosts toggle cancel state.
                    attendees: isAttending // If attending, remove (unless host); otherwise add user.
                        ? isHost
                            ? oldActivity.attendees // Host stays in attendee list.
                            : oldActivity.attendees.filter(x => x.id !== currentUser.id) // Remove current user.
                        : [...oldActivity.attendees, { // Add current user to attendee list.
                            id: currentUser.id, // Set current user id.
                            displayName: currentUser.displayName, // Set current user name.
                            imageUrl: currentUser.imageUrl, // Set current user image.
                        }],
                };
            });

            return { prevActivity }; // Return snapshot for rollback in onError.
        },
        onError: (error, activityId, context) => { // Roll back optimistic update on error.
            console.error('Error updating attendance:', error); // Log the error for debugging.

            if (context?.prevActivity) { // If we captured previous state, restore it.
                queryClient.setQueryData(['activities', activityId], context.prevActivity); // Revert cache to previous activity.
            }
        }
    })

    return {
        activitiesGroup,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isLoading,
        updateActivity,
        createActivity,
        deleteActivity,
        activity,
        isLoadingActivity,
        updateAttendance
    }
}
