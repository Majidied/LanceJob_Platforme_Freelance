import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    login, register, logout,
    resendVerificationEmail as resendVerifyEmail,
    resetPassword as resetPass,
    verifyEmail,
    getUser,
    verifyPasswordResetToken as verifyResetToken,
    isVerified as apiIsVerified
} from '../api/userApi';

import { User, UserLogin } from '../models/User.model';
import {
    setToken,
    clearToken,
    storeUserData,
    hasAccessToken,
    clearUserData,
} from '../utils/tokenStorage';

export const useUser = () => {
    const queryClient = useQueryClient();

    // User data query
    const hasToken = hasAccessToken();

    const {
        data: userResponse,
        isLoading: isUserLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['user'],
        queryFn: () => (hasToken ? getUser() : Promise.resolve(null)),
        enabled: hasToken,
        retry: false,
        refetchInterval: hasToken ? 1000 * 60 * 5 : false,
        onError: (err) => {
            console.error('Error fetching user data:', err);
            if (err?.response?.status === 401) {
                clearToken();
                queryClient.setQueryData(['user'], null);
            }
        },
        onSuccess: (data) => {
            if (data) {
                storeUserData(data);
            }
        },
        select: (response) => response?.data.data || null,
    });

    const user = userResponse;

    const { data: verifyPayload, isLoading: isVerifyLoading, refetch: refetchVerification } = useQuery({
    queryKey: ['isVerified'],
    queryFn: () => apiIsVerified(),
    enabled: hasAccessToken(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,

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
    const { mutateAsync: registerUser, isPending: isRegisterPending, error: registerError, isError: isRegisterError } = useMutation({
        mutationFn: ({ firstName, lastName, email, password, role, agreedToTerms }) =>
            register(firstName, lastName, email, password, role, agreedToTerms),
        onSuccess: (data) => {
            console.log('Registration successful:', data);
            if (data && data.token && data.user) {
                setToken(data.token);
                storeUserData(data.user);
                queryClient.setQueryData(['user'], data.user);
            } else {
                // fallback: clear any possibly stale data
                clearToken();
                clearUserData();
                queryClient.setQueryData(['user'], null);
            }
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });

    // Logout mutation
    const { mutateAsync: logoutUser } = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            // Clear token and user data
            clearToken();
            clearUserData();
            // Invalidate user query to clear user data
            queryClient.invalidateQueries({ queryKey: ['user'] });
            // Optionally set user data to null
            queryClient.setQueryData(['user'], null);
        },
        retry: false,
    });

    // Resend verification email mutation
    const { mutateAsync: resendVerificationEmail } = useMutation({
        mutationFn: resendVerifyEmail,
        retry: false,
    });

    // Reset password mutation
    const { mutateAsync: resetPassword } = useMutation({
        mutationFn: ({ email, newPassword }) => resetPass(email, newPassword),
    });

    // Verify password reset token mutation
    const { mutateAsync: verifyPasswordResetToken } = useMutation({
        mutationFn: (token) => verifyResetToken(token),
    });

    /**
     * Verifies a user's email with verification code
     */
    const { mutateAsync: verifyEmailWithCode, isPending: isVerifyEmailWithCodePending, error: verifyEmailWithCodeError, isError: isVerifyEmailWithCodeError } = useMutation({
        mutationFn: ({ verificationCode }) => verifyEmail(verificationCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
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
        isRegisterPending,
        isRegisterError,
        registerError,
        logoutUser,
        resendVerificationEmail,
        resetPassword: (email, newPassword) => resetPassword({ email, newPassword }),
        verifyPasswordResetToken,
        isVerifyLoading,
        isVerified: verifyPayload?.isVerified || false,
        refetchVerification,
        verifyEmailWithCode,
        isVerifyEmailWithCodePending,
        isVerifyEmailWithCodeError,
        verifyEmailWithCodeError,
    };
};

export default useUser;
