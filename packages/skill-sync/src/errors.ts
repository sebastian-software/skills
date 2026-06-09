export class SkillSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillSyncError";
  }
}
