import React from 'react';

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

import { useSelector, useDispatch } from 'react-redux';
import { sendMessage } from './inputSlice';

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

function ChatInputBox() {
    const hiddenFileInput = React.useRef();
    const chatBox = React.useRef();

    const [chatAction, setChatAction] = React.useState("Chat");

    const [uploadFile, setUploadFile] = React.useState();
    const [isInputed, setInputed] = React.useState(false);

    const dispatch = useDispatch();
    const videoid = useSelector((state) => {
        console.log(state.chatvideos.currentVideoIndex);

        if (state.chatvideos.currentVideoIndex === -1 && state.chatvideos.videoList !== undefined) {
            return null;
        }

        return state.chatvideos.videoList[state.chatvideos.currentVideoIndex].id;
    });

    const inputProcessingIsLoading = useSelector((state) => state.chatsender.inputProcessingIsLoading);


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
                    imgBase64: await getBase64(uploadFile),
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
        <div style={{ borderStyle: "solid", padding: "5px", width: "100%", borderRadius: "10px", borderWidth: "1px", height: "auto", justifyItems: "center" }}>

            <input accept="image/png"
                ref={hiddenFileInput}
                onChange={handleFileUpload}
                type="file" style={{ display: 'none' }} />

            <Flex>
                <Box w='80%'>
                    <div
                        style={{ outline: "none", borderStyle: "none", overflowY: "scroll", overflowX: "hidden", resize: "none", boxShadow: "none", minHeight: "45px", maxHeight: "150px", width: "100%", padding: "10px" }}
                        contentEditable={inputProcessingIsLoading || isInputed ? false : true}
                        ref={chatBox}>
                        {uploadFile ? uploadFile.name : null}
                    </div>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Menu>
                        <MenuButton isDisabled={inputProcessingIsLoading} colorScheme='teal' variant='ghost' style={{ height: "100%" }} as={Button}>
                            {chatAction}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={handleActionPictureBtn}>Picture</MenuItem>
                            <MenuItem onClick={handleActionChatBtn} >Chat</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <Box style={{ padding: "5px" }}>
                    <Button isLoading={inputProcessingIsLoading} onClick={handleSendBtn} colorScheme='teal' variant='solid' style={{ height: "100%" }}><ArrowUpIcon /></Button>
                </Box>
            </Flex>
        </div>
    );
}

export default ChatInputBox;
