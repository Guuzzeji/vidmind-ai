import React from 'react';

import { Button, ListItem } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

function ChatHistoryItem({ title, onClick }) {
    const [hideArrowIcon, setArrowIcon] = React.useState("none");
    const [hoverText, setHoverText] = React.useState(title);

    let checkMouseOverTrigger = (e) => {
        if (hideArrowIcon === "none") {
            shortenText();
            setArrowIcon("inline");
        } else {
            setArrowIcon("none");
            setHoverText(title);
        }
    };

    let shortenText = () => {
        if (hoverText.length >= 20) {
            setHoverText(hoverText.slice(0, 20) + "...");
        }
    };

    return (
        <ListItem style={{ padding: "5px" }}>
            <Button
                style={{ textAlign: 'left', width: '100%', padding: '10px' }}
                colorScheme='blackAlpha' variant='ghost' noOfLines={4}
                onMouseEnter={checkMouseOverTrigger}
                onMouseLeave={checkMouseOverTrigger}
                onClick={() => onClick()}>
                {hoverText} <ArrowForwardIcon display={hideArrowIcon} />
            </Button>
        </ListItem>
    );
}

export default ChatHistoryItem;