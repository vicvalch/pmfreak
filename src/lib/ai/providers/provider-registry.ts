import type { DataSensitivity, ProviderTrustTier } from "@/aoc/enterprise/runtime/ai-egress/types";

export interface ProviderMetadata {
  id: string;
  trustTier: ProviderTrustTier;
  supportsEnterpriseIsolation: boolean;
  supportsRegionalResidency?: boolean;
  supportsZeroRetention?: boolean;
  allowedSensitivityLevels: DataSensitivity[];
}

const providerRegistry = new Map<string, ProviderMetadata>([
  ["local", { id: "local", trustTier: "trusted", supportsEnterpriseIsolation: true, allowedSensitivityLevels: ["public", "internal", "confidential", "restricted"] }],
  ["anthropic", { id: "anthropic", trustTier: "trusted", supportsEnterpriseIsolation: true, supportsZeroRetention: true, allowedSensitivityLevels: ["public", "internal", "confidential", "restricted"] }],
  ["openai", { id: "openai", trustTier: "conditional", supportsEnterpriseIsolation: true, supportsZeroRetention: true, allowedSensitivityLevels: ["public", "internal", "confidential"] }],
  ["gemini", { id: "gemini", trustTier: "conditional", supportsEnterpriseIsolation: true, allowedSensitivityLevels: ["public", "internal", "confidential"] }],
  ["mock", { id: "mock", trustTier: "restricted", supportsEnterpriseIsolation: false, allowedSensitivityLevels: ["public", "internal"] }],
]);

export function getProviderMetadata(providerId: string): ProviderMetadata | undefined {
  return providerRegistry.get(providerId);
}
