import axios from 'axios';

export const chatHistory = (set) => ({
    chatHistoryIsLoading: false,
    chatHistoryIsError: false,
    chatHistoryList: [],
    chatHistoryCurrentVideoIndex: -1,
    getListOfVideos: async () => {
        // console.log(set)
        set(({ isLoading: true }));
        const res = await axios.get('http://localhost:4200/API/videos');
        // console.log(res.data);

        set({ chatHistoryList: res.data, chatHistoryIsLoading: true });
        // set((state) => (console.log(state)));
    },
    setCurrentVideo: (itemListId) => {
        set({ chatHistoryCurrentVideoIndex: itemListId });
    }
});

export default chatHistory;