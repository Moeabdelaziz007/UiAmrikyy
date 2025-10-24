/**
 * Coding Agent - Super Coder with 6 Specialized Sub-Agents
 *
 * Architecture:
 * Main Agent orchestrates 6 expert sub-agents:
 * 1. UI/UX Expert - Frontend & Design
 * 2. API Architect - Backend & APIs
 * 3. DevOps Engineer - Deployment & Infrastructure
 * 4. QA Specialist - Testing & Quality
 * 5. Documentation Writer - Docs & Guides
 * 6. Code Reviewer - Quality & Security
 *
 * Each sub-agent provides expert-level results to the main agent
 * for comprehensive code generation.
 *
 * @author Ona AI
 * @created 2025-10-23
 */

const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger'); // Assuming a logger utility exists

class CodingAgent {
  constructor() {
    this.name = 'Coding Agent';
    this.icon = '💻';
    this.description = 'Super coder with 6 specialized sub-agents';

    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!process.env.API_KEY) {
      logger.warn('[CodingAgent] API_KEY is not set. Coding Agent will not be able to make real API calls.');
    }

    // 6 Sub-Agents with their specializations and system prompts
    this.subAgents = {
      uiux: {
        name: 'UI/UX Expert',
        icon: '🎨',
        expertise: 'Frontend components, responsive design, accessibility, user experience',
        systemPrompt: `You are a UI/UX Expert specializing in:
- Modern frontend frameworks (React, Vue, Angular)
- Responsive design and mobile-first approach
- Accessibility (WCAG standards)
- User experience best practices
- CSS frameworks (Tailwind, Bootstrap)
- Component libraries (shadcn/ui, Material-UI)

Provide clean, production-ready frontend code with best practices.
`
      },

      api: {
        name: 'API Architect',
        icon: '🔌',
        expertise: 'REST/GraphQL APIs, backend logic, database design, authentication',
        systemPrompt: `You are an API Architect specializing in:
- RESTful API design
- GraphQL schemas
- Backend frameworks (Express, FastAPI, Django)
- Database design (SQL, NoSQL)
- Authentication & Authorization (JWT, OAuth)
- API security best practices

Provide scalable, secure backend code with proper error handling.
`
      },

      devops: {
        name: 'DevOps Engineer',
        icon: '🚀',
        expertise: 'CI/CD pipelines, Docker, Kubernetes, cloud deployment, infrastructure',
        systemPrompt: `You are a DevOps Engineer specializing in:
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Containerization (Docker, Docker Compose)
- Orchestration (Kubernetes, Docker Swarm)
- Cloud platforms (AWS, GCP, Azure)
- Infrastructure as Code (Terraform, CloudFormation)
- Monitoring and logging

Provide production-ready deployment configurations.
`
      },

      qa: {
        name: 'QA Specialist',
        icon: '✅',
        expertise: 'Unit tests, integration tests, E2E tests, test coverage',
        systemPrompt: `You are a QA Specialist specializing in:
- Unit testing (Jest, Mocha, Pytest)
- Integration testing
- End-to-end testing (Cypress, Playwright)
- Test-driven development (TDD)
- Code coverage analysis
- Performance testing

Provide comprehensive test suites with high coverage.
`
      },

      docs: {
        name: 'Documentation Writer',
        icon: '📚',
        expertise: 'Code docs, API docs, user guides, README files',
        systemPrompt: `You are a Documentation Writer specializing in:
- Code documentation (JSDoc, Docstrings)
- API documentation (OpenAPI/Swagger)
- User guides and tutorials
- README files
- Architecture diagrams
- Markdown formatting

Provide clear, comprehensive documentation.
`
      },

      reviewer: {
        name: 'Code Reviewer',
        icon: '🔍',
        expertise: 'Code quality, best practices, security, performance',
        systemPrompt: `You are a Code Reviewer specializing in:
- Code quality analysis
- Best practices enforcement
- Security vulnerability detection
- Performance optimization
- Design patterns
- SOLID principles

Provide detailed code reviews with actionable improvements.
`
      }
    };
  }

  /**
   * Execute a task using the appropriate sub-agent
   */
  async executeTask(task) {
    logger.info(`[CodingAgent] Executing task: ${task.type}`);

    if (!process.env.API_KEY) {
      throw new Error('API_KEY is not configured. Cannot make real AI calls.');
    }

    // Simulate network delay for consistency with other agents
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      const ai = getAi();
      switch (task.type) {
        case 'generateUI': // Changed from GENERATE_UI to match frontend
          return await this.generateUI(task, ai);

        case 'designAPI': // Changed from DESIGN_API to match frontend
          return await this.designAPI(task, ai);

        case 'createDeploymentConfig': // Changed from CREATE_DEPLOYMENT to match frontend
          return await this.createDeployment(task, ai);

        case 'writeTests': // Changed from WRITE_TESTS to match frontend
          return await this.writeTests(task, ai);

        case 'generateDocumentation': // Changed from GENERATE_DOCS to match frontend
          return await this.generateDocs(task, ai);

        case 'reviewCode': // Renamed 'REVIEW_CODE' for specific task, but not directly used by UI yet
          return await this.reviewCode(task.code, ai);

        // This would be orchestrated externally by a higher-level agent if needed
        case 'generateFullProject': 
          return await this.generateFullProject(task.prompt, ai); 

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[CodingAgent] Error executing task ${task.type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sub-Agent 1: UI/UX Expert - Generate frontend code
   */
  async generateUI(task, ai) {
    const subAgent = this.subAgents.uiux;
    const { projectDescription, component, framework } = task;

    const userPrompt = `Generate production-ready frontend code for a "${projectDescription}" project.
Focus on a "${component}" component using the "${framework}" framework.

Key requirements:
- Component structure
- Styling (Tailwind CSS preferred)
- Responsive design
- Accessibility features
- TypeScript types (if applicable)

Provide complete, runnable code.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 2000, // Adjust based on expected code length
        thinkingConfig: { thinkingBudget: 500 },
      }
    });
    const response = result.text; // Use .text to get string output

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'UI component generated successfully'
    };
  }

  /**
   * Sub-Agent 2: API Architect - Design backend API
   */
  async designAPI(task, ai) {
    const subAgent = this.subAgents.api;
    const { serviceDescription, endpoints, language } = task;

    const userPrompt = `Design a complete API for "${serviceDescription}".
Specify the API endpoints: ${endpoints}.
Target backend language: ${language}.

Include:
1. API endpoints (REST or GraphQL)
2. Request/Response schemas (JSON or GraphQL SDL)
3. Database models (if applicable)
4. Authentication logic (e.g., JWT, OAuth)
5. Error handling
6. Validation examples

Provide complete, production-ready backend code/schema.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 500 },
      }
    });
    const response = result.text;

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'API design completed successfully'
    };
  }

  /**
   * Sub-Agent 3: DevOps Engineer - Create deployment config
   */
  async createDeployment(task, ai) {
    const subAgent = this.subAgents.devops;
    const { serviceDescription, platform, ciCdTool } = task;

    const userPrompt = `Create deployment configuration for a "${serviceDescription}" application.
Target deployment platform: ${platform}.
CI/CD tool: ${ciCdTool}.

Include:
1. Dockerfile
2. docker-compose.yml (if applicable)
3. CI/CD pipeline configuration (e.g., .github/workflows/main.yml)
4. Kubernetes manifests (if needed)
5. Environment variables setup
6. Deployment instructions

Provide complete, production-ready deployment files.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 400 },
      }
    });
    const response = result.text;

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Deployment configuration created successfully'
    };
  }

  /**
   * Sub-Agent 4: QA Specialist - Write test cases
   */
  async writeTests(task, ai) {
    const subAgent = this.subAgents.qa;
    const { feature, testFramework } = task;

    const userPrompt = `Write comprehensive tests for the "${feature}" feature.
Use the "${testFramework}" testing framework.

Include:
1. Unit tests for relevant functions
2. Integration tests for API endpoints (if applicable)
3. Edge cases and error scenarios
4. Test fixtures and mocks
5. Best practices for readable and maintainable tests

Provide complete, runnable test suite.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 400 },
      }
    });
    const response = result.text;

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Test suite generated successfully'
    };
  }

  /**
   * Sub-Agent 5: Documentation Writer - Generate documentation
   */
  async generateDocs(task, ai) {
    const subAgent = this.subAgents.docs;
    const { codeDescription, docType } = task;

    const userPrompt = `Generate comprehensive "${docType}" documentation for the following code/feature description:
"${codeDescription}".

Include:
1. README.md with setup instructions (if project-level)
2. API documentation (if applicable)
3. Code comments (JSDoc/Docstrings)
4. Architecture overview (if applicable)
5. Usage examples
6. Troubleshooting guide (if applicable)

Provide complete, well-formatted documentation.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 1800,
        thinkingConfig: { thinkingBudget: 450 },
      }
    });
    const response = result.text;

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Documentation generated successfully'
    };
  }

  /**
   * Sub-Agent 6: Code Reviewer - Review code quality
   */
  async reviewCode(code, ai) {
    const subAgent = this.subAgents.reviewer;

    const userPrompt = `Review the following code:
\`\`\`
${code}
\`\`\`

Provide a detailed code review with:
1. Code quality assessment
2. Security vulnerabilities
3. Performance issues
4. Best practices violations
5. Suggested improvements
6. Overall rating (1-10)

Be constructive and specific.`;

    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: `${subAgent.systemPrompt}\n\n${userPrompt}` }] }],
      config: {
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 500 },
      }
    });
    const response = result.text;

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response, // Renamed 'review' to 'result' for consistency
      message: 'Code review completed successfully'
    };
  }

  /**
   * Orchestrate all sub-agents for a full project
   * This is a conceptual example for backend orchestration.
   * For the frontend, individual tasks are exposed.
   */
  async generateFullProject(prompt, ai) {
    logger.info('[CodingAgent] Generating full project with all sub-agents...');

    const results = {
      success: true,
      project: prompt,
      subAgentResults: {}
    };

    try {
      // These would ideally be more complex and depend on the output of previous steps
      // For this example, we'll run them based on the initial prompt or generic tasks

      // 1. UI/UX Expert generates frontend
      logger.info('[CodingAgent] Sub-Agent 1: UI/UX Expert working...');
      results.subAgentResults.ui = await this.generateUI({
        projectDescription: prompt,
        component: 'full application UI structure',
        framework: 'React with Tailwind CSS'
      }, ai);

      // 2. API Architect designs backend
      logger.info('[CodingAgent] Sub-Agent 2: API Architect working...');
      results.subAgentResults.api = await this.designAPI({
        serviceDescription: prompt,
        endpoints: '/users, /posts, /comments',
        language: 'Node.js/Express'
      }, ai);

      // 3. DevOps Engineer creates deployment
      logger.info('[CodingAgent] Sub-Agent 3: DevOps Engineer working...');
      results.subAgentResults.deployment = await this.createDeployment({
        serviceDescription: prompt,
        platform: 'Docker/Kubernetes',
        ciCdTool: 'GitHub Actions'
      }, ai);

      // 4. QA Specialist writes tests
      logger.info('[CodingAgent] Sub-Agent 4: QA Specialist working...');
      results.subAgentResults.tests = await this.writeTests({
        feature: `${prompt} main features`,
        testFramework: 'Jest/Cypress'
      }, ai);

      // 5. Documentation Writer generates docs
      logger.info('[CodingAgent] Sub-Agent 5: Documentation Writer working...');
      results.subAgentResults.docs = await this.generateDocs({
        codeDescription: prompt,
        docType: 'developer documentation and user guide'
      }, ai);

      // 6. Code Reviewer reviews everything
      logger.info('[CodingAgent] Sub-Agent 6: Code Reviewer working...');
      const allCode = `
Frontend:
${results.subAgentResults.ui.result}

Backend:
${results.subAgentResults.api.result}

Deployment Configs:
${results.subAgentResults.deployment.result}

Tests:
${results.subAgentResults.tests.result}
`;
      results.subAgentResults.review = await this.reviewCode(allCode, ai);

      results.message = 'Full project generated successfully by all 6 sub-agents';
      results.summary = {
        totalSubAgents: 6,
        completedTasks: Object.keys(results.subAgentResults).length,
        status: 'complete'
      };

      return results;

    } catch (error) {
      logger.error(`[CodingAgent] Full project generation error: ${error.message}`);
      results.success = false;
      results.error = error.message;
      return results;
    }
  }

  /**
   * Get sub-agent information
   */
  getSubAgents() {
    return Object.entries(this.subAgents).map(([id, agent]) => ({
      id,
      name: agent.name,
      icon: agent.icon,
      expertise: agent.expertise
    }));
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      success: true,
      agent: this.name,
      subAgents: this.getSubAgents(),
      status: 'healthy'
    };
  }
}

module.exports = CodingAgent;
