import React from 'react';
import { ListItem, } from '@chakra-ui/react'

function CiteAudioItem({ text, start, end }: { text: string, start: string, end: string }) {

    return (
        <ListItem p={4}>
            From {start} to {end}, "{text}"
        </ListItem>
    );
}

export default CiteAudioItem;
