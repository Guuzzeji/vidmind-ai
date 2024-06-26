import {
    Box,
    Container,
    Flex,
    Text,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import './Main.css';

import ChatInputBox from '../../components/inputbox/ChatInputBox';
import ChatHistory from '../../components/chatsdraw/ChatHistory';
import ChatWindow from '../../components/messages/ChatWindow';

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
                <Box width="65%" pos="fixed" bottom="10" left="50%" transform="translateX(-50%)">
                    <ChatInputBox />
                </Box>
            </Container>
            <Container flex='1'>
            </Container>
        </Flex>
    );
}

export default Main;
