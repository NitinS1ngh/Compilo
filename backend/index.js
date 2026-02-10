const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.get('/', (req, res) => {
  res.send('Compilo backend is running 🚀');
});
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const JDoodleClientID = process.env.JDOODLE_CLIENT_ID;
const JDoodleClientSecret = process.env.JDOODLE_CLIENT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const LANGUAGE_OPTIONS = {
  c: { language: 'c', versionIndex: '0' },
  cpp: { language: 'cpp17', versionIndex: '0' },
  java: { language: 'java', versionIndex: '0' },
  python: { language: 'python3', versionIndex: '0' },
  javascript: { language: 'nodejs', versionIndex: '0' },
  go: { language: 'go', versionIndex: '0' },
  csharp: { language: 'csharp', versionIndex: '0' },
  php: { language: 'php', versionIndex: '0' },
  ruby: { language: 'ruby', versionIndex: '0' },
  kotlin: { language: 'kotlin', versionIndex: '0' },
  swift: { language: 'swift', versionIndex: '0' },
  rust: { language: 'rust', versionIndex: '0' },
};


app.post('/compile', async (req, res) => {
  const { code, input, language } = req.body;
  const selection = LANGUAGE_OPTIONS[language] || LANGUAGE_OPTIONS.java;
  
    try {
      const response = await axios.post('https://api.jdoodle.com/v1/execute', {
        script: code,
        language: selection.language,
        versionIndex: selection.versionIndex,
        clientId: JDoodleClientID,
        clientSecret: JDoodleClientSecret,
        stdin: input,
      });
  
      res.json({
        status: 'success',
        output: response.data.output,
      });
    } catch (error) {
      console.error('Error executing code:', error);
      res.json({
        status: 'error',
        message: 'Failed to execute code',
      });
    }
  });

app.post('/ask-ai', async (req, res) => {
  const { code, model, language } = req.body;
  const requestedModel = model || GEMINI_MODEL;
  const selectedLanguage = language || 'the provided language';

  console.log('Ask AI request received', {
    hasCode: Boolean(code),
    model: requestedModel || null,
  });

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Code is required',
      });
    }

    if (!genAI) {
      return res.status(500).json({
        status: 'error',
        message: 'GEMINI_API_KEY is not set',
      });
    }

    try {
      const pickSupportedModel = async () => {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(GEMINI_API_KEY)}`;
          const response = await axios.get(url);
          const models = response?.data?.models || [];
          const firstUsable = models.find((item) =>
            (item.supportedGenerationMethods || []).includes('generateContent')
          );

          return firstUsable?.name || null;
        } catch (error) {
          console.error('Error listing models:', error?.message || error);
          return null;
        }
      };

      let modelName = requestedModel;
      if (!modelName) {
        modelName = await pickSupportedModel();
        if (!modelName) {
          return res.status(500).json({
            status: 'error',
            message: 'No supported models available for generateContent',
          });
        }
      }

      const prompt = [
        'You are a helpful coding assistant.',
        `Review the ${selectedLanguage} code below and respond ONLY with valid JSON.`,
        'JSON schema:',
        '{',
        '  "isCorrect": boolean,',
        '  "summary": string,',
        '  "issues": string[],',
        '  "correctedCode": string',
        '}',
        'Rules:',
        '- If code is correct, set isCorrect=true, issues=[] and correctedCode="".',
        '- If incorrect, set isCorrect=false and provide a minimal correctedCode.',
        '- summary should be 1 short sentence.',
        '- Respond with JSON only. No extra text.',
        '',
        'Code:',
        code,
      ].join('\n');

      const generateWithModel = async (name) => {
        const aiModel = genAI.getGenerativeModel({ model: name });
        const result = await aiModel.generateContent(prompt);
        return result.response.text();
      };

      let text;
      try {
        text = await generateWithModel(modelName);
      } catch (error) {
        const message = error?.message || '';
        const isNotFound = message.includes('404') || message.toLowerCase().includes('not found');
        if (requestedModel && isNotFound) {
          const fallbackModel = await pickSupportedModel();
          if (fallbackModel) {
            console.warn('Requested model not supported, falling back to', fallbackModel);
            text = await generateWithModel(fallbackModel);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      let parsed = null;
      try {
        let jsonText = text;
        const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
        if (fencedMatch && fencedMatch[1]) {
          jsonText = fencedMatch[1];
        }
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn('Failed to parse AI JSON response');
      }

      return res.json({
        status: 'success',
        suggestions: text,
        data: parsed,
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error?.message || error);
      if (error?.stack) {
        console.error(error.stack);
      }
      if (error?.response?.data) {
        console.error('Upstream error data:', error.response.data);
      }
      return res.status(500).json({
        status: 'error',
        message: error?.message || 'Failed to generate suggestions',
      });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
