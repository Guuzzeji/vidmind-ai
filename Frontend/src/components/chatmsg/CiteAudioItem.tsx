import React from 'react';
import { ListItem, } from '@chakra-ui/react'

function CiteAudioItem({ text }: { text: string }) {

    return (
        <ListItem>
            "{text}"
        </ListItem>
    );
}

export default CiteAudioItem;
