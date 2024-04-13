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
    const [lastCommand, setLastCommand] = useState()

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                clickButton()
            }
            if (event.key === 'ArrowUp') {
                getLast()
            }
            if (event.key === 'ArrowDown') {
                clearBox()
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
            setLastCommand(inputString)
        }
        else {
            onConfirm("")
        }
    }

    function clearBox() {
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    function getLast() {
        if (inputRef.current) {
            inputRef.current.value = lastCommand
            setTimeout(() => {inputRef.current.setSelectionRange(lastCommand.length, lastCommand.length)}, 10)
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
