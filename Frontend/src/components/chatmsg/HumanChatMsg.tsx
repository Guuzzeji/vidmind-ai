import React from 'react';
import { Flex, } from '@chakra-ui/react'

function HumanChatMsg({ message }: { message: string }) {

    return (
        <div style={{ width: "100%", height: "auto" }}>
            <b>You</b>
            <Flex p={5}>
                {message}
            </Flex>
        </div>
    );
}

export default HumanChatMsg;
