/**
 * AI Routes
 * AI router
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();

// AI Provider configurations
const AI_PROVIDERS = {
  deepseek: {
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
  },
  qwen: {
    baseUrl: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
    apiKey: process.env.QWEN_API_KEY,
    model: 'qwen-turbo',
  },
  together: {
    baseUrl: process.env.TOGETHER_BASE_URL || 'https://api.together.xyz/v1',
    apiKey: process.env.TOGETHER_API_KEY,
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  },
};

/**
 * POST /api/ai/chat
 * Chat with AI assistant
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider = 'deepseek', messages, model, temperature = 0.7, maxTokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new ValidationError('Messages array is required');
    }

    const config = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
    if (!config || !config.apiKey) {
      throw new ValidationError(`AI provider '${provider}' is not configured`);
    }

    // Call AI API
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: model || config.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    const data = response.data;

    res.json({
      success: true,
      data: {
        provider,
        model: data.model || config.model,
        message: data.choices[0]?.message,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/complete
 * Text completion
 */
router.post('/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider = 'deepseek', prompt, maxTokens = 500 } = req.body;

    if (!prompt) {
      throw new ValidationError('Prompt is required');
    }

    const config = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
    if (!config || !config.apiKey) {
      throw new ValidationError(`AI provider '${provider}' is not configured`);
    }

    const response = await axios.post(
      `${config.baseUrl}/completions`,
      {
        model: config.model,
        prompt,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/engineering-assistant
 * Engineering-specific AI assistant
 */
router.post('/engineering-assistant', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, discipline, context } = req.body;

    if (!question) {
      throw new ValidationError('Question is required');
    }

    const systemPrompt = `You are an expert engineering assistant specializing in ${discipline || 'general'} engineering.
Provide accurate, technical answers with relevant formulas, calculations, and industry standards.
When providing calculations, show your work step by step.
If you're unsure about something, acknowledge the limitation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context ? `Context: ${context}\n\nQuestion: ${question}` : question },
    ];

    const config = AI_PROVIDERS.deepseek;
    if (!config.apiKey) {
      throw new ValidationError('AI service is not configured');
    }

    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model,
        messages,
        temperature: 0.5,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    res.json({
      success: true,
      data: {
        answer: response.data.choices[0]?.message?.content,
        provider: 'deepseek',
        usage: response.data.usage,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
