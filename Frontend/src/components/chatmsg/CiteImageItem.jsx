import React from 'react';
import { ListItem, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

function secondsToTimestamp(convertSeconds) {
    let dateObj = new Date(convertSeconds * 1000);
    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes();
    let seconds = dateObj.getSeconds();

    return hours.toString().padStart(2, '0')
        + ':' + minutes.toString().padStart(2, '0')
        + ':' + seconds.toString().padStart(2, '0');
}

function CiteImageItem({ imgUrl, start, end }) {

    return (
        <ListItem>
            <Link href={imgUrl} isExternal>
                {secondsToTimestamp(start)} to {secondsToTimestamp(end)} <ExternalLinkIcon mx='2px' />
            </Link>
        </ListItem>
    );
}

export default CiteImageItem;
