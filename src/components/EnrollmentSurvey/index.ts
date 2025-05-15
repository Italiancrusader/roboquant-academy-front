
export { default as SurveyDialog } from './SurveyDialog';
export { default as SurveyForm } from './SurveyForm';
export { default as SurveyFormWrapper } from './SurveyFormWrapper';

// This function checks if a user qualifies for a strategy call based on their survey responses
export const checkQualification = (data: Record<string, any>): boolean => {
  // Debug the data coming in
  console.log("[checkQualification] Checking qualification with data:", data);
  console.log("[checkQualification] Capital value:", data.tradingCapital);
  console.log("[checkQualification] Capital value type:", typeof data.tradingCapital);
  
  // First, explicitly check for high capital values which should always qualify
  // This handles multiple possible formats of high capital values
  const highCapitalValues = ["> $25k", "> $250k", "Haa2tZ1srkPu"];
  if (highCapitalValues.includes(data.tradingCapital)) {
    console.log("[checkQualification] Direct match for high capital value, qualifying");
    return true;
  }
  
  // These are the approved capital values that qualify for a strategy call
  const approvedCapitalValues = ["$5,000 – $10,000", "$10,000 – $250,000", "Over $250,000"];
  
  // Map special values that might come from Typeform
  let mappedCapital = data.tradingCapital;
  
  // Handle different formats of capital values for consistency
  if (data.tradingCapital === "> $25k" || data.tradingCapital === "> $250k" || data.tradingCapital === "Haa2tZ1srkPu") {
    mappedCapital = "Over $250,000";
    console.log("[checkQualification] Mapped high capital value to 'Over $250,000'");
  } else if (data.tradingCapital === "$10k-$25k" || data.tradingCapital === "$10k-$250k") {
    mappedCapital = "$10,000 – $250,000";
    console.log("[checkQualification] Mapped mid capital value to '$10,000 – $250,000'");
  } else if (data.tradingCapital === "$5k-$10k") {
    mappedCapital = "$5,000 – $10,000";
    console.log("[checkQualification] Mapped mid capital value to '$5,000 – $10,000'");
  }
  
  // Check if the trading capital is in the approved list
  const qualifies = approvedCapitalValues.includes(mappedCapital);
  
  console.log("[checkQualification] Final qualification result:", qualifies);
  return qualifies;
};
