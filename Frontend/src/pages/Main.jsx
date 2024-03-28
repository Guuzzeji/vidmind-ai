import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Flex,
    Text,
} from '@chakra-ui/react';

import ChatInputBox from '../components/chatbox/ChatInputBox';
import ChatHistory from '../components/chatdraw/ChatDraw';
import ChatWindow from '../components/chatbox/ChatWindow';

import { useSelector } from 'react-redux';

// TODO: Clean up file strucutre
// TODO: Clean up ui window to scroll smmothly
// TODO: Move some css stuff into there own file
// TODO: Move all files in a seperate project folder called `chat-ui`
// TODO: Clean up slice / redux code to look better and read better as well
// TODO: Add light docs to redux code and ui code
// TODO: Make chat window scroll bar thinner and hide backdrop of scrollbar
// TODO: Remove url for part and replace them with .env setup
// TODO: Make ui scale for different divices, use chatgpt for this job

function Main() {
    const videoTitle = useSelector((state) => {
        let videoList = state.chatvideos.videoList;
        let currentVideoIndex = state.chatvideos.currentVideoIndex;

        console.log(videoList, currentVideoIndex);

        if (currentVideoIndex !== -1 && videoList !== undefined) {
            return videoList[currentVideoIndex].title.length > 40 ?
                videoList[currentVideoIndex].title.slice(0, 40) + "..."
                : videoList[currentVideoIndex].title;
        }

        return null;
    });

    const chatMessages = useSelector((state) => state.chatsender.messages);
    const chatWindow = React.useRef();

    useEffect(() => {
        chatWindow.current?.scroll(0, chatWindow.current?.scrollHeight);
    }, [chatMessages]);


    return (
        <Flex minWidth='max-content' gap={1}>
            <Container flex='1' p={4}>
                <ChatHistory />
                <br />
                <br />
                <Text style={{ writingMode: 'sideways-lr', textAlign: 'center', userSelect: "none", color: "lightgray" }} fontSize='3xl'>{videoTitle === null ? "" : videoTitle}</Text>
            </Container>
            <Container maxWidth={"45vw"} alignSelf={"center"} p={5}>
                <Box ref={chatWindow} style={{ overflow: 'auto', maskImage: "linear-gradient(0deg, #000 95%, transparent)", }} maxHeight="88vh" height="88vh" minHeight="50h" p={5}>
                    <ChatWindow />
                </Box>
                <ChatInputBox />
            </Container>
            <Container flex='1'>
            </Container>
        </Flex>
    );
}

export default Main;
