export type ModuleSummary = { id: string; order: number; title: string; icon: string; intro: string };

export type ModuleFull = ModuleSummary & {
  scenario: { channel: string; sender: string; example: string };
  warningSigns: string[];
  safeActions: string[];
  takeaway: string;
};

export type QuizQuestion = {
  id: string;
  moduleId: string;
  prompt: string;
  options: { key: string; text: string }[];
};

export type ResultBand = { min: number; max: number; text: string };

export type Progress = {
  totalModules: number;
  completedModuleIds: string[];
  quizRuns: { quizRunId: string; date: string; correct: number; total: number }[];
  accuracyByModule: { moduleId: string; title: string; correct: number; total: number }[];
};
