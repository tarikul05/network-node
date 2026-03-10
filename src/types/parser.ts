// Parser types for router configuration parsing

import type { Router } from './network';

export interface ParseResult {
  success: boolean;
  router?: Router;
  errors: ParseError[];
  warnings: ParseWarning[];
  rawConfig: string;
}

export interface ParseError {
  line?: number;
  message: string;
  code: string;
}

export interface ParseWarning {
  line?: number;
  message: string;
  code: string;
}

export interface ParserContext {
  lines: string[];
  currentLine: number;
  currentSection: string | null;
  router: Partial<Router>;
}

export type ConfigFormat = 'yamaha' | 'cisco' | 'unknown';

export interface ConfigDetectionResult {
  format: ConfigFormat;
  confidence: number;
  model?: string;
}

// Regex pattern collections for different parsers
export interface PatternSet {
  model: RegExp;
  macAddress: RegExp;
  hardware: RegExp;
  serial: RegExp;
  reportingDate: RegExp;
  lanAddress: RegExp;
  lanNat: RegExp;
  defaultRoute: RegExp;
  staticRoute: RegExp;
  tunnelSelect: RegExp;
  tunnelName: RegExp;
  tunnelDesc: RegExp;
  ipsecRemote: RegExp;
  ipsecLocal: RegExp;
  tunnelEnable: RegExp;
  dhcpScope: RegExp;
  dnsServer: RegExp;
}
