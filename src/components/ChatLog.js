import '../App.css';
import narratorData from '../data/jurors/narrator.json';
import cliveData from '../data/jurors/clive.json';
import { useEffect, useRef } from 'react';

function getJurorData(juror) {
    if (juror === 'clive') {return cliveData}

    return narratorData
}

function paragraphToElement(paragraph) {
    const textString = paragraph?.text || ""
    const textSpeaker = paragraph?.speaker
    const textColor = getJurorData(textSpeaker).properties.textColor

    return <p style={{color: textColor}}>{textString}</p>
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
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    function isScrolledToBottom() {
        const chatLog = chatLogRef.current;
        return chatLog.scrollHeight - chatLog.scrollTop <= chatLog.clientHeight + 50;
    }

    return (
        <div className="chat-log" ref={chatLogRef}>
            {(logData.log || []).map(paragraph => paragraphToElement(paragraph))}
            <div ref={endRef}/>
        </div>
    );
}

export default ChatLog;
