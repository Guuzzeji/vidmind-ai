import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button,
    useDisclosure,
    List,
    Text,
    Divider,
    Center,
    DrawerFooter,
    ButtonGroup
} from '@chakra-ui/react';

import {
    HamburgerIcon,
    RepeatIcon
} from '@chakra-ui/icons';

import ChatHistoryItem from './ChatHistoryItem';
import UploadButton from './uploadbutton/UploadButton';

import { setCurrentVideo, getVideoChats } from './chatHistorySlice';

function ChatHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const drawerBtnRef = React.useRef();

    const dispatch = useDispatch();
    const videos = useSelector((state) => {
        // console.log(state.ChatHistory.videos);
        return state.ChatHistory.videos;
    });

    return (
        <>
            {/**Drawer btn */}
            <Button
                variant={"outline"}
                ref={drawerBtnRef}
                colorScheme='teal'
                onClick={() => { onOpen(); dispatch(getVideoChats()); }}>
                <HamburgerIcon />
            </Button>

            {/**Drawer Body */}
            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                size={"sm"}
                finalFocusRef={drawerBtnRef}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Text style={{ userSelect: "none" }} fontSize={"4xl"}>Chats</Text>
                        <Divider p={1} />
                    </DrawerHeader>

                    <DrawerBody>
                        <List style={{ width: '400px', overflowY: 'scroll' }}>
                            {videos?.map((item, i) =>
                                <ChatHistoryItem key={i} title={item.title}
                                    onClick={() => { dispatch(setCurrentVideo(i)); onClose(); }} />)}
                        </List>
                    </DrawerBody>

                    <DrawerFooter>
                        <Center p={2}>
                            <ButtonGroup size='sm'>

                                <Button onClick={() => { dispatch(getVideoChats()); }} variant="ghost">
                                    <RepeatIcon />
                                </Button>

                                <UploadButton />

                            </ButtonGroup>
                        </Center>
                    </DrawerFooter>

                </DrawerContent>
            </Drawer>
        </>
    );
}

export default ChatHistory;