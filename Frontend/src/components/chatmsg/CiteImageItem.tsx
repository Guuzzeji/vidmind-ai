import React from 'react';
import { ListItem, Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';

function CiteImageItem({ imgUrl, start, end }: { imgUrl: string, start: string, end: string }) {

    return (
        <ListItem>
            From {start} to {end}, <Link href={imgUrl} isExternal>
                Image <ExternalLinkIcon mx='2px' />
            </Link>
        </ListItem>
    );
}

export default CiteImageItem;
