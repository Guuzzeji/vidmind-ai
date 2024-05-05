import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_GET_VIDEOS_URL = (process.env.REACT_APP_DEBUG === null || String(process.env.REACT_APP_DEBUG).toLowerCase() === 'true') ? process.env.REACT_APP_API_GET_VIDEOS_URL : '/API/videos';

export const getVideoChats = createAsyncThunk("user/GetChatHistory", async () => {
    const res = await axios.get(API_GET_VIDEOS_URL);
    // console.log(res.data);
    return res.data;
});

export const chatHistorySlice = createSlice({
    name: 'ChatHistory',
    initialState: {
        isLoading: false,
        isError: false,
        videos: [],
        currentIndex: -1,
    },
    reducers: {
        setCurrentVideo: (state, action) => {
            state.currentIndex = action.payload;
            return state;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getVideoChats.fulfilled, (state, action) => {
            // console.log(action);
            state.videos = action.payload;
            return state;
        });

        builder.addCase(getVideoChats.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
        });

        builder.addCase(getVideoChats.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    },
});

// Action creators are generated for each case reducer function
export const { setCurrentVideo } = chatHistorySlice.actions;

export default chatHistorySlice.reducer;


