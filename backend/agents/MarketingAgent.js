/**
 * Marketing Agent - Super Marketer with 6 Specialized Sub-Agents
 *
 * Architecture:
 * Main Agent orchestrates 6 expert sub-agents:
 * 1. Market Research Analyst - Audience, Trends, Competition
 * 2. SEO Specialist - Keywords, On-page, Off-page
 * 3. Content Strategist - Content Pillars, Calendar, Formats
 * 4. Social Media Manager - Platforms, Engagement, Scheduling
 * 5. Campaign Manager - Planning, Execution, Optimization
 * 6. Analytics Expert - Data Analysis, Reporting, Insights
 *
 * Each sub-agent provides expert-level results to the main agent
 * for comprehensive marketing plan generation and execution.
 *
 * @author Ona AI
 * @created 2025-10-23
 */

const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger');

class MarketingAgent {
  constructor() {
    this.name = 'Marketing Agent';
    this.icon = '📢'; // Megaphone emoji
    this.description = 'Develops strategies, creates content, and analyzes campaigns with specialized sub-agents.';
    
    this.proModel = 'gemini-2.5-pro';
    this.flashModel = 'gemini-2.5-flash';

    if (!process.env.API_KEY) {
      logger.warn('[MarketingAgent] API_KEY is not set. Marketing Agent will not be able to make real API calls.');
    }

    // 6 Sub-Agents with their specializations and system prompts
    this.subAgents = {
      marketResearch: {
        name: 'Market Research Analyst',
        icon: '📊',
        expertise: 'Target audience identification, market trends, competitive analysis, SWOT analysis.',
        systemPrompt: `You are a Market Research Analyst. Your task is to provide comprehensive market research based on the user's request.
Focus on identifying target demographics, analyzing market trends, and evaluating competitor strategies.
Provide actionable insights and data-driven recommendations.
`
      },

      seoSpecialist: {
        name: 'SEO Specialist',
        icon: '📈',
        expertise: 'Keyword research, on-page optimization, off-page strategies, technical SEO, content gaps.',
        systemPrompt: `You are an SEO Specialist. Your task is to optimize the search engine strategy for a given product or service.
Focus on keyword identification, on-page and off-page SEO tactics, and technical SEO recommendations.
Provide concrete steps to improve search rankings and organic traffic.
`
      },

      contentStrategist: {
        name: 'Content Strategist',
        icon: '✍️',
        expertise: 'Content pillar development, content calendar, format selection (blogs, video, infographics), tone of voice.',
        systemPrompt: `You are a Content Strategist. Your task is to develop a compelling content strategy for a given topic and target audience.
Focus on content pillars, potential content formats (blog posts, videos, social media updates), content calendar ideas, and tone of voice.
Provide a clear plan for content creation and distribution.
`
      },

      socialMediaManager: {
        name: 'Social Media Manager',
        icon: '📱',
        expertise: 'Platform-specific strategies, engagement tactics, content scheduling, community management, analytics interpretation.',
        systemPrompt: `You are a Social Media Manager. Your task is to manage social media presence for a product or service on specified platforms.
Focus on platform-specific content ideas, engagement strategies, and a sample content calendar.
Provide creative and effective ways to boost brand visibility and community interaction.
`
      },

      campaignManager: {
        name: 'Campaign Manager',
        icon: '🚀',
        expertise: 'Campaign planning, budgeting, channel selection, A/B testing, performance monitoring, ROI analysis.',
        systemPrompt: `You are a Campaign Manager. Your task is to plan and outline a marketing campaign based on a specific goal, budget, and duration.
Focus on campaign objectives, target audience segmentation, channel selection, creative ideas, and key performance indicators (KPIs).
Provide a structured plan for launching and managing the campaign.
`
      },

      analyticsExpert: {
        name: 'Analytics Expert',
        icon: '📉',
        expertise: 'Data collection, interpretation, reporting, trend identification, actionable insights, dashboard creation.',
        systemPrompt: `You are an Analytics Expert. Your task is to analyze marketing data and provide actionable insights.
Focus on interpreting provided data, identifying trends, calculating key metrics (e.g., ROI, CTR, conversion rates), and recommending improvements.
Provide a clear summary of findings and strategic recommendations.
`
      }
    };
  }

