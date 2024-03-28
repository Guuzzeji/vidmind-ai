import React from 'react';
import { Flex, Image, Text } from '@chakra-ui/react';

function HumanChatMsg({ message, image64 }) {

    return (
        <div style={{ width: "100%", height: "auto" }}>
            <b>You</b>
            <Flex p={5}>
                {message ?
                    <Text style={{ whiteSpace: "pre-line" }}>
                        {message}
                    </Text>
                    : null
                }

                {image64 ?
                    <Image borderRadius={5} borderStyle="solid" borderWidth="2px" src={"data:image/png;base64," + image64} />
                    : null
                }
            </Flex>
        </div>
    );
}

export default HumanChatMsg;
