import { create } from 'zustand';

import { inputSlice } from './components/chatbox/inputSlice';
import chatHistory from './components/chatdraw/chatHistorySlice';
import messageListSlice from './components/chatmsg/messageListSlice';

export const globalStore = create((...a) => ({
    // ...inputSlice(set, get, store),
    ...chatHistory(...a),
    // ...messageListSlice(set, get, store)
}));