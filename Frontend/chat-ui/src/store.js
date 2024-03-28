import { configureStore } from '@reduxjs/toolkit';

import chatHistorySlice from './components/chatsdraw/chatHistorySlice';
import chatSenderSlice from './components/inputbox/chatInputSlice';
import uploadVideoSlice from './components/chatsdraw/uploadbutton/uploadVideoSlice';

export const store = configureStore({
    reducer: {
        ChatHistory: chatHistorySlice,
        ChatInput: chatSenderSlice,
        UploadVideo: uploadVideoSlice
    },
});

export default store;