/**
 * Backend API Server for Deploy Nexus Dashboard
 * 
 * This server provides endpoints to:
 * 1. Read pipeline definitions from GitHub Actions and Spinnaker directories
 * 2. Trigger pipeline executions
 * 3. Get pipeline execution status
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-org';
const GITHUB_REPO = process.env.GITHUB_REPO || 'scio';

const SPINNAKER_API_URL = process.env.SPINNAKER_API_URL || 'https://spinnaker.example.com';

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

/**
 * List files in a directory
 * GET /api/pipelines/list?path=/path/to/directory
 */
app.get('/api/pipelines/list', async (req, res) => {
  try {
    const dirPath = req.query.path as string;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const files = await fs.readdir(dirPath);
    
    // Filter for YAML and JSON files
    const pipelineFiles = files.filter(file => 
      file.endsWith('.yml') || 
      file.endsWith('.yaml') || 
      file.endsWith('.json')
    );

    res.json(pipelineFiles);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Load a pipeline file
 * GET /api/pipelines/load?path=/path/to/file
 */
app.get('/api/pipelines/load', async (req, res) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error loading file:', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Trigger GitHub Actions workflow
 * POST /api/github/trigger
 */
app.post('/api/github/trigger', async (req, res) => {
  try {
    const { workflow, ref, inputs } = req.body;

    if (!GITHUB_TOKEN || !octokit) {
      return res.status(503).json({ 
        error: 'GitHub token not configured',
        message: 'Please configure GITHUB_TOKEN environment variable to trigger workflows'
      });
    }

    const response = await octokit.actions.createWorkflowDispatch({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: workflow,
      ref,
      inputs,
    });

    res.json({ success: true, response: response.data });
  } catch (error: any) {
    console.error('Error triggering GitHub Actions:', error);
    res.status(500).json({ 
      error: error.message || String(error),
      details: error.response?.data,
    });
  }
});

/**
 * Get GitHub Actions workflow runs
 * GET /api/github/runs?workflow=workflow-name
 */
app.get('/api/github/runs', async (req, res) => {
  try {
    const workflow = req.query.workflow as string;

    if (!GITHUB_TOKEN || !octokit) {
      return res.status(503).json({ 
        error: 'GitHub token not configured',
        message: 'Please configure GITHUB_TOKEN environment variable to fetch workflow runs'
      });
    }

    const response = await octokit.actions.listWorkflowRuns({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: workflow,
      per_page: 20,
    });

    res.json(response.data.workflow_runs);
  } catch (error: any) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

/**
 * Trigger Spinnaker pipeline
 * POST /api/spinnaker/trigger
 */
app.post('/api/spinnaker/trigger', async (req, res) => {
  try {
    const { application, pipelineName, parameters } = req.body;

    const response = await fetch(`${SPINNAKER_API_URL}/pipelines/${application}/${pipelineName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'manual',
        parameters,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    console.error('Error triggering Spinnaker pipeline:', error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

/**
 * Get Spinnaker pipeline executions
 * GET /api/spinnaker/executions?application=app&pipeline=name
 */
app.get('/api/spinnaker/executions', async (req, res) => {
  try {
    const { application, pipeline } = req.query;

    const response = await fetch(
      `${SPINNAKER_API_URL}/applications/${application}/pipelines/${pipeline}/executions`
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const executions = await response.json();
    res.json(executions);
  } catch (error: any) {
    console.error('Error fetching Spinnaker executions:', error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Deploy Nexus Backend API running on port ${PORT}`);
  console.log(`GitHub integration: ${GITHUB_TOKEN ? 'Enabled' : 'Disabled'}`);
  console.log(`Spinnaker API URL: ${SPINNAKER_API_URL}`);
});

