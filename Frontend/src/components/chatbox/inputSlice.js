import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// type UserMessage = {
//     videoID: string,
//     type: "text" | "image",
//     chatHistory: string[],
//     prompt: string,
//     imgBase64: string | undefined,
// }

export const sendMessage = createAsyncThunk("users/nnonononion", async (message, thunkAPI) => {
    const aiRes = await axios.post('http://localhost:4200/API/generate', message);
    const embedSearch = await axios.post('http://localhost:4200/API/search', {
        searchFor: "image",
        searchBy: message.type,
        videoID: message.videoID,
        query: message.prompt,
        imgBase64: message.imgBase64
    });

    return {
        humanMessage: message,
        aiMessage: aiRes.data,
        images: embedSearch.data
    };
});

export const chatSenderSlice = createSlice({
    name: 'chatsender',
    initialState: {
        inputProcessingIsLoading: false,
        inputProcessingIsError: false,
        messages: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            console.log(action);
            state.messages.push({
                sender: "human",
                data: action.payload.humanMessage
            });
            state.messages.push({
                sender: "ai",
                data: {
                    message: action.payload.aiMessage,
                    context: action.payload.images,
                }
            });
            state.inputProcessingIsLoading = false;
        });

        builder.addCase(sendMessage.pending, (state) => {
            state.inputProcessingIsLoading = true;
            state.inputProcessingIsError = false;
        });

        builder.addCase(sendMessage.rejected, (state) => {
            state.inputProcessingIsError = true;
            state.inputProcessingIsLoading = false;
        });
    },
});

// Action creators are generated for each case reducer function
// export const { setCurrentVideo } = chatSenderSlice.actions;

export default chatSenderSlice.reducer;