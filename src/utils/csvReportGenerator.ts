import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { parseCSVContent } from './csvParser';
import { ParsedStrategyReport } from '@/types/strategyreportgenie';

// Define autoTable options interface
interface AutoTableOptions {
  startY?: number;
  head?: any[][];
  body?: any[][];
  foot?: any[][];
  theme?: string;
  styles?: any;
  headStyles?: any;
  bodyStyles?: any;
  footStyles?: any;
  columnStyles?: any;
  didDrawCell?: (data: any) => void;
}

// Augment the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
    getNumberOfPages(): number;
  }
}

// Extract strategy name from filename
export function extractStrategyNameFromFileName(filename: string): string {
  if (!filename) return '';
  
  // Remove file extension
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and dashes with spaces
  const withSpaces = withoutExtension.replace(/[_-]/g, " ");
  
  // Capitalize first letter of each word
  return withSpaces.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Generate a comprehensive trading strategy report from CSV data
 * 
 * @param csvContent The CSV content as a string
 * @param filename The filename for the generated PDF
 * @param reportTitle The title for the report
 * @returns A promise that resolves to true when the PDF is generated
 */
export const generateReportFromCSV = async (
  csvContent: string,
  filename: string = 'quant-trading-report.pdf',
  reportTitle = 'Quantitative Trading Analysis'
): Promise<boolean> => {
  try {
    // Parse the CSV content
    const data = parseCSVContent(csvContent);
    
    // Extract strategy name from filename if available
    if (filename && !reportTitle.includes('Analysis')) {
      const strategyName = extractStrategyNameFromFileName(filename);
      if (strategyName) {
        reportTitle = `${strategyName} - Strategy Analysis`;
        data.summary['Strategy Name'] = strategyName;
      }
    }
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Generate the complete report
    await createQuantReport(pdf, data, reportTitle);
    
    // Save the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
};

/**
 * Create the full quantitative report with all sections
 */
async function createQuantReport(pdf: jsPDF, data: ParsedStrategyReport, reportTitle: string) {
  // Create cover page
  createCoverPage(pdf, reportTitle, data);
  
  // Add disclaimer page
  pdf.addPage();
  createDisclaimerPage(pdf);
  
  // Executive summary
  pdf.addPage();
  createExecutiveSummary(pdf, data);
  
  // Performance analysis
  pdf.addPage();
  createPerformanceAnalysis(pdf, data);
  
  // Trade analytics
  pdf.addPage();
  createTradeAnalytics(pdf, data);
  
  // Risk metrics
  pdf.addPage();
  createRiskMetrics(pdf, data);
  
  // Equity curve chart
  pdf.addPage();
  await createEquityCurve(pdf, data);
  
  // Distribution analysis
  pdf.addPage();
  createDistributionAnalysis(pdf, data);
  
  // Trade list
  pdf.addPage();
  createTradeList(pdf, data);
  
  // Add page numbers
  addPageNumbers(pdf);
}

/**
 * Create the cover page of the report
 */
function createCoverPage(pdf: jsPDF, reportTitle: string, data: ParsedStrategyReport) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add blue gradient background for header
  pdf.setFillColor(41, 65, 148);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Add gray background for body
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 60, pageWidth, pageHeight - 60, 'F');
  
  // Add title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  const titleWidth = pdf.getStringUnitWidth(reportTitle) * 24 / pdf.internal.scaleFactor;
  pdf.text(reportTitle, (pageWidth - titleWidth) / 2, 30);
  
  // Add subtitle
  pdf.setFontSize(16);
  const subtitle = 'Quantitative Performance Report';
  const subtitleWidth = pdf.getStringUnitWidth(subtitle) * 16 / pdf.internal.scaleFactor;
  pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 45);
  
  // Add company logo (placeholder text)
  pdf.setFontSize(20);
  pdf.setTextColor(41, 65, 148);
  const logoText = 'RoboQuant.ai';
  const logoWidth = pdf.getStringUnitWidth(logoText) * 20 / pdf.internal.scaleFactor;
  pdf.text(logoText, (pageWidth - logoWidth) / 2, 80);
  
  // Add report date
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dateWidth = pdf.getStringUnitWidth(dateStr) * 12 / pdf.internal.scaleFactor;
  pdf.text(dateStr, (pageWidth - dateWidth) / 2, 95);
  
  // Add report image (placeholder gray rectangle)
  pdf.setFillColor(220, 220, 220);
  const imageWidth = 120;
  const imageHeight = 90;
  pdf.rect((pageWidth - imageWidth) / 2, 115, imageWidth, imageHeight, 'F');
  
  // Add key metrics
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('helvetica', 'bold');
  
  const y = 230;
  const metrics = [
    { title: 'Net Profit', value: data.summary['Total Net Profit'], color: '#28a745' },
    { title: 'Win Rate', value: data.summary['Profit Trades'].split(' ')[1], color: '#007bff' },
    { title: 'Profit Factor', value: data.summary['Profit Factor'], color: '#fd7e14' },
    { title: 'Max Drawdown', value: data.summary['Maximal Drawdown'].split(' ')[1], color: '#dc3545' }
  ];
  
  const boxWidth = 40;
  const boxHeight = 40;
  const spacing = 10;
  const startX = (pageWidth - (metrics.length * boxWidth + (metrics.length - 1) * spacing)) / 2;
  
  metrics.forEach((metric, index) => {
    const x = startX + index * (boxWidth + spacing);
    drawKpiBox(pdf, x, y, boxWidth, boxHeight, metric.title, metric.value, metric.color);
  });
}

