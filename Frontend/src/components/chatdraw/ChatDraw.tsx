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


function ChatHistory() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef() as React.RefObject<HTMLButtonElement>;

    return (
        <>
            {/**Drawer btn */}
            <Button variant={"outline"} ref={btnRef} colorScheme='teal' onClick={onOpen}>
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
                        <Text fontSize={"4xl"}>Chat History</Text>
                        <Divider p={1} />
                    </DrawerHeader>

                    <DrawerBody>
                        <List style={{ width: '400px', overflow: 'hidden' }}>

                        </List>
                    </DrawerBody>

                    <DrawerFooter>
                        <Center p={2}>
                            <ButtonGroup size='sm'>
                                <Button variant="ghost">
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