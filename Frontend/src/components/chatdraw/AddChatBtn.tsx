import React from "react"
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
} from "@chakra-ui/react"

function AddChatBtn() {
    const sentToast = useToast()

    const initialFocusRef = React.useRef() as React.RefObject<HTMLButtonElement>;
    const hiddenFileInput = React.useRef() as React.RefObject<HTMLInputElement>;

    const [uploadFile, setUploadFile] = React.useState<any>()
    const [isInputed, setInputed] = React.useState(false)

    let handleFileUpload = (e: any) => {
        console.log(e.target.files)
        setUploadFile(e.target.files[0])
        setInputed(true)
    }

    let handleFileClick = (e: any) => {
        hiddenFileInput.current?.click()
    }

    let handleSendToAPI = (e: any) => {
        console.log("send to API")

        sentToast({
            title: 'Video has been sent',
            description: `Uploaded, ${uploadFile.name}`,
            status: 'success',
            duration: 9000,
            position: 'top-right',
            isClosable: true,
        })
    }

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
                    type="file" style={{ display: 'none' }} />

                <PopoverHeader pt={4} fontWeight='bold' border='0'>
                    Upload Video
                </PopoverHeader>

                <PopoverCloseButton />

                <PopoverBody>
                    <div contentEditable={isInputed}>{uploadFile != null ? uploadFile.name : 'Video name...'}</div>
                </PopoverBody>
                <PopoverFooter
                    border='0'
                    pb={4}>
                    <Center>
                        <ButtonGroup size='sm'>
                            <Button colorScheme='teal' onClick={handleFileClick}>File</Button>
                            <Button colorScheme='teal' isDisabled={isInputed ? false : true} onClick={handleSendToAPI}>Send to AI</Button>
                        </ButtonGroup>

                    </Center>
                </PopoverFooter>

            </PopoverContent>
        </Popover>
    )
}

export default AddChatBtn;