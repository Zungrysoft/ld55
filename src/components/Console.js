import { useEffect, useRef } from 'react';
import '../App.css';

function buttonText(inputState) {
    if (inputState === 'type') {
        return "Send"
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
    }, []);

    useEffect(() => {
        if (inputState === 'type' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputState]);

    function clickButton() {
        const inputString = inputRef.current?.value
        if (inputString) {
            inputRef.current.value = ""
            onConfirm(inputString)
        }
        else if (inputState === 'read') {
            onConfirm("")
        }
    }

    console.log(inputState)

    return (
        <div className="console">
            <input
                type="text"
                ref={inputRef}
                className="user-input"
                disabled={inputState !== 'type'}
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
