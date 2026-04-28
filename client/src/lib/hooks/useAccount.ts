import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent.ts";
import type { LoginSchema } from "../schemas/loginSchema.ts";
import { useNavigate } from "react-router";
import type { RegisterSchema } from "../schemas/registerSchema.ts";
import { toast } from "react-toastify";
import type { ChangePasswordSchema } from "../schemas/changePasswordSchema.ts";

export const useAccount = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    /* KNW_REACT :- useQuery is a hook from React Query that  allows you to fetch data and manage 
                    the loading and error states. 

                    In this case, it’s used to fetch the current user’s information 
                    from the /account/user-info endpoint. 
                    ******* queryKey
                    The queryKey is set to ['user'], which is a unique identifier for this query. 
                    ******* queryFn
                    The queryFn is an asynchronous function that makes a GET request to the /account/user-info endpoint 
                    using the agent instance. 
                    The response data is returned and stored in the currentUser variable. 
                    The enabled option is set to !queryClient.getQueryData(['user']), which means that the 
                    query will only run if there is no cached data for the ['user'] query key. 
                    This prevents unnecessary network requests if the user information is already 
                    available in the cache.
                    ******* isLoading is a boolean from React Query that is true while the query is running 
                    for the first time and no cached data exists yet. 
                    In this hook it’s renamed to loadingUserInfo, so components can show a loading 
                    state while /account/user-info is being fetched.

    
    */
    const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await agent.get<User>('/account/user-info');
            return response.data
        },
        enabled: !queryClient.getQueryData(['user'])
    });

    const loginUser = useMutation({
        mutationFn: async (creds: LoginSchema) => {
            await agent.post('/login?useCookies=true', creds);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['user']
            });
            await navigate('/activities');
        }
    });

    const registerUser = useMutation({
        mutationFn: async (creds: RegisterSchema) => {
            await agent.post('/account/register', creds);
        }
    })

    const logoutUser = useMutation({
        mutationFn: async () => {
            await agent.post('/account/logout');
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user'] });
            queryClient.removeQueries({ queryKey: ['activities'] });
            navigate('/');
        }
    })

    const verifyEmail = useMutation({
        mutationFn: async ({ userId, code }: { userId: string, code: string }) => {
            await agent.get(`/confirmEmail?userId=${userId}&code=${code}`);
        }
    });

    const resendConfirmationEmail = useMutation({
        mutationFn: async ({ email, userId }: { email?: string, userId?: string | null }) => {
            await agent.get(`/account/resendConfirmEmail`, {
                params: { email, userId }
            });
        },
        onSuccess: () => {
            toast.success('Email sent - please check your inbox');
        }
    })

    const changePassword = useMutation({
        mutationFn: async (data: ChangePasswordSchema) => {
            await agent.post('/account/change-password', data);
        }
    });

    const forgotPassword = useMutation({
        mutationFn: async (email: string) => {
            await agent.post('/forgotPassword', {email})
        }
    })

    
    const resetPassword = useMutation({
        mutationFn: async (data: ResetPassword) => {
            await agent.post('/resetPassword', data);
        }
    })

    const fetchGithubToken = useMutation({
        mutationFn: async (code: string) => {
            const response = await agent.post(`/account/github-login?code=${code}`);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['user']
            })
        }
    })

    return {
        loginUser,
        currentUser,
        logoutUser,
        loadingUserInfo,
        registerUser,
        resendConfirmationEmail,
        verifyEmail,
        changePassword,
        forgotPassword,
        resetPassword,
        fetchGithubToken
    }
}