import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { CodeIcon, LayoutGrid, Database, Cloud, Beaker, FileText, MonitorCheck } from 'lucide-react'; // Added MonitorCheck for Code Reviewer
import { LanguageContext } from '../../App';
// FIX: Corrected import typo from '!from' to 'from'
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../lib/i18n';
import { TaskHistoryEntry } from '../../types';

interface CodingAgentUIProps {
  onTaskComplete: (entry: TaskHistoryEntry) => void;
}

const CodingAgentUI: React.FC<CodingAgentUIProps> = ({ onTaskComplete }) => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.agents.coding[lang];
  const globalText = translations.global[lang];
  const currentThemeColors = theme.colors;

  // States for UI sub-agent
  const [uiProjectDescription, setUiProjectDescription] = useState('');
  const [uiComponent, setUiComponent] = useState('');
  const [uiFramework, setUiFramework] = useState('');

  // States for API sub-agent
  const [apiServiceDescription, setApiServiceDescription] = useState('');
  const [apiEndpoints, setApiEndpoints] = useState('');
  const [backendLanguage, setBackendLanguage] = useState('');

  // States for Deployment sub-agent
  const [deployServiceDescription, setDeployServiceDescription] = useState('');
  const [deployPlatform, setDeployPlatform] = useState('');
  const [ciCdTool, setCiCdTool] = useState('');

  // States for QA sub-agent
  const [qaFeatureToTest, setQaFeatureToTest] = useState('');
  const [qaTestFramework, setQaTestFramework] = useState('');

  // States for Documentation sub-agent
  const [docCodeDescription, setDocCodeDescription] = useState('');
  const [docType, setDocType] = useState('');

  // State for Code Reviewer
  const [codeToReview, setCodeToReview] = useState('');

  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const executeTask = async (
    taskKey: string, // Corresponds to key in currentText.tasks
    taskInput: Record<string, any>,
  ) => {
    setIsLoading(true);
    setResult('');
    try {
      const response = await fetch(`http://localhost:3000/api/agents/coding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: taskKey, ...taskInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      // Assume backend now returns { result: "..." } from Gemini
      const formattedOutput = data.result || JSON.stringify(data); 

      setResult(formattedOutput);

      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'coding',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: formattedOutput,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (error: any) {
      console.error('Coding Agent task failed:', error);
      setResult(`Error: ${error.message}`);
      onTaskComplete({
        id: Date.now().toString(),
        agentId: 'coding',
        agentName: currentText.name,
        taskType: currentText.tasks[taskKey as keyof typeof currentText.tasks],
        taskInput: taskInput,
        taskOutput: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateUI = () => {
    if (!uiProjectDescription && !uiComponent) return;
    executeTask('generateUI', { projectDescription: uiProjectDescription, component: uiComponent, framework: uiFramework });
  };

  const handleDesignAPI = () => {
    if (!apiServiceDescription && !apiEndpoints) return;
    executeTask('designAPI', { serviceDescription: apiServiceDescription, endpoints: apiEndpoints, language: backendLanguage });
  };

  const handleCreateDeploymentConfig = () => {
    if (!deployServiceDescription && !deployPlatform) return;
    executeTask('createDeploymentConfig', { serviceDescription: deployServiceDescription, platform: deployPlatform, ciCdTool });
  };

  const handleWriteTests = () => {
    if (!qaFeatureToTest) return;
    executeTask('writeTests', { feature: qaFeatureToTest, testFramework: qaTestFramework });
  };

  const handleGenerateDocumentation = () => {
    if (!docCodeDescription && !docType) return;
    executeTask('generateDocumentation', { codeDescription: docCodeDescription, docType: docType });
  };

  const handleReviewCode = () => {
    if (!codeToReview) return;
    executeTask('reviewCode', { code: codeToReview });
  };


  const inputClass = `w-full p-2 rounded-md border text-text bg-background focus:ring-2 focus:ring-primary focus:border-transparent`;
  const buttonClass = `w-full py-2 px-4 rounded-md text-white font-semibold bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 space-y-6 ${currentThemeColors.background}`}
      style={{ fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <h3 className={`text-2xl font-bold flex items-center gap-2 text-text`} style={{ color: currentThemeColors.primary }}>
        <CodeIcon className="w-6 h-6" /> {currentText.name}
      </h3>
      <p className={`text-text-secondary`}>{currentText.description}</p>

      {/* Generate UI Code */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <LayoutGrid className="w-5 h-5" /> {currentText.tasks.generateUI}
        </h4>
        <textarea
          placeholder={currentText.placeholders.projectDescription}
          value={uiProjectDescription}
          onChange={(e) => setUiProjectDescription(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.uiComponent}
          value={uiComponent}
          onChange={(e) => setUiComponent(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.uiFramework}
          value={uiFramework}
          onChange={(e) => setUiFramework(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGenerateUI} disabled={isLoading || (!uiProjectDescription && !uiComponent)} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.generateUI}
        </button>
      </div>

      {/* Design API & Backend */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <Database className="w-5 h-5" /> {currentText.tasks.designAPI}
        </h4>
        <textarea
          placeholder={currentText.placeholders.serviceDescription}
          value={apiServiceDescription}
          onChange={(e) => setApiServiceDescription(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.apiEndpoints}
          value={apiEndpoints}
          onChange={(e) => setApiEndpoints(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.backendLanguage}
          value={backendLanguage}
          onChange={(e) => setBackendLanguage(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleDesignAPI} disabled={isLoading || (!apiServiceDescription && !apiEndpoints)} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.designAPI}
        </button>
      </div>

      {/* Create Deployment Config */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <Cloud className="w-5 h-5" /> {currentText.tasks.createDeploymentConfig}
        </h4>
        <textarea
          placeholder={currentText.placeholders.serviceDescription}
          value={deployServiceDescription}
          onChange={(e) => setDeployServiceDescription(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.platform}
          value={deployPlatform}
          onChange={(e) => setDeployPlatform(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.ciCdTool}
          value={ciCdTool}
          onChange={(e) => setCiCdTool(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleCreateDeploymentConfig} disabled={isLoading || (!deployServiceDescription && !deployPlatform)} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.createDeploymentConfig}
        </button>
      </div>

      {/* Write Test Cases */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <Beaker className="w-5 h-5" /> {currentText.tasks.writeTests}
        </h4>
        <textarea
          placeholder={currentText.placeholders.featureToTest}
          value={qaFeatureToTest}
          onChange={(e) => setQaFeatureToTest(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.testFramework}
          value={qaTestFramework}
          onChange={(e) => setQaTestFramework(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleWriteTests} disabled={isLoading || !qaFeatureToTest} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.writeTests}
        </button>
      </div>

      {/* Generate Documentation */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <FileText className="w-5 h-5" /> {currentText.tasks.generateDocumentation}
        </h4>
        <textarea
          placeholder={currentText.placeholders.codeDescription}
          value={docCodeDescription}
          onChange={(e) => setDocCodeDescription(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={3}
        />
        <input
          type="text"
          placeholder={currentText.placeholders.docType}
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
        />
        <button onClick={handleGenerateDocumentation} disabled={isLoading || (!docCodeDescription && !docType)} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.generateDocumentation}
        </button>
      </div>

      {/* Code Reviewer (NEW) */}
      <div className={`p-4 rounded-lg shadow`} style={{ background: currentThemeColors.surface }}>
        <h4 className={`text-xl font-semibold mb-3 text-text flex items-center gap-2`}>
          <MonitorCheck className="w-5 h-5" /> {currentText.tasks.reviewCode}
        </h4>
        <textarea
          placeholder={currentText.placeholders.codeToReview}
          value={codeToReview}
          onChange={(e) => setCodeToReview(e.target.value)}
          className={`${inputClass} mb-3`}
          style={{ borderColor: currentThemeColors.border }}
          rows={8}
        />
        <button onClick={handleReviewCode} disabled={isLoading || !codeToReview} className={buttonClass}>
          {isLoading ? globalText.loading : currentText.tasks.reviewCode}
        </button>
      </div>


      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mt-4 shadow overflow-x-auto`}
          style={{ background: currentThemeColors.surface, borderColor: currentThemeColors.border, color: currentThemeColors.text }}
        >
          <h4 className="font-semibold mb-2">{globalText.output}:</h4>
          <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CodingAgentUI;