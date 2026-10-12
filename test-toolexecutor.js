#!/usr/bin/env node

/**
 * Test script to verify ToolExecutor.js can be loaded
 */

try {
  const { ToolExecutor } = require('./electron/services/ToolExecutor.js');
  console.log('✅ ToolExecutor.js loaded successfully');
  
  const executor = new ToolExecutor();
  console.log('✅ ToolExecutor instance created successfully');
  
  // Test a simple tool execution
  executor.execute('utility.system_info', {}).then(result => {
    if (result.success) {
      console.log('✅ Tool execution test passed');
      console.log('System info:', result.data);
    } else {
      console.log('⚠️  Tool execution returned error:', result.error);
    }
    process.exit(0);
  }).catch(error => {
    console.error('❌ Tool execution failed:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to load ToolExecutor.js:', error.message);
  console.error(error.stack);
  process.exit(1);
}
