import axios from 'axios'

type Input = {
    isLoading: boolean,
    isError: boolean,
    newMessage: any
}

type UserMessage = {
    videoID: string,
    type: "text" | "img",
    chatHistory: string[],
    prompt: string,
    imgBase64: string | undefined,
}

const InitalInput: Input = {
    newMessage: "",
    isLoading: false,
    isError: false,
}

export const inputSlice = (set: any) => ({
    input: InitalInput,
    sendMessage: async (message: UserMessage) => {
        set((state: any) => { state.isLoading = true; })
        try {
            const res = await axios.post('http://localhost:4200', message)
            console.log(res.data)
            set((state: any) => { state.isLoading = false; state.NewMessage = res.data })
        } catch (err) {
            console.log(err)
            set((state: any) => { state.isLoading = true; state.isError = true })
        }
    }
})

export default inputSlice;