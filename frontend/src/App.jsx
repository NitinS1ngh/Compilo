import React, { useState } from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';

import CodeEditor from './components/CodeEditor';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import AskAISection from './components/AskAiSection';
import './App.css'; // Ensure this file contains any necessary global styles or custom fonts

const App = () => {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
  int number;
  if (cin >> number) {
    cout << number << endl;
  }
  return 0;
}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('cpp');
  const [aiResult, setAiResult] = useState(null);

  const languageOptions = [
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript (Node.js)' },
    { value: 'go', label: 'Go' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
    { value: 'rust', label: 'Rust' },
  ];

  const handleRunCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/compile', { code, input, language });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Failed to execute code');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    try {
      const response = await axios.post('http://localhost:3000/ask-ai', { code, language });
      if (response.data?.status && response.data.status !== 'success') {
        return response.data.message || 'Failed to get suggestions';
      }
      const data = response.data?.data || null;
      if (data) {
        setAiResult(data);
        return data;
      }
      const text = response.data?.suggestions || 'No suggestions available';
      setAiResult({
        isCorrect: false,
        summary: 'AI response was not structured.',
        issues: [text],
        correctedCode: '',
      });
      return text;
    } catch (error) {
      console.error('Error asking AI:', error);
      const message = error?.response?.data?.message || 'Failed to get suggestions';
      setAiResult({
        isCorrect: false,
        summary: message,
        issues: [],
        correctedCode: '',
      });
      return message;
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-300 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-gray-800">
        <h1 className="text-4xl font-bold text-white font-roboto-mono">
          COM<span className='text-4xl font-bold text-yellow-600 font-roboto-mono'>PILO</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button
              onClick={handleRunCode}
              disabled={loading}
              className="text-white p-2 rounded-full transition"
            >
              <FaPlay className="text-xl" />
            </button>
            <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
              Run
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white text-sm px-3 py-2 rounded-md outline-none"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="flex flex-grow p-4">
        <div className="w-[60%] h-full mr-4">
          <CodeEditor code={code} setCode={setCode} />
        </div>
        <div className="flex flex-col w-[40%] h-full">
          <div className="h-[20%] mb-4">
            <InputSection input={input} setInput={setInput} />
          </div>
          <div className="h-[35%] mb-4">
            <OutputSection output={output} loading={loading} />
          </div>
          <div className="h-[45%]">
            <AskAISection
              handleAskAI={handleAskAI}
              aiResult={aiResult}
              onReplaceCode={(newCode) => setCode(newCode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
