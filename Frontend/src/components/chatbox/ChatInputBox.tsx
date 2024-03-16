import React from 'react';
import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Box,
} from '@chakra-ui/react'

import { ArrowUpIcon } from '@chakra-ui/icons'

function ChatInputBox() {
    const hiddenFileInput = React.useRef() as React.RefObject<HTMLInputElement>;
    const chatBox = React.useRef() as React.RefObject<HTMLDivElement>;

    const [chatAction, setChatAction] = React.useState("Chat")
    const [isSending, setIsSending] = React.useState(false)

    const [uploadFile, setUploadFile] = React.useState<any>()
    const [isInputed, setInputed] = React.useState(false)

    let handleActionChatBtn = (e: any) => {
        console.log(e)
        setChatAction("Chat")
        setInputed(false)
    }

    let handleActionPictureBtn = (e: any) => {
        console.log(e)
        setChatAction("Picture")
        hiddenFileInput.current?.click()
    }

    let handleSendBtn = (e: any) => {
        let prompt = chatBox.current?.innerText.trim()
        if (prompt !== "") {
            setIsSending(true)
            console.log(isSending)
        }
    }

    let handleFileUpload = (e: any) => {
        console.log(e.target.files)
        setUploadFile(e.target.files[0])
        setInputed(true)
    }

    return (
        <div style={{ borderStyle: "solid", padding: "5px", width: "100%", borderRadius: "10px", borderWidth: "1px", height: "auto", justifyItems: "center" }}>

            <input accept="image/*"
                ref={hiddenFileInput}
                onChange={handleFileUpload}
                type="file" style={{ display: 'none' }} />

            <Flex>
                <Box w='80%'>
                    <div
                        style={{ outline: "none", borderStyle: "none", overflowY: "scroll", overflowX: "hidden", resize: "none", boxShadow: "none", minHeight: "45px", maxHeight: "150px", width: "100%", padding: "10px" }}
                        // isDisabled={false}
                        contentEditable={isSending || isInputed ? false : true}
                        // data-text='Message Popcorn GPT VLS...'
                        ref={chatBox}>
                        {uploadFile ? uploadFile.name : null}
                    </div>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Menu>
                        <MenuButton isDisabled={isSending} colorScheme='teal' variant='ghost' style={{ height: "100%" }} as={Button}>
                            {chatAction}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={handleActionPictureBtn}>Picture</MenuItem>
                            <MenuItem onClick={handleActionChatBtn} >Chat</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Button isLoading={isSending} onClick={handleSendBtn} colorScheme='teal' variant='solid' style={{ height: "100%" }}><ArrowUpIcon /></Button>
                </Box>
            </Flex>
        </div>
    );
}

export default ChatInputBox;
