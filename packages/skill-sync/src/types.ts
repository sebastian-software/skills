export type SourceKind = "internal" | "external";

export type TargetName = "codex" | "agents" | "all";

export interface InternalSource {
  id: string;
  repo: string;
  ref: string;
  path?: string;
}

export interface ExternalSource {
  id: string;
  type: "git";
  repo: string;
  ref: string;
  path?: string;
  include?: string[];
  vendor?: boolean;
  license?: string;
  reviewer?: string;
}

export interface SourcesManifest {
  internal: InternalSource[];
  external: ExternalSource[];
}

export interface LockEntry {
  id: string;
  kind: SourceKind;
  sourceUrl: string;
  requestedRef: string;
  resolvedRef: string;
  included: string[];
  integrity: string;
  updatedAt: string;
  toolVersion: string;
}

export interface SkillsLock {
  version: 1;
  generatedBy: "skill-sync";
  sources: LockEntry[];
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  metadata: Record<string, string>;
}

export interface SkillDefinition {
  id: string;
  installName: string;
  kind: SourceKind;
  root: string;
  frontmatter: SkillFrontmatter;
}

export interface CommandResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface RepoPaths {
  repoRoot: string;
  manifestsDir: string;
  sourcesManifestPath: string;
  lockfilePath: string;
  skillsDir: string;
  internalSkillsDir: string;
  vendorSkillsDir: string;
  distSkillsDir: string;
}
