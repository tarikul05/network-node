// Parser factory and exports

import type { ParseResult, ConfigFormat, ConfigDetectionResult } from '@/types';
import { parseYamahaConfig } from './yamaha';
import { isYamahaConfig, detectYamahaModel } from './yamaha/patterns';

/**
 * Detect the configuration format
 */
export function detectConfigFormat(content: string): ConfigDetectionResult {
  // Check for Yamaha
  if (isYamahaConfig(content)) {
    const model = detectYamahaModel(content);
    return {
      format: 'yamaha',
      confidence: model ? 0.95 : 0.7,
      model: model || undefined
    };
  }
  
  // Check for Cisco (basic detection)
  if (content.includes('hostname') && content.includes('interface') && 
      (content.includes('ip address') || content.includes('switchport'))) {
    return {
      format: 'cisco',
      confidence: 0.6
    };
  }
  
  return {
    format: 'unknown',
    confidence: 0
  };
}

/**
 * Parse router configuration
 */
export function parseConfig(content: string): ParseResult {
  const detection = detectConfigFormat(content);
  
  switch (detection.format) {
    case 'yamaha':
      return parseYamahaConfig(content);
      
    case 'cisco':
      // Cisco parser not yet implemented
      return {
        success: false,
        errors: [{
          message: 'Cisco parser not yet implemented',
          code: 'PARSER_NOT_IMPLEMENTED'
        }],
        warnings: [],
        rawConfig: content
      };
      
    default:
      return {
        success: false,
        errors: [{
          message: 'Unknown configuration format',
          code: 'UNKNOWN_FORMAT'
        }],
        warnings: [],
        rawConfig: content
      };
  }
}

export { parseYamahaConfig } from './yamaha';
export { isYamahaConfig, detectYamahaModel } from './yamaha/patterns';
