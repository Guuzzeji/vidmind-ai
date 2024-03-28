import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getVideoChats = createAsyncThunk("user/GetVideoChats", async () => {
    const res = await axios.get('http://localhost:4200/API/videos');
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
            console.log(action);
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


