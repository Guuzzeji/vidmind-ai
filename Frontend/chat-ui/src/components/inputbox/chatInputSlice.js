import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ! What user should send to server for chat message
// UserMessage = {
//     videoID: string,
//     type: "text" | "image",
//     chatHistory: string[],
//     prompt: string,
//     imgBase64: string | undefined,
// }

export function createBase64File(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

export const sendMessage = createAsyncThunk("user/SendChatMessage", async ({ type, videoID, prompt, imgBase64 }, thunkAPI) => {
    const aiMessageRes = await axios.post(process.env.REACT_APP_CHAT_API_URL + '/generate', { type, videoID, prompt, imgBase64 });
    const embedSearchRes = await axios.post(process.env.REACT_APP_CHAT_API_URL + '/search', {
        searchFor: "image",
        searchBy: type,
        videoID: videoID,
        query: prompt,
        imgBase64: imgBase64
    });

    return {
        humanMessage: { type, videoID, prompt, imgBase64 },
        aiMessage: aiMessageRes.data,
        images: embedSearchRes.data
    };
});

export const chatInputSlice = createSlice({
    name: 'ChatInput',
    initialState: {
        isLoading: false,
        isError: false,
        messages: [],
    },
    reducers: {
        clearMessages: (state) => { state.messages = []; }
    },
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
            state.isLoading = false;
        });

        builder.addCase(sendMessage.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
        });

        builder.addCase(sendMessage.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export const { clearMessages } = chatInputSlice.actions;

export default chatInputSlice.reducer;