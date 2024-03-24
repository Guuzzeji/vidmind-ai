import React from 'react';
import { Flex, Text } from '@chakra-ui/react'

function HumanChatMsg({ message }: { message: string }) {

    return (
        <div style={{ width: "100%", height: "auto" }}>
            <b>You</b>
            <Flex p={5}>
                <Text style={{ whiteSpace: "pre-line" }}>
                    {message}
                </Text>
            </Flex>
        </div>
    );
}

export default HumanChatMsg;
