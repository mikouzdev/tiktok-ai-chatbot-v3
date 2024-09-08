import { useState, useEffect } from "react";
import "./css/PromptEditPanel.css";

function PromptEditPanel() {
    const [selectedOption, setSelectedOption] = useState('defaultPrompt');
    const [textContent, setTextContent] = useState({
        defaultPrompt: '',
        followerPrompt: '',
        friendPrompt: ''
    });
    const [applyStatus, setApplyStatus] = useState(null);

    // Load prompts from local storage on component mount
    useEffect(() => {
        const savedPrompts = localStorage.getItem('prompts');
        if (savedPrompts) {
            setTextContent(JSON.parse(savedPrompts));
        }
    }, []);

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleTextChange = (e) => {
        const updatedContent = {
            ...textContent,
            [selectedOption]: e.target.value
        };
        setTextContent(updatedContent);
        // Save to local storage whenever text content changes
        localStorage.setItem('prompts', JSON.stringify(updatedContent));
    };

    // sends the prompts to the backend
    const handleApply = () => {
        setApplyStatus('applying');
        fetch('/api/updatePrompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(textContent),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            setApplyStatus('success');
            setTimeout(() => setApplyStatus(null), 4000); // Clear status after 3 seconds
        })
        .catch((error) => {
            console.error('Error:', error);
            setApplyStatus('error');
            setTimeout(() => setApplyStatus(null), 5000); // Clear status after 3 seconds
        });
    };

    return (
        <div className="prompt-edit-panel">
            <div className="prompt-edit-panel-header">
                <h1>Prompt Edit Panel</h1>
                <p>System prompts for different follow roles.</p>
            </div>
            <div className="prompt-edit-panel-body">
            <select value={selectedOption} onChange={handleOptionChange} className="prompt-edit-select">
                <option value="defaultPrompt">Default</option>
                <option value="followerPrompt">Follower</option>
                <option value="friendPrompt">Friend</option>
            </select>
            <textarea 
            spellcheck="false"
                value={textContent[selectedOption]}
                onChange={handleTextChange}
                placeholder="Enter text here"
                className="prompt-edit-textarea"
                required
            />
            <button onClick={handleApply} className="prompt-edit-button" disabled={applyStatus === 'applying'}>
                {applyStatus === 'applying' ? 'Applying...' : 'Apply'}
            </button>
            {applyStatus === 'success' && <div className="apply-status success">Prompts updated successfully!</div>}
            {applyStatus === 'error' && <div className="apply-status error">Error updating prompts. Please try again.</div>}
            </div>
        </div>
    );
}

export default PromptEditPanel;