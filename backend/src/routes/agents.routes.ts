/**
 * PULSE Integration Routes
 * API endpoints for agent management and coordination
 */

import { Router } from 'express';
import pulseService from '../services/pulse.service';

const router = Router();

/**
 * GET /api/agents/status
 * Get status of all agents
 */
router.get('/status', async (req, res) => {
  try {
    const statuses = await pulseService.getAllAgentStatuses();
    res.json({
      success: true,
      data: statuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/:id/status
 * Get status of a specific agent
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await pulseService.getAgentStatus(id);
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/:id/command
 * Execute a command on an agent
 */
router.post('/:id/command', async (req, res) => {
  try {
    const { id } = req.params;
    const { command, payload } = req.body;
    
    const result = await pulseService.executeAgentCommand({
      agentId: id,
      command,
      payload,
    });
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/coordination/status-board
 * Get the coordination status board
 */
router.get('/coordination/status-board', (req, res) => {
  try {
    const board = pulseService.getStatusBoard();
    res.json({
      success: true,
      data: board,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/coordination/status-board
 * Update the coordination status board
 */
router.post('/coordination/status-board', (req, res) => {
  try {
    const updates = req.body;
    pulseService.updateStatusBoard(updates);
    res.json({
      success: true,
      message: 'Status board updated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/coordination/communication
 * Log a communication event between agents
 */
router.post('/coordination/communication', (req, res) => {
  try {
    const { from, to, type, message, taskId } = req.body;
    
    // Read existing communication log
    const communicationLog = pulseService.getStatusBoard();
    
    // Add new event
    const event = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      from,
      to,
      type,
      message,
      taskId,
    };
    
    if (!communicationLog.events) {
      communicationLog.events = [];
    }
    communicationLog.events.unshift(event);
    
    // Keep only last 100 events
    communicationLog.events = communicationLog.events.slice(0, 100);
    
    pulseService.updateStatusBoard(communicationLog);
    
    res.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
