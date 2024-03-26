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
    Text
} from '@chakra-ui/react'

import CiteAudioItem from './CiteAudioItem';
import CiteImageItem from './CiteImageItem';

function AIChatMsg({ message, audioCite, imageCite }: { message: string, audioCite: any[], imageCite: any[] }) {

    return (
        <div style={{ width: "100%", height: "auto" }}>
            <b>AI Message</b>
            <Flex p={5}>
                <Text style={{ whiteSpace: "pre-line" }}>
                    {message}
                </Text>
            </Flex>
            {/**Can check if user to hide this */}
            <Accordion allowToggle>
                <AccordionItem>
                    <h2>
                        <AccordionButton>
                            <Box as="span" flex='1' textAlign='left'>
                                Video Citation
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <Accordion allowToggle>
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex='1' textAlign='left'>
                                            Audio
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <UnorderedList>

                                        {audioCite?.map((item: any, i: number) => {
                                            return (
                                                <CiteAudioItem key={i} text={item.rawtext} />
                                            )
                                        })}

                                    </UnorderedList>
                                </AccordionPanel>
                            </AccordionItem>

                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box as="span" flex='1' textAlign='left'>
                                            Picture
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <UnorderedList>

                                        {imageCite?.map((item: any, i: number) => {
                                            return (
                                                <CiteImageItem key={i} imgUrl={item.imgurl} start={item.starttime + ''} end={item.endtime + ''} />
                                            )
                                        })}

                                    </UnorderedList>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

        </div>
    );
}

export default AIChatMsg;
