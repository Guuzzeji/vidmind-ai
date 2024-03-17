import React from 'react';
import { Box, ChakraProvider, Container, Flex, Text, } from '@chakra-ui/react'

import ChatInputBox from '../components/chatbox/ChatInputBox';
import ChatHistory from '../components/chatdraw/ChatDraw';
import ChatWindow from '../components/chatbox/ChatWindow';

import { globalStore } from '../store';

function Main() {
    const videoTitle = globalStore((state: any) => {
        if (state.chatHistoryCurrentVideoIndex === -1) {
            return null;
        }

        let title = state.chatHistoryList[state.chatHistoryCurrentVideoIndex].title;
        return (title.length > 35) ? title.slice(0, 35) + "..." : title;
    })

    return (
        <ChakraProvider>
            <Flex minWidth='max-content' gap={1}>
                <Container flex='1' p={4}>
                    <ChatHistory />
                    <br />
                    <br />
                    <Text style={{ writingMode: 'sideways-lr', textAlign: 'center', userSelect: "none" }} fontSize='3xl'>{videoTitle === null ? "" : videoTitle}</Text>
                </Container>
                <Container maxWidth={"45vw"} alignSelf={"center"} p={5}>
                    <Box style={{ overflow: 'auto', maskImage: "linear-gradient(0deg, #000 85%, transparent )", }} maxHeight="88vh" height="88vh" minHeight="50h" p={5}>
                        <ChatWindow />
                    </Box>
                    <ChatInputBox />
                </Container>
                <Container flex='1'>
                </Container>
            </Flex>
        </ChakraProvider >
    );
}

export default Main;
