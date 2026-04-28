import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent.ts";
import { useMemo, useState } from "react";
import type { EditProfileSchema } from "../schemas/editProfileSchema.ts";

/* KNW_REACT:-This block defines a custom React hook named useProfile that manages 
                profile-related data and actions; e.g., it fetches a user's profile, 
                photos, followings, and activities, and provides functions to upload photos, 
                set main photo, delete photos, update profile info, and follow/unfollow users.
    (*)export → makes it usable from other files.
    (*)const useProfile = ... → defines a function named useProfile 
                    (by convention, use... means a hook).
    (*)(id?: string, predicate?: string) → it accepts two parameters:
        >>)id is optional and, if provided, must be a string.
        >>)predicate is optional and, if provided, must be a string.
    (*)=> { ... } → arrow function body where the hook logic lives.
    (*)In this hook, id is used to fetch a specific profile, and predicate is used 
        to switch behavior (like follow-list filtering) when provided.
*/
export const useProfile = (id?: string, predicate?: string) => {
    const [filter, setFilter] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Summary: This query fetches one user's profile and tracks loading state,
    // but only runs when an id exists and no predicate is provided.
    // Example: If id is "user-123" and predicate is undefined, it requests
    // /profiles/user-123 and stores the result in profile.

    // This creates a React Query request and extracts fetched data as profile
    // plus loading status as loadingProfile.
    // Example: After calling this, you can use loadingProfile to show a spinner
    // while profile is still loading.
    const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
        
        // This key uniquely identifies this cached query for a specific
        // profile id.
        // Example: ['profile', 'user-123'] stores and reuses that user's profile result.
        /*
            Why it matters:-
            (*)React Query uses this key to store/reuse cached data.
            (*)If id changes, it treats it as a different query and fetches new data.
            (*)You can target this exact query later (e.g., invalidate or update 
               only that profile cache).        
        */        
        queryKey: ['profile', id],
        // This async function defines how to fetch the profile from the API.
        // Example: It runs when React Query decides this query should execute.
        queryFn: async () => {
            // eslint-disable-next-line no-debugger
            debugger;
            // This sends a GET request to the profile endpoint for the
            // given id.
            // Example: id = 'user-123' makes a request to /profiles/user-123.
            const response = await agent.get<Profile>(`/profiles/${id}`);
            // This returns only the response body so profile contains clean
            // profile data.
            // Example: If API returns { id: 'user-123', displayName: 'Sam' },
            // this returns that object.
            return response.data
        },
        // This condition prevents the query from running unless id exists
        // and predicate is not set.
        // Example: id = 'user-123' and predicate = 'followers' => query is disabled here.
        enabled: !!id && !predicate
    });

    const {data: photos, isLoading: loadingPhotos} = useQuery<Photo[]>({
        queryKey: ['photos', id],
        queryFn: async () => {
            // eslint-disable-next-line no-debugger
            debugger;            
            const response = await agent.get<Photo[]>(`/profiles/${id}/photos`);
            return response.data
        },
        enabled: !!id && !predicate
    });

    const {data: followings, isLoading: loadingFollowings} = useQuery<Profile[]>({
        queryKey: ['followings', id, predicate],
        queryFn: async () => {
            // eslint-disable-next-line no-debugger
            debugger;            
            const response = await agent.get<Profile[]>(`/profiles/${id}/follow-list?predicate=${predicate}`);
            return response.data
        },
        enabled: !!id && !!predicate
    });

    const {data: userActivities, isLoading: loadingUserActivities} = useQuery({
        queryKey: ['user-activities', filter],
        queryFn: async () => {
            // eslint-disable-next-line no-debugger
            debugger;            
            const response = await agent.get<Activity[]>(`/profiles/${id}/activities`, {
                params: {
                    filter
                }
            });
            return response.data
        },
        // This condition prevents the query from running unless id exists
        // and predicate is also exists.        
        enabled: !!id && !!filter
    });

    // Summary: This mutation uploads a selected photo, refreshes cached photos,
    // and updates user/profile image URLs in cache so the UI updates immediately.
    // Example: User uploads avatar.png, then the new avatar appears without page reload.
    // Creates a mutation for photo upload and post-upload cache updates.
    // Example: Calling uploadPhoto.mutate(file) triggers this flow.
    const uploadPhoto = useMutation({
        // Defines the async function that sends the selected file to the API.
        // Example: file = avatarBlob gets uploaded to the backend.
        mutationFn: async (file: Blob) => {     
                // eslint-disable-next-line no-debugger
                debugger;    

            // Creates multipart form data because file uploads use form bodies.
            // Example: A FormData object can hold fields like "file".
            const formData = new FormData();
            // Adds the actual file under the key expected by the API endpoint.
            // Example: Key "file" -> avatarBlob.
            formData.append('file', file);
            // Sends a POST request to upload the file and waits for the API response.
            // Example: POST /profiles/add-photo returns photo metadata.
            const response = await agent.post('/profiles/add-photo', formData, {
                // Sets multipart content type so the server reads file payload correctly.
                // Example: Header tells API this is a file upload request.
                headers: {'Content-type': 'multipart/form-data'}
            });
            // Returns only response data so React Query receives clean photo object.
            // Example: Returns { id: '1', url: 'https://.../avatar.jpg' }.
            return response.data;
        },
        // Runs after successful upload to keep related cached data in sync.
        // Example: After success, profile avatar updates instantly on screen.
        onSuccess: async (photo: Photo) => {

                // eslint-disable-next-line no-debugger
                debugger;    
                            
            // Marks photos query stale and refetches it for the current profile id.
            // Example: ['photos', 'user-123'] gets refreshed.
            await queryClient.invalidateQueries({
                // Targets the cached photos list for this specific user/profile.
                // Example: query key ['photos', id].
                queryKey: ['photos', id]
            });
            // Updates current logged-in user cache without waiting for full refetch.
            // Example: Navbar avatar can update immediately.
            queryClient.setQueryData(['user'], (data: User) => {
                // Safely exits if no cached user data exists yet.
                // Example: If user cache is undefined, return undefined.
                if (!data) return data;
                // Returns a new user object with updated image when missing.
                // Example: Keep old fields, set imageUrl from uploaded photo.
                return {
                    // Copies existing user fields to avoid mutating original cache object.
                    // Example: displayName and id remain unchanged.
                    ...data,
                    // Uses existing imageUrl if present; otherwise falls back to new photo URL.
                    // Example: null ?? 'https://.../avatar.jpg' => new URL.
                    imageUrl: data.imageUrl ?? photo.url
                }
            });
            // Updates viewed profile cache so profile page image stays consistent.
            // Example: ['profile', 'user-123'] reflects new photo data.
            queryClient.setQueryData(['profile', id], (data: Profile) => {
                // Keeps debugger-allow rule disabled only for the next debug line.
                // Example: Lets you pause here during local troubleshooting.
                // Temporarily pauses execution in DevTools for inspection.
                // Example: Check photo.url value right after upload.
                // eslint-disable-next-line no-debugger
                debugger;                         
                // Prevents crashes if the target profile cache is empty.
                // Example: Undefined cache returns as-is.
                if (!data) return data;
                // Returns updated profile object with image fallback logic.
                // Example: Profile image updates if previous imageUrl was empty.
                return {
                    // Spreads existing profile properties to preserve all other values.
                    // Example: bio, username, and counts remain the same.
                    ...data,
                    // Keeps old image if present; otherwise uses uploaded photo URL.
                    // Example: '' ?? 'https://.../avatar.jpg' uses new URL.
                    imageUrl: data.imageUrl ?? photo.url
                }
            });
        }
    });

    const setMainPhoto = useMutation({
        mutationFn: async (photo: Photo) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            await agent.put(`/profiles/${photo.id}/setMain`, {});
        },
        onSuccess: (_, photo) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            queryClient.setQueryData(['user'], (userData: User) => {
                if (!userData) return userData;
                return {
                    ...userData,
                    imageUrl: photo.url
                }
            });
            queryClient.setQueryData(['profile', id], (profile: Profile) => {
            // eslint-disable-next-line no-debugger
            debugger;                         
                if (!profile) return profile;
                return {
                    ...profile,
                    imageUrl: photo.url
                }
            });
        }
    });

    const deletePhoto = useMutation({
        mutationFn: async (photoId: string) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            await agent.delete(`/profiles/${photoId}/photos`);
        },
        onSuccess: (_, photoId) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            queryClient.setQueryData(['photos', id], (photos: Photo[]) => {
                return photos?.filter(p => p.id !== photoId);
            });
        }
    });

    const updateProfile = useMutation({
        mutationFn: async (profile: EditProfileSchema) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            await agent.put(`/profiles`, profile);
        },
        onSuccess: (_, profile) => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            queryClient.setQueryData(['profile', id], (data: Profile) => {
                if (!data) return data;
                return {
                    ...data,
                    displayName: profile.displayName,
                    bio: profile.bio
                }
            });
            queryClient.setQueryData(['user'], (userData: User) => {
                if (!userData) return userData;
                return {
                    ...userData,
                    displayName: profile.displayName
                }
            });
        }
    });

    const updateFollowing = useMutation({
        mutationFn: async () => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            await agent.post(`/profiles/${id}/follow`)
        },
        onSuccess: () => {
            // eslint-disable-next-line no-debugger
            debugger;                     
            queryClient.setQueryData(['profile', id], (profile: Profile) => {
                queryClient.invalidateQueries({queryKey: ['followings', id, 'followers']});
                if (!profile || profile.followersCount === undefined) return profile;
                return {
                    ...profile,
                    following: !profile.following,
                    followersCount: profile.following 
                        ? profile.followersCount - 1 
                        : profile.followersCount + 1
                }
            })
        }
    })

    const isCurrentUser = useMemo(() => {
      return id === queryClient.getQueryData<User>(['user'])?.id
    }, [id, queryClient])

    return {
        profile,
        loadingProfile,
        photos,
        loadingPhotos,
        isCurrentUser,
        uploadPhoto,
        setMainPhoto,
        deletePhoto,
        updateProfile,
        updateFollowing,
        followings,
        loadingFollowings,
        userActivities,
        loadingUserActivities,
        setFilter,
        filter
    }
}