import { configureStore } from '@reduxjs/toolkit';

import chatVideosReducer from './components/chatdraw/chatHistorySlice';
import chatSenderSlice from './components/chatbox/inputSlice';
import uploadVideoSlice from './components/chatdraw/uploadVideoSlice';

export const store = configureStore({
    reducer: {
        chatvideos: chatVideosReducer,
        chatsender: chatSenderSlice,
        uploadvideo: uploadVideoSlice
    },
});

export default store;