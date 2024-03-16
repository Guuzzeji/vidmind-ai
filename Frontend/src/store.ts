import { create } from 'zustand'
import { inputSlice } from './components/chatbox/inputSlice'

export const globalStore = create((...a) => ({
    ...inputSlice(a),
}))