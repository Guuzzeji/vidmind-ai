import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVideoList = createAsyncThunk("users/fetchByIdStatus", async () => {
    const res = await axios.get('http://localhost:4200/API/videos');
    console.log(res.data);
    return res.data;
});

export const chatVideoSlice = createSlice({
    name: 'chatvideos',
    initialState: {
        chatHistoryIsLoading: false,
        videoList: [],
        currentVideoIndex: -1,
    },
    reducers: {
        setCurrentVideo: (state, action) => {
            state.currentVideoIndex = action.payload;
            return state;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchVideoList.fulfilled, (state, action) => {
            console.log(action);
            state.videoList = action.payload;
            return state;
        });
    },
});

// Action creators are generated for each case reducer function
export const { setCurrentVideo } = chatVideoSlice.actions;

export default chatVideoSlice.reducer;


