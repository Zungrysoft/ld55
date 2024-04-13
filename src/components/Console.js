import '../App.css';

function buttonText(inputState) {
    if (inputState === 'type') {
        return "Send"
    }

    return "Skip"
}

function Console({ text, inputState, onChange, onConfirm }) {
    return (
        <div className="console">
            <input
                type="text"
                className="user-input"
                disabled={inputState !== 'type'}
                placeholder="Enter command..."
            />
            <button
                className="confirm-button"
                onClick={onConfirm}
            >{buttonText(inputState)}</button>
        </div>
    );
}

export default Console;
