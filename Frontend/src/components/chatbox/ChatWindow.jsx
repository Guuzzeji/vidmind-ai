import React from 'react';

import AIChatMsg from '../chatmsg/AIChatMsg';
import HumanChatMsg from '../chatmsg/HumanChatMsg';

import { useSelector } from 'react-redux';

function ChatWindow() {
    const chatMessages = useSelector((state) => state.chatsender.messages);

    return (
        <div style={{ width: "100%", height: "auto", overflowX: 'hidden', overflowY: "scroll" }}>
            {chatMessages.map((message, i) => {
                // console.log(message.data.message)
                if (message.sender === "human") {
                    return (
                        <>
                            <HumanChatMsg key={i} message={message.data.prompt} image64={message.data.imgBase64} />
                        </>
                    );
                }

                return (
                    <>
                        <AIChatMsg audioCite={message.data.message.cite.audios} imageCite={message.data.context.Frames} key={i} message={message.data.message.text} />
                        <br />
                    </>
                );
            })}
        </div>
    );
}

export default ChatWindow;