/**
 * Helper function to draw KPI boxes on the cover page
 */
function drawKpiBox(pdf: jsPDF, x: number, y: number, width: number, height: number, title: string, value: string, color: string) {
  // Parse the color hex string to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Draw box with rounded corners
  pdf.setFillColor(250, 250, 250);
  pdf.roundedRect(x, y, width, height, 3, 3, 'F');
  
  // Add border
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, width, height, 3, 3, 'S');
  
  // Add title
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  const titleWidth = pdf.getStringUnitWidth(title) * 8 / pdf.internal.scaleFactor;
  pdf.text(title, x + (width - titleWidth) / 2, y + 10);
  
  // Add value
  pdf.setFontSize(12);
  pdf.setTextColor(r, g, b);
  pdf.setFont('helvetica', 'bold');
  const valueWidth = pdf.getStringUnitWidth(value) * 12 / pdf.internal.scaleFactor;
  pdf.text(value, x + (width - valueWidth) / 2, y + 25);
}

/**
 * Create the disclaimer page
 */
function createDisclaimerPage(pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  const title = 'Important Disclaimer';
  const titleWidth = pdf.getStringUnitWidth(title) * 18 / pdf.internal.scaleFactor;
  pdf.text(title, (pageWidth - titleWidth) / 2, 30);
  
  // Add disclaimer text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  const disclaimerText = [
    'This report is for informational purposes only and does not constitute investment advice.',
    '',
    'PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS.',
    '',
    'Trading futures, options, and forex involves substantial risk of loss and is not suitable for all investors. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.',
    '',
    'The analysis provided in this report is based on historical data and should not be used as the sole basis for making investment decisions. The metrics and statistics shown in this report are calculated based on historical trade data and market conditions which may not reflect current or future market conditions.',
    '',
    'No representation is being made that any account will or is likely to achieve profits or losses similar to those shown in this report. The risk of loss in trading can be substantial. You should therefore carefully consider whether such trading is suitable for you in light of your financial condition.',
    '',
    'By using this report, you acknowledge that you are aware of the risks involved and that you alone are responsible for your trading decisions.'
  ];
  
  let y = 50;
  const lineHeight = 6;
  
  disclaimerText.forEach(line => {
    if (line === '') {
      y += lineHeight / 2;
      return;
    }
    
    // Word wrapping for long lines
    const words = line.split(' ');
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = pdf.getStringUnitWidth(testLine) * 10 / pdf.internal.scaleFactor;
      
      if (testWidth > pageWidth - 40) {
        pdf.text(currentLine, 20, y);
        y += lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    pdf.text(currentLine, 20, y);
    y += lineHeight;
  });
}

