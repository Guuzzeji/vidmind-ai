import React from 'react';
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
import { HamburgerIcon, RepeatIcon } from '@chakra-ui/icons';

import ChatHistoryItem from './ChatHistoryItem';
import AddChatBtn from './AddChatBtn';

import { useSelector, useDispatch } from 'react-redux';
import { setCurrentVideo, fetchVideoList } from './chatHistorySlice';

function ChatHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();

    const videoList = useSelector((state) => { console.log(state.chatvideos.videoList); return state.chatvideos.videoList; });
    const dispatch = useDispatch();

    return (
        <>
            {/**Drawer btn */}
            <Button variant={"outline"} ref={btnRef} colorScheme='teal' onClick={() => { onOpen(); dispatch(fetchVideoList()); }}>
                <HamburgerIcon />
            </Button>

            {/**Drawer Body */}
            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                size={"sm"}
                finalFocusRef={btnRef}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Text style={{ userSelect: "none" }} fontSize={"4xl"}>Chats</Text>
                        <Divider p={1} />
                    </DrawerHeader>

                    <DrawerBody>
                        <List style={{ width: '400px', overflowY: 'scroll' }}>
                            {videoList?.map((item, i) => <ChatHistoryItem key={i} title={item.title} onClick={() => { dispatch(setCurrentVideo(i)); onClose(); }} />)}
                        </List>
                    </DrawerBody>

                    <DrawerFooter>
                        <Center p={2}>
                            <ButtonGroup size='sm'>

                                <Button onClick={fetchVideoList} variant="ghost">
                                    <RepeatIcon />
                                </Button>

                                <AddChatBtn />

                            </ButtonGroup>
                        </Center>
                    </DrawerFooter>

                </DrawerContent>
            </Drawer>
        </>
    );
}

export default ChatHistory;