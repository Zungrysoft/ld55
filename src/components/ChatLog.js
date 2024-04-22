import '../App.css';
import { useEffect, useRef } from 'react';
import { getJurorData } from '../helpers/juror';
import { isFirefox } from '../helpers/helpers';

function paragraphToElement(paragraph) {
    const textString = paragraph?.text || ""
    const textSpeaker = paragraph?.speaker
    const textColor = getJurorData(textSpeaker).properties.textColor

    return <p className="console-text" key={paragraph.key} style={{color: textColor}}>{textString}</p>
}

function ChatLog({ logData }) {
    const chatLogRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        if (isScrolledToBottom()) {
            scrollToBottom();
        }
    }, [logData]);

    function scrollToBottom() {
        // Firefox seems to be the only browser that handles smooth scrolling correctly
        if (isFirefox()) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        else {
            endRef.current?.scrollIntoView();
        }
    }

    function isScrolledToBottom() {
        return true
        // const chatLog = chatLogRef.current;
        // return chatLog.scrollHeight - chatLog.scrollTop <= chatLog.clientHeight + 50;
    }

    return (
        <div className="chat-log" ref={chatLogRef}>
            {(logData || []).map(paragraph => paragraphToElement(paragraph))}
            <div ref={endRef}/>
        </div>
    );
}

export default ChatLog;
