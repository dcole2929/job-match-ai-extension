/*global chrome */
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from "@langchain/anthropic";
import { OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

// Initialize vector store
let vectorStore;
let embeddings;
let models = {};

// Initialize AI services with stored API keys
async function initializeAIServices() {
  try {
    const keys = await chrome.storage.local.get(['openaiKey', 'anthropicKey']);

    if (!keys.openaiKey) {
      throw new Error('OpenAI API key not found. Please set it in the extension options.');
    }

    embeddings = new OpenAIEmbeddings({
      openAIApiKey: keys.openaiKey,
    });

    models = {
      gpt4: new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: 0,
        openAIApiKey: keys.openaiKey,
      }),
    };

    if (keys.anthropicKey) {
      models.claude = new ChatAnthropic({
        modelName: 'claude-3-opus-20240229',
        temperature: 0,
        anthropicApiKey: keys.anthropicKey,
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing AI services:', error);
    throw error;
  }
}

// Analysis prompt template
const analysisPrompt = PromptTemplate.fromTemplate(`
    Analyze the following job description and resume to provide detailed matching feedback:

    Job Description:
    {jobDescription}

    Resume:
    {resume}

    You must respond with a valid JSON object that matches this exact structure. Each field is required:
    - matchScore: A number from 0 to 100 indicating the overall match percentage
    - matchingSkills: An array of strings listing skills found in both the resume and job description
    - missingSkills: An array of strings listing required skills from the job that are not found in the resume
    - recommendations: An array of strings with specific suggestions for acquiring the missing skills

    Example response:
    {{
      "matchScore": 75,
      "matchingSkills": ["Python", "React", "TypeScript"],
      "missingSkills": ["AWS", "Docker"],
      "recommendations": [
        "Learn AWS through AWS Free Tier and online courses",
        "Practice Docker by containerizing personal projects"
      ]
    }}

    Important: Return only the JSON object, no other text. Ensure it can be parsed by JSON.parse().
`);

// Initialize the chain
const createAnalysisChain = (model) => {
  return RunnableSequence.from([
    analysisPrompt,
    model,
    new StringOutputParser(),
  ]);
};

export async function initializeVectorStore(resume) {
  try {
    await initializeAIServices();

    // Create vector store from resume
    const texts = resume.split('\n').filter(line => line.trim());
    vectorStore = await MemoryVectorStore.fromTexts(texts, {}, embeddings);
    return true;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

export async function analyzeJobMatch(jobDescription, modelName = 'gpt4') {
  try {
    if (!vectorStore) {
      throw new Error('Vector store not initialized. Please upload your resume first.');
    }

    if (!models[modelName]) {
      throw new Error(`Model ${modelName} not available. Please check your API keys in the extension options.`);
    }

    // Clean and format job description
    const cleanedJobDescription = jobDescription.trim().replace(/\s+/g, ' ');

    if (!cleanedJobDescription) {
      throw new Error('Job description is empty or invalid.');
    }

    // Perform similarity search using vector store
    const similarityResults = await vectorStore.similaritySearch(cleanedJobDescription, 5);

    if (!similarityResults || similarityResults.length === 0) {
      throw new Error('No relevant resume sections found for this job description.');
    }

    // Combine relevant resume sections
    const relevantResume = similarityResults.map(doc => doc.pageContent).join('\n');

    // Run analysis chain
    const chain = createAnalysisChain(models[modelName]);
    const result = await chain.invoke({
      jobDescription: cleanedJobDescription,
      resume: relevantResume,
    });

    try {
      // Parse and validate results
      const parsedResult = JSON.parse(result);
      if (!parsedResult.matchScore || !Array.isArray(parsedResult.matchingSkills) || !Array.isArray(parsedResult.missingSkills)) {
        throw new Error('Invalid analysis result format');
      }
      return parsedResult;
    } catch (parseError) {
      throw new Error('Failed to parse analysis results: ' + parseError.message);
    }
  } catch (error) {
    console.error('Error analyzing job match:', error);
    throw error;
  }
}

export async function getSuggestionForSkill(skill, modelName = 'gpt4') {
  try {
    if (!models[modelName]) {
      throw new Error(`Model ${modelName} not available. Please check your API keys in the extension options.`);
    }

    const suggestionPrompt = PromptTemplate.fromTemplate(`
      Provide specific, actionable suggestions for acquiring or improving the following skill:
      {skill}

      Return a JSON object with these fields:
      shortTerm - Array of immediate actions to take
      longTerm - Array of long-term development steps
      resources - Array of specific learning resources

      Format your response exactly like this:


      {{
        "shortTerm": ["Take an online course", "Build a small project"],
        "longTerm": ["Get certified", "Contribute to open source"],
        "resources": ["Specific course URL", "Recommended book title"]
      }}

      Important: Return only the JSON object, no other text.
    `);

    const chain = RunnableSequence.from([
      suggestionPrompt,
      models[modelName],
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ skill });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error getting skill suggestions:', error);
    throw error;
  }
}
