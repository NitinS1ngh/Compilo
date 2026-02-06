import React, { useState } from 'react';

const AskAISection = ({ handleAskAI, aiResult, onReplaceCode }) => {
  const [result, setResult] = useState(null);

  const handleButtonClick = async () => {
    const aiResponse = await handleAskAI();
    setResult(aiResponse);
  };

  const display = aiResult || result;
  const isCorrect = display?.isCorrect === true;
  const correctedCode = display?.correctedCode || '';
  const issues = display?.issues || [];

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg h-full">
      <button
        onClick={handleButtonClick}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-4"
      >
        Ask AI
      </button>
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto h-[70%]">
        <h2 className="text-sm font-semibold mb-2 text-white">AI Suggestions:</h2>
        {display ? (
          <div className="text-gray-300 whitespace-pre-wrap">
            {isCorrect ? (
              <div>Code is right.</div>
            ) : (
              <div>
                {display.summary ? <div className="mb-2">{display.summary}</div> : null}
                {issues.length > 0 ? (
                  <div className="mb-2">
                    {issues.map((item, index) => (
                      <div key={index}>- {item}</div>
                    ))}
                  </div>
                ) : null}
                {correctedCode ? (
                  <pre className="bg-gray-800 p-2 rounded text-sm overflow-auto">
                    {correctedCode}
                  </pre>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <pre className="text-gray-300 whitespace-pre-wrap"></pre>
        )}
      </div>
      {!isCorrect && correctedCode ? (
        <button
          onClick={() => onReplaceCode(correctedCode)}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mt-3"
        >
          Replace Editor Code
        </button>
      ) : null}
    </div>
  );
};

export default AskAISection;
