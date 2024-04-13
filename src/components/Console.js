import { useRef } from 'react';
import '../App.css';

function buttonText(inputState) {
    if (inputState === 'type') {
        return "Send"
    }

    return "Skip"
}

function Console({ inputState, onConfirm, }) {
    const inputRef = useRef(null);

    function clickButton() {
        const inputString = inputRef.current?.value
        if (inputString || inputString === "") {
            inputRef.current.value = ""
            onConfirm(inputString)
        }
    }

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
