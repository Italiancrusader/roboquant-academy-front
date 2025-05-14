
export { default as SurveyForm } from './SurveyForm';
export { default as SurveyDialog } from './SurveyDialog';
export { default as SurveyFormWrapper } from './SurveyFormWrapper';
export const checkQualification = (data: Record<string, any>): boolean => {
  // Only check for minimum capital requirement of $5,000
  const hasMinimumCapital = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"].includes(data.tradingCapital);
  return hasMinimumCapital;
};
