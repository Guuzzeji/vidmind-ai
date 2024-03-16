import React from 'react'
import { Button, ListItem } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'


function ChatHistoryItem({ title, onClick }: { title: string, onClick: Function }) {
    const [hideArrowIcon, setArrowIcon] = React.useState("none")

    let checkMouseOverTrigger = (e: any) => {
        if (hideArrowIcon === "none") {
            setArrowIcon("inline")
        } else {
            setArrowIcon("none")
        }
    }

    return (
        <ListItem>
            <Button
                style={{ textAlign: 'left', width: '100%', padding: '5px' }}
                colorScheme='blackAlpha' variant='ghost' noOfLines={4}
                onMouseEnter={checkMouseOverTrigger}
                onMouseLeave={checkMouseOverTrigger}
                onClick={() => onClick()}
            >

                <ArrowForwardIcon display={hideArrowIcon} /> {title}

            </Button>
        </ListItem>
    )
}

export default ChatHistoryItem;