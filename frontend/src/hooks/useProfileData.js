import { useMutation } from '@tanstack/react-query';

export const useProfileData = () => {
    const mutation = useMutation({
        mutationFn: async (data) => {
            // Simulate API call
            await new Promise(res => setTimeout(res, 1000));
            // You can log or store data here for now
            console.log("Submitted data:", data);
            return data;
        }
    });

    const { mutateAsync, isLoading, isError, error } = mutation;

    const submitProfileData = async (data) => {
        try {
            await mutateAsync(data);
        } catch (err) {
            console.error("Error submitting profile data:", err);
        }
    };

    return {
        submitProfileData,
        isLoading,
        isError,
        error
    };
}