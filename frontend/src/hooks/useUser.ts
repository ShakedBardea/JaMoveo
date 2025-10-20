export const useUser = () => {
    const userData = localStorage.getItem('user');

    if (!userData) {
        return { user: null };
    }

    try {
        const user = JSON.parse(userData);
        return { user };
    } catch (e) {
        return { user: null };
    }
};