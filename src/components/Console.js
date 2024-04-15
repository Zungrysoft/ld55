import { useEffect, useRef, useState } from 'react';
import '../App.css';

function buttonText(inputState) {
    if (inputState === 'send') {
        return "Send"
    }
    if (inputState === 'next') {
        return "Next"
    }

    return "Skip"
}

function Console({ inputState, onConfirm }) {
    const inputRef = useRef(null);
    const [history, setHistory] = useState({list: [], selection: 0})

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                clickButton()
            }
            if (event.key === 'ArrowUp') {
                historyBack()
            }
            if (event.key === 'ArrowDown') {
                historyForward()
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onConfirm]);

    useEffect(() => {
        if (inputState === 'send' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputState]);

    function clickButton() {
        const inputString = inputRef.current?.value
        if (inputString) {
            inputRef.current.value = ""
            onConfirm(inputString)
            setHistory(prevHistory => ({
                list: [...prevHistory.list, inputString.endsWith(" ") ? inputString : inputString + " "],
                selection: 0,
            }))
        }
        else {
            onConfirm("")
        }
    }

    function historyBack() {
        if (inputState !== 'send') {
            return
        }

        if (inputRef.current) {
            setHistory(prevHistory => {
                const newSelection = Math.min(prevHistory.selection + 1, prevHistory.list.length)
                
                // Set text box value
                if (newSelection === 0) {
                    inputRef.current.value = ""
                }
                else {
                    inputRef.current.value = prevHistory.list[prevHistory.list.length-newSelection]
                }
                const selectionPos = inputRef.current?.value?.length || 0
                setTimeout(() => {inputRef.current.setSelectionRange(selectionPos, selectionPos)}, 10)

                return {
                    list: prevHistory.list,
                    selection: newSelection,
                }
            })
        }
    }

    function historyForward() {
        if (inputState !== 'send') {
            return
        }
        
        if (inputRef.current) {
            setHistory(prevHistory => {
                const newSelection = Math.max(prevHistory.selection - 1, 0)

                // Set text box value
                if (newSelection === 0) {
                    inputRef.current.value = ""
                }
                else {
                    inputRef.current.value = prevHistory.list[prevHistory.list.length-newSelection]
                }
                const selectionPos = inputRef.current?.value?.length || 0
                setTimeout(() => {inputRef.current.setSelectionRange(selectionPos, selectionPos)}, 10)

                return {
                    list: prevHistory.list,
                    selection: newSelection,
                }
            })
        }
    }

    return (
        <div className="console">
            <input
                type="text"
                ref={inputRef}
                className="user-input"
                disabled={inputState !== 'send'}
                placeholder="Enter command..."
            />
            <button
                className="confirm-button"
                onClick={clickButton}
            >{buttonText(inputState)}</button>
        </div>
    );
}

export default Console;
