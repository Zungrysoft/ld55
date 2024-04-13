import { useEffect, useRef } from 'react';
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

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                clickButton()
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
        }
        else {
            onConfirm("")
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
