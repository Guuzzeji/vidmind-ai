import React, { useEffect } from 'react';
import {
    Box,
    Container,
    Flex,
    Text,
} from '@chakra-ui/react';

import './Main.css';

import ChatInputBox from '../../components/inputbox/ChatInputBox';
import ChatHistory from '../../components/chatsdraw/ChatDraw';
import ChatWindow from '../../components/messages/window/ChatWindow';

import { useSelector } from 'react-redux';

// TODO: Clean up file strucutre [x]
// TODO: Clean up ui window to scroll smmothly [x]
// TODO: Move some css stuff into there own file [x]
// TODO: Move all files in a seperate project folder called `chat-ui`
// TODO: Clean up slice / redux code to look better and read better as well [x]
// TODO: Add light docs to redux code and ui code [x]
// TODO: Make chat window scroll bar thinner and hide backdrop of scrollbar [x]
// TODO: Remove url for part and replace them with .env setup
// TODO: Make ui scale for different divices, use chatgpt for this job [x]

function Main() {
    const videoTitle = useSelector((state) => {
        let videoList = state.ChatHistory.videos;
        let index = state.ChatHistory.currentIndex;
        // console.log(videoList, index);

        if (index !== -1 && videoList.length !== 0) {
            return videoList[index].title.length > 40 ?
                videoList[index].title.slice(0, 40) + "..." : videoList[index].title;
        }

        return null;
    });

    const chatMessages = useSelector((state) => state.ChatInput.messages);
    const chatWindow = React.useRef();

    // Force window to scroll down when new message is added to message list
    useEffect(() => {
        chatWindow.current?.scroll(0, chatWindow.current?.scrollHeight);
    }, [chatMessages]);

    return (
        <Flex minWidth='max-content' gap={1}>
            <Container flex='1' p={4}>
                <ChatHistory />
                <br />
                <br />
                <Text
                    className='SideBarTitle'
                    fontSize='3xl'>
                    {videoTitle === null ? "" : videoTitle}
                </Text>
            </Container>
            <Container className='ChatWindowContainer'>
                <Box ref={chatWindow} className='ChatWindowArea'>
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
