import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_UPLOAD_URL = (process.env.REACT_APP_DEBUG === null || String(process.env.REACT_APP_DEBUG).toLowerCase() === 'true') ? process.env.REACT_APP_UPLOAD_API_URL : '/API/upload';

export const sendVideo = createAsyncThunk("user/UploadVideo", async ({ title, videoFile }, thunkAPI) => {
    let formData = new FormData();
    formData.append("title", title);
    formData.append("file", videoFile);

    // console.log("THE VIDEO,", title);

    const res = await axios.post(API_UPLOAD_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    // console.log(res.data);
    // This should be a json that is either ok = true or error = true
    return res.data;
});

export const uploadVideoSlice = createSlice({
    name: 'UploadVideo',
    initialState: {
        isUploading: false,
        isError: false,
        isOk: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(sendVideo.fulfilled, (state, action) => {
            // console.log(action);
            if (action.payload.ok) {
                state.isError = false;
                state.isOk = true;
                state.isUploading = false;

            } else {
                state.isError = true;
                state.isOk = false;
                state.isUploading = false;
            }
        });

        builder.addCase(sendVideo.rejected, (state) => {
            state.isError = true;
            state.isOk = false;
            state.isUploading = false;
        });

        builder.addCase(sendVideo.pending, (state) => {
            state.isError = false;
            state.isOk = false;
            state.isUploading = true;
        });
    },
});

export default uploadVideoSlice.reducer;