  /**
   * Helper to make Gemini API calls with Google Search tool
   */
  async _callGeminiWithSearch(systemPrompt, userPrompt) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: this.flashModel,
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        tools: [{ googleSearch: {} }], // Enable Google Search grounding
      }
    });
    // Extract text and grounding chunks
    const textResult = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text: textResult, groundingChunks: groundingChunks };
  }

  /**
   * Execute a task using the appropriate sub-agent
   */
  async executeTask(task) {
    logger.info(`[MarketingAgent] Executing task: ${task.type}`);

    if (!process.env.API_KEY) {
      throw new Error('API_KEY is not configured. Cannot make real AI calls.');
    }

    // Simulate network delay for consistency with other agents
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      switch (task.type) {
        case 'marketResearch':
          return await this.conductMarketResearch(task);
        case 'seoSpecialist':
          return await this.optimizeSEOStrategy(task);
        case 'contentStrategist':
          return await this.developContentStrategy(task);
        case 'socialMediaManager':
          return await this.manageSocialMedia(task);
        case 'campaignManager':
          return await this.launchMarketingCampaign(task);
        case 'analyticsExpert':
          return await this.analyzeMarketingData(task);
        case 'generateMarketingPlan': // For full orchestration, if implemented
          return await this.generateMarketingPlan(task.prompt);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[MarketingAgent] Error executing task ${task.type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sub-Agent 1: Market Research Analyst
   */
  async conductMarketResearch(task) {
    const subAgent = this.subAgents.marketResearch;
    const { targetAudience, productService, competitors } = task;

    const userPrompt = `Conduct market research for a "${productService}" targeting "${targetAudience}".
Consider the following competitors: "${competitors || 'N/A'}".

Provide:
1.  Overview of the target audience (demographics, psychographics, needs).
2.  Current market trends relevant to the product/service.
3.  Competitive landscape analysis (SWOT for key competitors).
4.  Key opportunities and threats.
5.  Actionable recommendations based on findings.`;

    const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Contains text and groundingChunks
      message: 'Market research conducted successfully'
    };
  }

  /**
   * Sub-Agent 2: SEO Specialist
   */
  async optimizeSEOStrategy(task) {
    const subAgent = this.subAgents.seoSpecialist;
    const { productService, keywords } = task;

    const userPrompt = `Optimize the SEO strategy for "${productService}".
Focus on these primary keywords: "${keywords}".

Provide:
1.  Detailed keyword analysis (search volume, difficulty, intent).
2.  On-page SEO recommendations (title tags, meta descriptions, content structure).
3.  Off-page SEO strategies (link building, local SEO if applicable).
4.  Technical SEO suggestions (site speed, mobile-friendliness, crawlability).
5.  Content ideas to target long-tail keywords.`;

    const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Contains text and groundingChunks
      message: 'SEO strategy optimized successfully'
    };
  }

  /**
   * Sub-Agent 3: Content Strategist
   */
  async developContentStrategy(task) {
    const subAgent = this.subAgents.contentStrategist;
    const { topic, targetAudience } = task;

    const userPrompt = `Develop a content strategy for the topic "${topic}" targeting "${targetAudience}".

Provide:
1.  Core content pillars and themes.
2.  Recommended content formats (blog posts, videos, infographics, podcasts, etc.).
3.  Ideas for a content calendar (e.g., 5-7 specific content titles/ideas).
4.  Suggested tone of voice and key messaging.
5.  Distribution channels for the content.`;

    const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Contains text and groundingChunks
      message: 'Content strategy developed successfully'
    };
  }

  /**
   * Sub-Agent 4: Social Media Manager
   */
  async manageSocialMedia(task) {
    const subAgent = this.subAgents.socialMediaManager;
    const { platform, productService } = task;

    const userPrompt = `Outline a social media management plan for "${productService}" on "${platform}".

Provide:
1.  Platform-specific content ideas (e.g., image types, video styles, text posts).
2.  Engagement tactics (e.g., contests, Q&A, polls).
3.  Sample content calendar for one week (e.g., specific post ideas for each day).
4.  Hashtag strategy.
5.  Community interaction guidelines.`;

    const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Contains text and groundingChunks
      message: 'Social media plan drafted successfully'
    };
  }

  /**
   * Sub-Agent 5: Campaign Manager
   */
  async launchMarketingCampaign(task) {
    const subAgent = this.subAgents.campaignManager;
    const { campaignGoal, budget, duration } = task;

    const userPrompt = `Plan a marketing campaign with the goal to "${campaignGoal}".
Budget: ${budget}. Duration: ${duration}.

Provide:
1.  Campaign objectives and KPIs.
2.  Target audience segmentation for the campaign.
3.  Recommended marketing channels (e.g., Google Ads, Facebook Ads, email marketing).
4.  Creative brief ideas for advertisements.
5.  High-level budget allocation across channels.
6.  Timeline and key milestones.`;

    const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Contains text and groundingChunks
      message: 'Marketing campaign outlined successfully'
    };
  }

  /**
   * Sub-Agent 6: Analytics Expert
   */
  async analyzeMarketingData(task) {
    const subAgent = this.subAgents.analyticsExpert;
    const { dataToAnalyze, metrics, searchQuery, fileData } = task;

    if (fileData && fileData.data) {
        // New path for file analysis using Gemini Pro
        logger.info(`[${this.name}] Analyzing uploaded data file.`);
        const userPrompt = `Analyze the attached data file.
        Instructions for analysis: "${dataToAnalyze || 'Provide a general summary and key insights.'}"
        Key Metrics to focus on: "${metrics || 'N/A'}"`;
        
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: this.proModel,
            contents: [{
                parts: [
                    { text: `${subAgent.systemPrompt}\n\n${userPrompt}` },
                    { inlineData: { data: fileData.data, mimeType: fileData.mimeType } }
                ]
            }],
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        
        return {
            success: true,
            subAgent: subAgent.name,
            icon: subAgent.icon,
            result: { text: response.text }, // No grounding chunks for file analysis
            message: 'Data file analyzed successfully'
        };

    } else {
        // Existing path for web search-based analysis
        logger.info(`[${this.name}] Analyzing data using web search.`);
        const userPrompt = `Analyze the following marketing data:
        "${dataToAnalyze || 'N/A'}".
        Search for: "${searchQuery || 'general marketing trends'}".
        Focus on these key metrics: "${metrics || 'N/A'}".

        Provide:
        1.  Summary of key findings and trends from the data and your web search.
        2.  Performance analysis of specified metrics.
        3.  Identification of strengths, weaknesses, opportunities, and threats.
        4.  Actionable recommendations to improve marketing effectiveness.
        5.  Suggestions for further data collection or analysis.`;

        const response = await this._callGeminiWithSearch(subAgent.systemPrompt, userPrompt);

        return {
            success: true,
            subAgent: subAgent.name,
            icon: subAgent.icon,
            result: response,
            message: 'Marketing data analyzed successfully'
        };
    }
  }

  /**
   * Orchestrate all sub-agents for a full marketing plan
   * This is a conceptual example for backend orchestration.
   * For the frontend, individual tasks are exposed.
   */
  async generateMarketingPlan(prompt) {
    logger.info('[MarketingAgent] Generating full marketing plan with all sub-agents...');

    const results = {
      success: true,
      planFor: prompt,
      subAgentResults: {}
    };

    try {
      // 1. Market Research
      logger.info('[MarketingAgent] Sub-Agent 1: Market Research Analyst working...');
      results.subAgentResults.marketResearch = await this.conductMarketResearch({
        targetAudience: `target audience for ${prompt}`,
        productService: prompt,
        competitors: 'leading competitors in the market'
      });

      // 2. SEO Specialist
      logger.info('[MarketingAgent] Sub-Agent 2: SEO Specialist working...');
      results.subAgentResults.seo = await this.optimizeSEOStrategy({
        productService: prompt,
        keywords: 'key terms and phrases related to the product/service'
      });

      // 3. Content Strategist
      logger.info('[MarketingAgent] Sub-Agent 3: Content Strategist working...');
      results.subAgentResults.content = await this.developContentStrategy({
        topic: `marketing content for ${prompt}`,
        targetAudience: `target audience for ${prompt}`
      });

      // 4. Social Media Manager
      logger.info('[MarketingAgent] Sub-Agent 4: Social Media Manager working...');
      results.subAgentResults.socialMedia = await this.manageSocialMedia({
        platform: 'all major platforms',
        productService: prompt
      });

      // 5. Campaign Manager
      logger.info('[MarketingAgent] Sub-Agent 5: Campaign Manager working...');
      results.subAgentResults.campaign = await this.launchMarketingCampaign({
        campaignGoal: `increase awareness and sales for ${prompt}`,
        budget: 'approx $10,000',
        duration: '1 month'
      });

      // 6. Analytics Expert (conceptual, needs data from previous steps or mock)
      logger.info('[MarketingAgent] Sub-Agent 6: Analytics Expert working...');
      results.subAgentResults.analytics = await this.analyzeMarketingData({
        dataToAnalyze: 'hypothetical website traffic and social media engagement data post-launch',
        metrics: 'website visits, conversion rate, social media engagement'
      });


      results.message = 'Full marketing plan generated successfully by all 6 sub-agents';
      results.summary = {
        totalSubAgents: 6,
        completedTasks: Object.keys(results.subAgentResults).length,
        status: 'complete'
      };

      return results;

    } catch (error) {
      logger.error(`[MarketingAgent] Full marketing plan generation error: ${error.message}`);
      results.success = false;
      results.error = error.message;
      return results;
    }
  }
}

module.exports = MarketingAgent;