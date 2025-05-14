
export { default as SurveyDialog } from './SurveyDialog';
export { default as SurveyForm } from './SurveyForm';
export { default as SurveyFormWrapper } from './SurveyFormWrapper';

// This function checks if a user qualifies for a strategy call based on their survey responses
export const checkQualification = (data: Record<string, any>): boolean => {
  // Debug the data coming in
  console.log("[checkQualification] Checking qualification with data:", data);
  console.log("[checkQualification] Capital value:", data.tradingCapital);
  console.log("[checkQualification] Capital value type:", typeof data.tradingCapital);
  
  // These are the approved capital values that qualify for a strategy call
  const approvedCapitalValues = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"];
  
  // Map special values that might come from Typeform
  let mappedCapital = data.tradingCapital;
  if (data.tradingCapital === "> $25k" || data.tradingCapital === "> $250k") {
    mappedCapital = "Over $250,000";
    console.log("[checkQualification] Mapped '> $25k' to 'Over $250,000'");
  }
  
  // Check if the trading capital is in the approved list
  const qualifies = approvedCapitalValues.includes(mappedCapital);
  
  console.log("[checkQualification] Final qualification result:", qualifies);
  return qualifies;
};
