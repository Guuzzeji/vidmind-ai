import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Box,
} from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';

import './ChatInputBox.css';

import { sendMessage, createBase64File } from './chatInputSlice';

function ChatInputBox() {
    const hiddenFileInput = React.useRef();
    const chatBox = React.useRef();

    const [chatAction, setChatAction] = React.useState("Chat");

    const [uploadFile, setUploadFile] = React.useState();
    const [isInputed, setInputed] = React.useState(false);

    const dispatch = useDispatch();
    const videoid = useSelector((state) => {
        // console.log(state.chatvideos.currentVideoIndex);
        let index = state.ChatHistory.currentIndex;
        let videoList = state.ChatHistory.videos;

        if (index === -1 || videoList.length === 0) {
            return null;
        }
        return videoList[index].id;
    });

    const isLoading = useSelector((state) => state.ChatInput.isLoading);

    let handleActionChatBtn = (e) => {
        console.log(e);
        setChatAction("Chat");
        setInputed(false);
    };

    let handleActionPictureBtn = (e) => {
        console.log(e);
        setChatAction("Picture");
        hiddenFileInput.current?.click();
    };

    let handleSendBtn = async (e) => {
        let prompt = chatBox.current?.innerText.trim();
        if (prompt !== "" && videoid !== null) {
            if (chatAction === "Chat") {
                dispatch(sendMessage({
                    videoID: videoid,
                    type: "text",
                    chatHistory: [],
                    prompt: prompt,
                }));
            } else if (chatAction === "Picture" && uploadFile != null) {
                dispatch(sendMessage({
                    videoID: videoid,
                    type: "image",
                    chatHistory: [],
                    imgBase64: await createBase64File(uploadFile),
                }));
            }
        }
    };

    let handleFileUpload = (e) => {
        console.log(e.target.files);
        setUploadFile(e.target.files[0]);
        setInputed(true);
    };

    return (
        <div className='BoxBoarder'>

            <input accept="image/png"
                ref={hiddenFileInput}
                onChange={handleFileUpload}
                type="file" style={{ display: 'none' }} />

            <Flex>
                <Box w='80%'>
                    <div
                        className='TextInput'
                        contentEditable={isLoading || isInputed ? false : true}
                        ref={chatBox}>
                        {uploadFile ? uploadFile.name : null}
                    </div>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Menu>
                        <MenuButton
                            isDisabled={isLoading}
                            colorScheme='teal'
                            variant='ghost'
                            style={{ height: "100%" }}
                            as={Button}>
                            {chatAction}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={handleActionPictureBtn}>Picture</MenuItem>
                            <MenuItem onClick={handleActionChatBtn} >Chat</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Button
                        isLoading={isLoading}
                        onClick={handleSendBtn}
                        colorScheme='teal'
                        variant='solid'
                        style={{ height: "100%" }}>
                        <ArrowUpIcon />
                    </Button>
                </Box>
            </Flex>
        </div>
    );
}

export default ChatInputBox;
