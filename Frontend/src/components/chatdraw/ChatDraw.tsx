import React from 'react'
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
} from '@chakra-ui/react'
import { HamburgerIcon, RepeatIcon } from '@chakra-ui/icons'

import ChatHistoryItem from './ChatHistoryItem';
import AddChatBtn from './AddChatBtn'
import { globalStore } from '../../store'

function ChatHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef() as React.RefObject<HTMLButtonElement>;

    const getListOfVideos = globalStore((state: any) => state.getListOfVideos)
    const setCurrentVideo = globalStore((state: any) => state.setCurrentVideo)
    const list = globalStore((state: any) => state.chatHistoryList)

    React.useEffect(() => { }, [list])

    return (
        <>
            {/**Drawer btn */}
            <Button variant={"outline"} ref={btnRef} colorScheme='teal' onClick={() => { onOpen(); getListOfVideos(); }}>
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
                        <Text style={{ userSelect: "none" }} fontSize={"4xl"}>Chat History</Text>
                        <Divider p={1} />
                    </DrawerHeader>

                    <DrawerBody>
                        <List style={{ width: '400px', overflowY: 'scroll' }}>
                            {list.map((item: any, i: number) => <ChatHistoryItem key={i} title={item.title} onClick={() => { setCurrentVideo(i); onClose(); }} />)}
                        </List>
                    </DrawerBody>

                    <DrawerFooter>
                        <Center p={2}>
                            <ButtonGroup size='sm'>

                                <Button onClick={getListOfVideos} variant="ghost">
                                    <RepeatIcon />
                                </Button>

                                <AddChatBtn />

                            </ButtonGroup>
                        </Center>
                    </DrawerFooter>

                </DrawerContent>
            </Drawer>
        </>
    )
}

export default ChatHistory;