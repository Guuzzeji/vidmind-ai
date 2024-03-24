import { configureStore } from '@reduxjs/toolkit';

import chatVideosReducer from './components/chatdraw/chatHistorySlice';
import chatSenderSlice from './components/chatbox/inputSlice';

export const store = configureStore({
    reducer: {
        chatvideos: chatVideosReducer,
        chatsender: chatSenderSlice,
    },
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;