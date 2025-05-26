import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    login, register, logout, 
    resendVerificationEmail as resendVerifyEmail, 
    resetPassword as resetPass, 
    verifyEmail, 
    getUser,
    verifyPasswordResetToken as verifyResetToken 
} from '../api/userApi';

import { User, UserLogin } from '../models/User.model';
import { 
    setToken,
    clearToken,
    storeUserData,
    hasAccessToken,
    getUserData
} from '../utils/tokenStorage';

export const useUser = () => {
    const queryClient = useQueryClient();
    
    // User data query
    const { data: user, isLoading: isUserLoading, isError, error } = useQuery({
        queryKey: ['user'],
        queryFn: getUser(),
        retry: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
        enabled: hasAccessToken(),
        onError: (error) => {
            console.error('Error fetching user data:', error);
            clearToken();
            queryClient.setQueryData(['user'], null); // Set user data to null
        },
        onSuccess: (data) => {
            if (data) {
                storeUserData(data); // Store user data in localStorage
            }
        },
        select: (data) => {
            // Optionally transform the user data if needed
            return data;
        },
    });

    // Login mutation
    const { mutateAsync: loginUser, isPending: isLoginPending, error: loginError, isError: isLoginError } = useMutation({
        mutationFn: async ({ email, password }) => {
            // Valide les données côté client
            const parsed = UserLogin.safeParse({ email, password });
            if (!parsed.success) {
                throw new Error(`Invalid login data: ${parsed.error.message}`);
            }
            // Appelle l’API avec les données validées
            return login(parsed.data.email, parsed.data.password);
        },
        onSuccess: (data) => {
            if (data && data.token) {
                setToken(data.token);
                storeUserData(data.user);
            }
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Optionally set user data to null
            if (data && data.user) {
                queryClient.setQueryData(['user'], data.user);
            }
        },
    });

    // Register mutation
    const { mutateAsync: registerUser, isPending: isRegistringPending, error: RegistringError, isError: isRegistringError } = useMutation({
        mutationFn: ({ FirstName, LastName, email, password, role }) => register(...User(FirstName, LastName, email, password, role)),
        onSuccess: (data) => {
            if (data && data.token) {
                setToken(data.token);
                storeUserData(data.userData);
            }
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Optionally set user data to null
            if (data && data.userData) {
                queryClient.setQueryData(['user'], data.userData);
            }
        }
    });

    // Logout mutation
    const { mutateAsync: logoutUser } = useMutation({
        mutationFn: () => logout(getUserData()?.id),
        onSuccess: () => {
            // Clear token and user data
            clearToken();
            // Invalidate user query to clear user data
            queryClient.invalidateQueries({ queryKey: ['user'] });
            // Optionally set user data to null
            queryClient.setQueryData(['user'], null);
        },
        retry: false,
    });

    // Resend verification email mutation
    const { mutateAsync: resendVerificationEmail } = useMutation({
        mutationFn: (email) => resendVerifyEmail(email),
    });

    // Reset password mutation
    const { mutateAsync: resetPassword } = useMutation({
        mutationFn: ({ email, newPassword }) => resetPass(email, newPassword),
    });

    // Verify email mutation
    const { mutateAsync: verifyEmailToken } = useMutation({
        mutationFn: (token) => verifyEmail(token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    // Verify password reset token mutation
    const { mutateAsync: verifyPasswordResetToken } = useMutation({
        mutationFn: (token) => verifyResetToken(token),
    });

    const isLoading = isUserLoading;

    return { 
        user, 
        isLoading, 
        isError, 
        error, 
        loginUser,
        isLoginPending,
        isLoginError,
        loginError,
        registerUser,
        isRegistringPending,
        RegistringError,
        isRegistringError,
        logoutUser,
        resendVerificationEmail,
        resetPassword: (email, newPassword) => resetPassword({ email, newPassword }),
        verifyEmailToken,
        verifyPasswordResetToken
    };
};

export default useUser;
