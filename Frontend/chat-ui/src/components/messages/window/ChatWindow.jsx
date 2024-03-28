import React from 'react';
import { useSelector } from 'react-redux';

import AIMessage from '../AI/AIMessage';
import HumanMessage from '../HumanMessage';

function ChatWindow() {
    const chatMessages = useSelector((state) => state.ChatInput.messages);

    return (
        <div style={{ width: "100%", height: "auto", overflowX: 'hidden', overflowY: "scroll" }}>
            {chatMessages.map((message, i) => {
                // console.log(message.data.message)
                if (message.sender === "human") {
                    return (
                        <>
                            <HumanMessage
                                key={i}
                                message={message.data.prompt}
                                image64={message.data.imgBase64} />
                        </>
                    );
                }

                return (
                    <>
                        <AIMessage
                            audioCite={message.data.message.cite.audios}
                            imageCite={message.data.context.Frames}
                            key={i}
                            message={message.data.message.text} />
                        <br />
                    </>
                );
            })}
        </div>
    );
}

export default ChatWindow;
