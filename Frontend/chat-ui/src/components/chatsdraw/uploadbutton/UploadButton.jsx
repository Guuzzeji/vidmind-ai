import {
    Button,
    ButtonGroup,
    Center,
    Popover,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    useToast
} from "@chakra-ui/react";
import React from "react";
import { useSelector, useDispatch } from 'react-redux';

import { sendVideo } from './uploadVideoSlice';


function UploadButton() {
    const sentToast = useToast();

    const initialFocusRef = React.useRef();
    const hiddenFileInput = React.useRef();
    const fileNameInput = React.useRef();

    const [uploadFile, setUploadFile] = React.useState();
    const [isInputed, setInputed] = React.useState(false);

    const isUploading = useSelector((state) => state.UploadVideo.isUploading);
    const dispatch = useDispatch();

    let handleFileUpload = (e) => {
        console.log(e.target.files);
        setUploadFile(e.target.files[0]);
        setInputed(true);
    };

    let handleFileClick = (e) => {
        hiddenFileInput.current?.click();
    };

    let handleSendToAPI = (e) => {
        console.log("send to API");
        console.log(uploadFile);

        dispatch(sendVideo({
            title: fileNameInput?.current.innerText.trim(),
            videoFile: uploadFile
        }));

        sentToast({
            title: 'Video has been sent',
            description: `Uploaded, ${fileNameInput?.current.innerText.trim()}`,
            status: 'success',
            duration: 9000,
            position: 'top-right',
            isClosable: true,
        });

        setUploadFile(null);
        setInputed(false);
    };

    return (
        <Popover
            initialFocusRef={initialFocusRef}
            placement='bottom'
            closeOnBlur={false}>

            {/**Trigger Btn */}
            <PopoverTrigger>
                <Button colorScheme="teal">Chat +</Button>
            </PopoverTrigger>

            {/**Popup Body */}
            <PopoverContent color='white' bg='gray.800' borderColor='teal.800'>

                <input accept="video/mp4, video/mkv"
                    ref={hiddenFileInput}
                    onChange={handleFileUpload}
                    type="file"
                    style={{ display: 'none' }} />

                <PopoverHeader pt={4} fontWeight='bold' border='0'>
                    Upload Video
                </PopoverHeader>

                <PopoverCloseButton />

                <PopoverBody>
                    <div
                        ref={fileNameInput} c
                        contentEditable={isInputed && !isUploading}>
                        {uploadFile != null ? uploadFile.name : 'Video name...'}
                    </div>
                </PopoverBody>
                <PopoverFooter border='0' pb={4}>
                    <Center>
                        <ButtonGroup size='sm'>
                            <Button colorScheme='teal'
                                isDisabled={isUploading}
                                onClick={handleFileClick}>
                                File
                            </Button>
                            <Button
                                colorScheme='teal'
                                isDisabled={isInputed | isUploading ? false : true}
                                onClick={handleSendToAPI}>
                                Send to AI
                            </Button>
                        </ButtonGroup>

                    </Center>
                </PopoverFooter>

            </PopoverContent>
        </Popover>
    );
}

export default UploadButton;