/**
 * Create the executive summary section
 */
function createExecutiveSummary(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Executive Summary', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // Add summary table
  pdf.autoTable({
    startY: 30,
    head: [['Metric', 'Value']],
    body: Object.entries(data.summary).map(([key, value]) => [key, value]),
    theme: 'grid',
    headStyles: { fillColor: [41, 65, 148], textColor: [255, 255, 255] },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
}

/**
 * Create the performance analysis section
 */
function createPerformanceAnalysis(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Performance Analysis', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // This section will be expanded with charts and analysis in the other functions
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Key Performance Indicators:', 14, 35);
  
  // Create a table with key performance metrics
  const performanceMetrics = [
    ['Total Net Profit', data.summary['Total Net Profit']],
    ['Profit Factor', data.summary['Profit Factor']],
    ['Expected Payoff', data.summary['Expected Payoff']],
    ['Win Rate', data.summary['Profit Trades'].split(' ')[1]],
    ['Maximal Drawdown', data.summary['Maximal Drawdown']]
  ];
  
  pdf.autoTable({
    startY: 40,
    body: performanceMetrics,
    theme: 'striped',
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
}

/**
 * Create the trade analytics section
 */
function createTradeAnalytics(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Trade Analytics', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // Calculate trade analytics
  const totalTrades = parseInt(data.summary['Total Trades']) || 0;
  const shortPositions = parseInt(data.summary['Short Positions']) || 0;
  const longPositions = parseInt(data.summary['Long Positions']) || 0;
  const winRate = parseFloat(data.summary['Profit Trades'].split('(')[1]?.split('%')[0]) || 0;
  const lossRate = 100 - winRate;
  
  // Create trade direction analysis
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Trade Direction Analysis', 14, 35);
  
  // Create table with trade direction data
  const directionData = [
    ['Long Positions', longPositions.toString(), ((longPositions / totalTrades) * 100).toFixed(2) + '%'],
    ['Short Positions', shortPositions.toString(), ((shortPositions / totalTrades) * 100).toFixed(2) + '%'],
    ['Total Trades', totalTrades.toString(), '100%']
  ];
  
  pdf.autoTable({
    startY: 40,
    head: [['Direction', 'Count', 'Percentage']],
    body: directionData,
    theme: 'striped',
    headStyles: { fillColor: [41, 65, 148] },
    styles: { cellPadding: 5 }
  });
  
  // Create win/loss analysis
  pdf.text('Win/Loss Analysis', 14, pdf.lastAutoTable.finalY + 15);
  
  const winLossData = [
    ['Winning Trades', data.summary['Profit Trades'].split(' ')[0], winRate.toFixed(2) + '%'],
    ['Losing Trades', data.summary['Loss Trades'], lossRate.toFixed(2) + '%'],
    ['Largest Win', data.summary['Largest Profit Trade'], ''],
    ['Largest Loss', data.summary['Largest Loss Trade'], ''],
    ['Average Win', data.summary['Average Profit Trade'], ''],
    ['Average Loss', data.summary['Average Loss Trade'], '']
  ];
  
  pdf.autoTable({
    startY: pdf.lastAutoTable.finalY + 20,
    head: [['Result', 'Count/Value', 'Percentage']],
    body: winLossData,
    theme: 'striped',
    headStyles: { fillColor: [41, 65, 148] },
    styles: { cellPadding: 5 }
  });
  
  // Consecutive win/loss analysis
  pdf.text('Consecutive Trades Analysis', 14, pdf.lastAutoTable.finalY + 15);
  
  const consecutiveData = [
    ['Maximum Consecutive Wins', data.summary['Maximum Consecutive Wins']],
    ['Maximum Consecutive Losses', data.summary['Maximum Consecutive Losses']]
  ];
  
  pdf.autoTable({
    startY: pdf.lastAutoTable.finalY + 20,
    body: consecutiveData,
    theme: 'striped',
    styles: { cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
}

/**
 * Create risk metrics section
 */
function createRiskMetrics(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Risk Analysis', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // Extract risk metrics
  const maxDrawdown = data.summary['Maximal Drawdown'];
  const profitFactor = data.summary['Profit Factor'];
  const expectedPayoff = data.summary['Expected Payoff'];
  
  // Add explanation text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Key Risk Metrics:', 14, 35);
  
  // Create risk metrics table
  const riskMetricsData = [
    ['Maximum Drawdown', maxDrawdown, 'Maximum peak-to-trough decline experienced'],
    ['Profit Factor', profitFactor, 'Ratio of gross profits to gross losses'],
    ['Expected Payoff', expectedPayoff, 'Average profit/loss per trade'],
    ['Win/Loss Ratio', (parseFloat(data.summary['Average Profit Trade'].replace('$', '')) / 
                       parseFloat(data.summary['Average Loss Trade'].replace('$', '').replace('-', ''))).toFixed(2),
     'Ratio of average win to average loss']
  ];
  
  pdf.autoTable({
    startY: 40,
    head: [['Metric', 'Value', 'Description']],
    body: riskMetricsData,
    theme: 'striped',
    headStyles: { fillColor: [41, 65, 148] },
    styles: { cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
  
  // Risk management assessment
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Risk Management Assessment', 14, pdf.lastAutoTable.finalY + 15);
  
  // Add risk assessment text
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const drawdownPct = parseFloat(maxDrawdown.split('(')[1]?.split('%')[0]) || 0;
  const pfValue = parseFloat(profitFactor) || 0;
  
  let riskAssessment = '';
  let riskColor = [0, 0, 0];
  
  if (drawdownPct > 30 || pfValue < 1.0) {
    riskAssessment = 'High Risk: This strategy shows significant drawdowns or unprofitable performance.';
    riskColor = [220, 53, 69]; // Red
  } else if (drawdownPct > 15 || pfValue < 1.5) {
    riskAssessment = 'Moderate Risk: This strategy has reasonable drawdowns and profit potential.';
    riskColor = [255, 193, 7]; // Yellow
  } else {
    riskAssessment = 'Low Risk: This strategy demonstrates good risk control with limited drawdowns.';
    riskColor = [40, 167, 69]; // Green
  }
  
  pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  pdf.text(riskAssessment, 14, pdf.lastAutoTable.finalY + 25);
  
  // Additional risk metrics explanation
  pdf.setTextColor(60, 60, 60);
  pdf.text('Risk-Adjusted Return Considerations:', 14, pdf.lastAutoTable.finalY + 40);
  
  const riskExplanation = [
    `• The strategy's profit factor of ${profitFactor} indicates that for every $1 of loss, the strategy generates $${profitFactor} in profits.`,
    `• Maximum drawdown of ${maxDrawdown} represents the largest potential equity decline during the testing period.`,
    `• The average trade expectancy is ${expectedPayoff}, meaning each trade contributes this amount on average to the overall performance.`
  ];
  
  let y = pdf.lastAutoTable.finalY + 50;
  riskExplanation.forEach(line => {
    pdf.text(line, 14, y);
    y += 7;
  });
}

/**
 * Create the equity curve chart section
 */
async function createEquityCurve(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Equity Curve', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);

  // Create a data-driven equity curve directly without relying on DOM elements
  try {
    // Extract balances from trades
    const trades = data.trades;
    if (!trades || trades.length === 0) {
      renderPlaceholderEquityCurve(pdf);
      return;
    }

    // Generate balance points from the trades
    const equityPoints: Array<{date: Date, balance: number}> = [];
    let lastBalance = 0;
    
    // Extract starting balance if available
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].balance !== undefined) {
        lastBalance = Number(trades[i].balance);
        equityPoints.push({
          date: new Date(trades[i].openTime),
          balance: lastBalance
        });
        break;
      }
    }

    // If no balance found, use default value
    if (equityPoints.length === 0 && trades.length > 0) {
      lastBalance = 10000; // Default starting balance
      equityPoints.push({
        date: new Date(trades[0].openTime),
        balance: lastBalance
      });
    }

    // Process trades to build equity curve
    for (let i = 0; i < trades.length; i++) {
      if (trades[i].profit) {
        lastBalance += Number(trades[i].profit);
        equityPoints.push({
          date: new Date(trades[i].timeFlag || trades[i].openTime),
          balance: lastBalance
        });
      } else if (trades[i].balance !== undefined) {
        lastBalance = Number(trades[i].balance);
        equityPoints.push({
          date: new Date(trades[i].openTime),
          balance: lastBalance
        });
      }
    }

    // Draw equity curve directly onto the PDF
    if (equityPoints.length >= 2) {
      renderEquityCurve(pdf, equityPoints);
    } else {
      renderPlaceholderEquityCurve(pdf);
    }
  } catch (error) {
    console.error('Error generating equity curve:', error);
    renderPlaceholderEquityCurve(pdf);
  }
}

/**
 * Render an equity curve on the PDF using the provided data points
 */
function renderEquityCurve(pdf: jsPDF, points: Array<{date: Date, balance: number}>) {
  const margin = 20;
  const chartWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
  const chartHeight = 120;
  const chartY = 40;
  
  // Find min/max values for scaling
  const balances = points.map(p => p.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const balanceRange = maxBalance - minBalance;
  
  // Find date range
  const dates = points.map(p => p.date.getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate;
  
  // Draw axes
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  
  // X-axis (bottom)
  pdf.line(margin, chartY + chartHeight, margin + chartWidth, chartY + chartHeight);
  
  // Y-axis (left)
  pdf.line(margin, chartY, margin, chartY + chartHeight);
  
  // Plot the curve
  pdf.setDrawColor(41, 65, 148);
  pdf.setLineWidth(1);
  
  // Scale and draw the points
  for (let i = 0; i < points.length - 1; i++) {
    // Convert values to coordinates
    const x1 = margin + ((points[i].date.getTime() - minDate) / dateRange) * chartWidth;
    const y1 = chartY + chartHeight - ((points[i].balance - minBalance) / balanceRange) * chartHeight;
    
    const x2 = margin + ((points[i+1].date.getTime() - minDate) / dateRange) * chartWidth;
    const y2 = chartY + chartHeight - ((points[i+1].balance - minBalance) / balanceRange) * chartHeight;
    
    // Draw the connecting line
    pdf.line(x1, y1, x2, y2);
    
    // Add a point marker every few points
    if (i % Math.max(1, Math.floor(points.length / 15)) === 0) {
      pdf.setFillColor(41, 65, 148);
      pdf.circle(x1, y1, 1, 'F');
    }
  }
  
  // Add last point marker
  pdf.setFillColor(41, 65, 148);
  const lastX = margin + ((points[points.length-1].date.getTime() - minDate) / dateRange) * chartWidth;
  const lastY = chartY + chartHeight - ((points[points.length-1].balance - minBalance) / balanceRange) * chartHeight;
  pdf.circle(lastX, lastY, 1, 'F');
  
  // Add axis labels
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  
  // X-axis labels (dates)
  const xLabelCount = 5;
  for (let i = 0; i <= xLabelCount; i++) {
    const x = margin + (i / xLabelCount) * chartWidth;
    const time = minDate + (i / xLabelCount) * dateRange;
    const date = new Date(time);
    const label = date.toLocaleDateString();
    pdf.text(label, x, chartY + chartHeight + 10, { align: 'center' });
  }
  
  // Y-axis labels (balance)
  const yLabelCount = 5;
  for (let i = 0; i <= yLabelCount; i++) {
    const y = chartY + chartHeight - (i / yLabelCount) * chartHeight;
    const balance = minBalance + (i / yLabelCount) * balanceRange;
    const label = balance.toLocaleString('en-US', { maximumFractionDigits: 0 });
    pdf.text('$' + label, margin - 5, y, { align: 'right' });
  }
  
  // Add chart title
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Equity Growth Over Time', margin + chartWidth / 2, chartY - 5, { align: 'center' });
  
  // Add explanatory text below chart
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  const finalBalance = points[points.length - 1].balance;
  const initialBalance = points[0].balance;
  const percentChange = ((finalBalance - initialBalance) / initialBalance * 100).toFixed(2);
  
  pdf.text(`Initial Balance: $${initialBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, margin, chartY + chartHeight + 25);
  pdf.text(`Final Balance: $${finalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, margin, chartY + chartHeight + 32);
  pdf.text(`Total Return: ${percentChange}%`, margin, chartY + chartHeight + 39);
}

/**
 * Render a placeholder equity curve when data is insufficient
 */
function renderPlaceholderEquityCurve(pdf: jsPDF) {
  // Simplify by showing a placeholder for the chart
  pdf.setFillColor(240, 240, 240);
  pdf.rect(14, 35, pdf.internal.pageSize.getWidth() - 28, 80, 'F');
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Equity Curve Chart', pdf.internal.pageSize.getWidth() / 2 - 20, 75);
  
  // Add equity curve explanation
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  pdf.text('The equity curve chart visualizes the growth of account balance over time,', 14, 130);
  pdf.text('showing the cumulative effect of trading performance.', 14, 136);
  pdf.text('Insufficient data is available to generate this chart.', 14, 145);
  pdf.text('When more trades are recorded, this section will show:', 14, 155);
  pdf.text('- Account balance progression over time', 24, 165);
  pdf.text('- Equity drawdowns and recovery periods', 24, 171);
  pdf.text('- Visual trend of strategy performance', 24, 177);
}

/**
 * Create distribution analysis
 */
function createDistributionAnalysis(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Trade Distribution Analysis', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // Placeholder for distribution chart
  pdf.setFillColor(240, 240, 240);
  pdf.rect(14, 35, pdf.internal.pageSize.getWidth() - 28, 80, 'F');
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Profit Distribution Chart', pdf.internal.pageSize.getWidth() / 2 - 25, 75);
  
  // Add distribution analysis explanation
  pdf.setTextColor(60, 60, 60);
  pdf.text('Profit Distribution Analysis:', 14, 130);
  
  const profitStats = analyzeTradeDistribution(data.trades);
  
  const distributionExplanation = [
    `• Average Trade: ${profitStats.average.toFixed(2)}`,
    `• Standard Deviation: ${profitStats.stdDev.toFixed(2)}`,
    `• Positive Skew: ${profitStats.skew > 0 ? 'Yes' : 'No'} (${profitStats.skew.toFixed(2)})`,
    `• This distribution analysis helps identify the consistency of returns.`,
    `• A narrow distribution with positive skew indicates a strategy with controlled risk.`,
    `• High standard deviation indicates more volatile returns, which may require risk adjustment.`
  ];
  
  let y = 140;
  distributionExplanation.forEach(line => {
    pdf.text(line, 14, y);
    y += 7;
  });
}

/**
 * Helper function to analyze trade profit distribution
 */
function analyzeTradeDistribution(trades: any[]) {
  const profits = trades
    .filter(t => t.state === 'out' && t.profit !== undefined)
    .map(t => t.profit);
  
  if (profits.length === 0) {
    return { average: 0, stdDev: 0, skew: 0 };
  }
  
  // Calculate average
  const sum = profits.reduce((acc, p) => acc + p, 0);
  const average = sum / profits.length;
  
  // Calculate standard deviation
  const squaredDiffs = profits.map(p => Math.pow(p - average, 2));
  const variance = squaredDiffs.reduce((acc, sq) => acc + sq, 0) / profits.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate skewness (simplified)
  const cubedDiffs = profits.map(p => Math.pow(p - average, 3));
  const sumCubedDiffs = cubedDiffs.reduce((acc, cb) => acc + cb, 0);
  const skew = sumCubedDiffs / (profits.length * Math.pow(stdDev, 3));
  
  return { average, stdDev, skew };
}

/**
 * Create trade list table
 */
function createTradeList(pdf: jsPDF, data: ParsedStrategyReport) {
  // Add section title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(41, 65, 148);
  pdf.text('Trade List', 14, 20);
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(14, 24, pdf.internal.pageSize.getWidth() - 14, 24);
  
  // Filter completed trades only
  const completedTrades = data.trades.filter(t => t.state === 'out');
  
  // If we have too many trades, we'll just show the first 50
  const tradesToShow = completedTrades.slice(0, 50);
  
  // Create table with trade data
  const tradeRows = tradesToShow.map(trade => [
    trade.dealId,
    new Date(trade.openTime).toLocaleDateString(),
    trade.symbol,
    trade.side === 'long' ? 'Buy' : 'Sell',
    trade.volumeLots.toString(),
    trade.priceOpen.toFixed(2),
    trade.profit ? trade.profit.toFixed(2) : 'N/A',
    trade.comment
  ]);
  
  pdf.autoTable({
    startY: 30,
    head: [['ID', 'Date', 'Symbol', 'Direction', 'Volume', 'Price', 'Profit', 'Comment']],
    body: tradeRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 65, 148] },
    styles: { overflow: 'linebreak', cellPadding: 3, fontSize: 8 },
    columnStyles: {
      6: { 
        textColor: () => [0, 0, 0],
        fontStyle: 'bold'
      }
    },
    didDrawCell: (data) => {
      // Color profit cells based on value
      if (data.column.index === 6 && data.cell.section === 'body') {
        const profit = parseFloat(data.cell.text[0].replace('$', ''));
        if (!isNaN(profit)) {
          const color = profit >= 0 ? [40, 167, 69] : [220, 53, 69];
          pdf.setFillColor(color[0], color[1], color[2], 0.1);
          pdf.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
      }
    }
  });
  
  // Add note if we limited the trades shown
  if (completedTrades.length > 50) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Note: Showing 50 of ${completedTrades.length} trades. Download the full CSV for complete data.`, 14, pdf.lastAutoTable.finalY + 10);
  }
}

/**
 * Add page numbers to the PDF
 */
function addPageNumbers(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
  }
}

/**
 * Create a simple PDF with just the basic information
 * Used as a fallback if the complex report generation fails
 */
function createSimplePdf(pdf: jsPDF, data: ParsedStrategyReport) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Trading Strategy Report', 14, 20);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(`Report generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  pdf.autoTable({
    startY: 40,
    head: [['Metric', 'Value']],
    body: Object.entries(data.summary).map(([key, value]) => [key, value]),
    theme: 'striped',
    styles: { overflow: 'linebreak' }
  });
  
  const tradesStartY = pdf.lastAutoTable.finalY + 10;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Trade List', 14, tradesStartY);
  
  const tradeRows = data.trades.map(trade => [
    trade.dealId,
    trade.symbol,
    trade.side,
    trade.volumeLots,
    trade.priceOpen,
    trade.profit
  ]);
  
  pdf.autoTable({
    startY: tradesStartY + 5,
    head: [['Deal', 'Symbol', 'Direction', 'Volume', 'Price', 'Profit']],
    body: tradeRows,
    theme: 'striped',
    styles: { overflow: 'linebreak' }
  });
} 