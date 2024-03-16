import React from 'react';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Flex,
    UnorderedList,
} from '@chakra-ui/react'

import CiteAudioItem from './CiteAudioItem';
import CiteImageItem from './CiteImageItem';

function AIChatMsg({ message }: { message: string }) {

    return (
        <div style={{ width: "100%", height: "auto", padding: "10px", margin: "10px" }}>
            <b>AI Message</b>
            <Flex p={5}>
                {message}
            </Flex>
            {/**Can check if user to hide this */}
            <Accordion allowToggle>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box as="span" flex='1' textAlign='left'>
                                Audio Cite
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <UnorderedList>

                            {/** Impliement list loop */}

                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box as="span" flex='1' textAlign='left'>
                                Picture Cite
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <UnorderedList>

                            {/** Impliement list loop */}

                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>

            </Accordion>
        </div>
    );
}

export default AIChatMsg;
