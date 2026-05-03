import axios from 'axios';
import { store } from '../stores/store';
import { toast } from 'react-toastify';
import { router } from '../../app/router/routes';


// Feature Branches :-
// Sets up an Axios HTTP client with request/response interceptors for the whole app.
// Every API call goes through this agent — it shows a loading spinner, simulates
// network delay in dev, and globally handles errors (400, 401, 403, 404, 500).
// Example: agent.get('/activities') → spinner shows → waits 1s in dev →
//          spinner hides → on error, navigates or shows a toast automatically.

// Defines a helper that pauses async code for a given number of milliseconds.
// Example: await sleep(1000) waits 1 second before the next line runs.
const sleep = (delay: number) => {
    // Returns a Promise so this function can be used with `await`.
    // Example: `return new Promise(...)` is what makes `await sleep(500)` work.
    return new Promise((resolve) => {
        // Calls `resolve` after `delay` ms, ending the pause.
        // Example: setTimeout(resolve, 1000) ends the wait after 1 second.
        setTimeout(resolve, delay);
    });
}

// Creates a pre-configured Axios instance that all API calls in the app will use.
// Example: agent.get('/activities') automatically uses the base URL and cookies below.
const agent = axios.create({
    // Sets the root URL for every request, read from the environment variable.
    // Example: VITE_API_URL="https://api.example.com" → agent.get('/users') hits "https://api.example.com/users".
    baseURL: import.meta.env.VITE_API_URL,
    // Tells Axios to include cookies on cross-origin requests (required for cookie-based auth).
    // Example: your session cookie is automatically sent with every API call.
    withCredentials: true
});

// Registers a function that runs before every outgoing HTTP request.
// Example: Every agent.get(...) / agent.post(...) triggers this interceptor first.
agent.interceptors.request.use(config => {
    // Marks the UI as "busy" so a loading spinner can be shown.
    // Example: store.uiStore.isBusy() sets isLoading = true in the MobX store.
    store.uiStore.isBusy();
    // Returns the config unchanged so the request proceeds normally.
    // Example: without `return config` the request would be silently blocked.
    return config;
})

// Registers two handlers that run after every HTTP response.
// Example: 200 OK → success handler; 404 Not Found → error handler.
agent.interceptors.response.use(
    // Success handler — runs when the server replies with a 2xx status code.
    // Example: GET /activities → 200 OK → this function executes.
    async response => {
        // In development, waits 1 second to simulate real network latency.
        // Example: lets you test how loading spinners look without a slow server.
        if (import.meta.env.DEV) await sleep(1000);
        // Marks the UI as "idle" so the loading spinner is hidden.
        // Example: store.uiStore.isIdle() sets isLoading = false in the MobX store.
        store.uiStore.isIdle();
        // Passes the response back to the caller so it can read the data.
        // Example: const res = await agent.get('/activities') → res is this response object.
        return response;
    },
    // Error handler — runs when the server replies with a non-2xx status code.
    // Example: GET /activities → 500 Internal Server Error → this function executes.
    async error => {
        // In development, waits 1 second to simulate real network latency on errors too.
        // Example: lets you see the loading spinner during error scenarios locally.
        if (import.meta.env.DEV) await sleep(1000);
        // Marks the UI as "idle" so the spinner doesn't stay stuck after an error.
        // Example: without this, a 404 response would leave the spinner running forever.
        store.uiStore.isIdle();
        // Pulls the response body (data) and HTTP status code out of the error object.
        // Example: { data: "Not Found", status: 404 } = error.response.
        const {data, status} = error.response;
        // Routes handling to the correct block based on which HTTP status code was returned.
        // Example: status === 404 → jumps to the `case 404` block below.
        switch (status) {
            // Handles bad request errors — usually validation failures from the server.
            // Example: submitting a form with a missing required field → server returns 400.
            case 400:
                // Checks if the response has a field-level validation errors object.
                // Example: data.errors = { Name: ["Name is required"], Age: ["Must be positive"] }.
                if (data.errors) {
                // Collects all validation messages before throwing them together.
                // Example: modalStateErrors will accumulate [["Name is required"], ["Must be positive"]].
                const modalStateErrors = [];
                // Loops over each field name in the errors object.
                // Example: key = "Name" on the first iteration, key = "Age" on the next.
                for (const key in data.errors) {
                    // Skips null or empty error arrays to avoid pushing useless entries.
                    // Example: if data.errors["Name"] is truthy, it gets added.
                    if (data.errors[key]) {
                        // Appends that field's error messages array to the collector.
                        // Example: modalStateErrors becomes [["Name is required"]].
                        modalStateErrors.push(data.errors[key])
                    }
                }
                // Flattens nested arrays into one and throws so the form can display them.
                // Example: [["Name is required"], ["Must be positive"]] → ["Name is required", "Must be positive"].
                throw modalStateErrors.flat();
            } else {
                // If there are no field errors, shows the server's message as a toast popup.
                // Example: toast.error("Username already taken") shows a red notification.
                toast.error(data);
            }
                break;
            // Handles unauthenticated errors — the user is not logged in or the token expired.
            // Example: accessing a protected route without a valid session → server returns 401.
            case 401:
                // If the server explicitly says 'NotAllowed', throw a typed error instead of a toast.
                // Example: editing someone else's activity → server returns { detail: 'NotAllowed' }.
                if (data.detail === 'NotAllowed') {
                    // Throws so the calling component can catch and show a permission-denied message.
                    // Example: the activity form catches this and displays an "Access denied" UI.
                    throw new Error(data.detail)
                } else {
                    // Shows a generic "Unauthorised" toast for all other 401 cases.
                    // Example: expired session cookie → shows "Unauthorised" notification.
                    toast.error('Unauthorised');
                }
                break;
            // Handles forbidden errors — the user is logged in but lacks permission.
            // Example: a regular user hitting an admin-only endpoint → server returns 403.
            case 403:
                // Shows a "forbidden" toast notification to inform the user.
                // Example: toast.error('forbidden') displays a red popup saying "forbidden".
                toast.error('forbidden');
                break;
            // Handles resource not found errors.
            // Example: navigating to /activities/nonexistent-id → server returns 404.
            case 404:
                // Redirects the user to the dedicated Not Found page.
                // Example: router.navigate('/not-found') renders the 404 UI component.
                await router.navigate('/not-found');
                break;
            // Handles unexpected server-side crashes or unhandled exceptions.
            // Example: a bug in the backend causes an unhandled exception → server returns 500.
            case 500:
                // Redirects to the server error page and passes the error details as route state.
                // Example: the ServerError page reads `location.state.error` to display the stack trace.
                router.navigate('/server-error', {state: {error: data}})
                break;
        }

        // Re-rejects the promise so the original caller can still catch the error if needed.
        // Example: without this, a 404 would silently "succeed" instead of being catchable downstream.
        return Promise.reject(error);
    }
);

export default agent;