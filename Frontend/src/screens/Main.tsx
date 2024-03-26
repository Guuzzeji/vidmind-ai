import React, { LegacyRef, RefObject, useEffect } from 'react';
import { Box, ChakraProvider, Container, Flex, Text, } from '@chakra-ui/react'

import ChatInputBox from '../components/chatbox/ChatInputBox';
import ChatHistory from '../components/chatdraw/ChatDraw';
import ChatWindow from '../components/chatbox/ChatWindow';

import { useSelector } from 'react-redux'

function Main() {
    const videoTitle = useSelector((state: any) => {
        let videoList = state.chatvideos.videoList;
        let currentVideoIndex = state.chatvideos.currentVideoIndex;

        console.log(videoList, currentVideoIndex);

        if (currentVideoIndex !== -1 && videoList !== undefined) {
            return videoList[currentVideoIndex].title.length > 40 ?
                videoList[currentVideoIndex].title.slice(0, 40) + "..."
                : videoList[currentVideoIndex].title
        }

        return null
    })

    const chatMessages = useSelector((state: any) => state.chatsender.messages)
    const chatWindow = React.useRef() as RefObject<HTMLDivElement>

    useEffect(() => {
        chatWindow.current?.scroll(0, chatWindow.current?.scrollHeight)
    }, [chatMessages])


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
                    <Box ref={chatWindow} style={{ overflow: 'auto', maskImage: "linear-gradient(0deg, #000 95%, transparent)", }} maxHeight="88vh" height="88vh" minHeight="50h" p={5}>
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
