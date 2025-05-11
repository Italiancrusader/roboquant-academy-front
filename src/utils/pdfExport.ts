import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
  }
}

/**
 * Creates a professional quantitative strategy report PDF
 * @param elementId ID of the HTML element containing the data
 * @param filename Name of the output PDF file
 * @param strategyData Object containing strategy metrics and data
 */
export const exportToPdf = async (elementId: string, filename: string = 'strategy-report.pdf', reportTitle = 'Trading Strategy Analysis') => {
  try {
    // Get the element to be exported (for data extraction)
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Display a loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '0';
    loadingDiv.style.left = '0';
    loadingDiv.style.width = '100%';
    loadingDiv.style.height = '100%';
    loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingDiv.style.display = 'flex';
    loadingDiv.style.justifyContent = 'center';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.zIndex = '9999';
    loadingDiv.innerHTML = '<div style="background: white; padding: 20px; border-radius: 5px;">Generating Professional Report, please wait...</div>';
    document.body.appendChild(loadingDiv);

    // Wait a bit to ensure charts have rendered properly
    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract key metrics
    const metricsContainer = element.querySelector('[class*="KpiCards"]');
    const metrics = extractMetrics(metricsContainer);
    
    // Extract active tab content for charts
    const tabContents = Array.from(element.querySelectorAll('[role="tabpanel"]')).filter(
      panel => panel.getAttribute('data-state') === 'active'
    );
    
    // Create a new PDF document in a4 format
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Make sure autoTable is available
    if (typeof pdf.autoTable !== 'function') {
      // Fallback to manual table creation if autoTable isn't available
      console.warn('autoTable function not available, using fallback table implementation');
      createSimplePdf(pdf, metrics, tabContents, reportTitle);
    } else {
      // Use the full professional report with autoTable
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // margin in mm
      
      // Add custom font (using the default fonts available in jsPDF)
      pdf.setFont("helvetica");
      
      // Create cover page
      createCoverPage(pdf, reportTitle);
      
      // Create disclaimer page
      createDisclaimerPage(pdf);
      
      // Create executive summary
      createExecutiveSummary(pdf, metrics);
      
      // Performance metrics section
      createPerformanceMetricsSection(pdf, metrics);
      
      // Capture and add charts
      await addCharts(pdf, tabContents);
      
      // Add appendix and risk warnings
      createAppendix(pdf);
      
      // Add page numbers to all pages except cover
      addPageNumbers(pdf);
    }
    
    // Save the PDF
    pdf.save(filename);

    // Remove loading message
    document.body.removeChild(loadingDiv);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Clean up loading message if it exists
    const loadingDiv = document.querySelector('div[style*="position: fixed"]');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
    return false;
  }
};

/**
 * Extract metrics from the DOM
 */
function extractMetrics(metricsContainer: Element | null) {
  // Default values
  const defaultMetrics = {
    netProfit: 'N/A',
    profitFactor: 'N/A',
    sharpeRatio: 'N/A',
    maxDrawdown: 'N/A',
    winRate: 'N/A',
    trades: 'N/A',
    averageWin: 'N/A',
    averageLoss: 'N/A',
  };

  if (!metricsContainer) {
    console.warn('Metrics container not found in the DOM');
    return defaultMetrics;
  }

  const getMetricByLabel = (label: string) => {
    // First try the more specific approach
    const elements = Array.from(metricsContainer.querySelectorAll('div'));
    for (const el of elements) {
      if (el.textContent && el.textContent.includes(label)) {
        // Try to find the metric value in the next sibling or child element
        const metricElement = el.nextElementSibling || el.querySelector('.text-2xl, .text-xl, .font-semibold');
        if (metricElement && metricElement.textContent && metricElement.textContent.trim() !== '') {
          return metricElement.textContent.trim();
        }
      }
    }

    // Try a broader search if the specific approach fails
    const allElements = Array.from(metricsContainer.querySelectorAll('*'));
    for (const el of allElements) {
      if (el.textContent && el.textContent.includes(label)) {
        // Check parent, siblings, and nearby elements
        const parent = el.parentElement;
        if (parent) {
          // Check children of parent for potential value
          const siblings = Array.from(parent.children);
          for (const sibling of siblings) {
            if (sibling !== el && sibling.textContent && /\d/.test(sibling.textContent)) {
              return sibling.textContent.trim();
            }
          }
        }
      }
    }

    return 'N/A';
  };

  const metrics = {
    netProfit: getMetricByLabel('Net Profit'),
    profitFactor: getMetricByLabel('Profit Factor'),
    sharpeRatio: getMetricByLabel('Sharpe Ratio'),
    maxDrawdown: getMetricByLabel('Max Drawdown'),
    winRate: getMetricByLabel('Win Rate'),
    trades: getMetricByLabel('Total Trades'),
    averageWin: getMetricByLabel('Average Win'),
    averageLoss: getMetricByLabel('Average Loss'),
  };

  // Check if all metrics are N/A, if so, try a deeper DOM search
  if (Object.values(metrics).every(value => value === 'N/A')) {
    console.warn('All metrics are N/A, attempting deeper DOM search');
    
    // Look for any elements with numeric values that might contain our metrics
    const allNumericElements = Array.from(document.querySelectorAll('div, span, p'))
      .filter(el => el.textContent && /\$?[0-9]+(\.[0-9]+)?%?/.test(el.textContent));
    
    // Try to match these elements to metrics based on context
    if (allNumericElements.length > 0) {
      // For each numeric element, check if its parent or previous sibling contains metric-related text
      for (const numElement of allNumericElements) {
        const parentText = numElement.parentElement?.textContent?.toLowerCase() || '';
        const previousSibling = numElement.previousElementSibling;
        const previousText = previousSibling?.textContent?.toLowerCase() || '';
        
        if (parentText.includes('profit') || previousText.includes('profit')) {
          metrics.netProfit = numElement.textContent?.trim() || metrics.netProfit;
        } else if (parentText.includes('factor') || previousText.includes('factor')) {
          metrics.profitFactor = numElement.textContent?.trim() || metrics.profitFactor;
        } else if (parentText.includes('sharpe') || previousText.includes('sharpe')) {
          metrics.sharpeRatio = numElement.textContent?.trim() || metrics.sharpeRatio;
        } else if (parentText.includes('drawdown') || previousText.includes('drawdown')) {
          metrics.maxDrawdown = numElement.textContent?.trim() || metrics.maxDrawdown;
        } else if (parentText.includes('win rate') || previousText.includes('win rate')) {
          metrics.winRate = numElement.textContent?.trim() || metrics.winRate;
        } else if (parentText.includes('trades') || previousText.includes('trades')) {
          metrics.trades = numElement.textContent?.trim() || metrics.trades;
        }
      }
    }
  }

  return metrics;
}

/**
 * Create the cover page
 */
function createCoverPage(pdf, reportTitle) {
  // Background
  pdf.setFillColor(40, 45, 60);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
  
  // Title banner
  pdf.setFillColor(25, 30, 40);
  pdf.rect(0, 60, pdf.internal.pageSize.getWidth(), 50, 'F'); // Made taller to accommodate longer titles
  
  // Logo placeholder
  pdf.setFillColor(70, 130, 210);
  pdf.circle(pdf.internal.pageSize.getWidth() / 2, 35, 12, 'F');
  
  // Title - handle long titles by splitting into multiple lines if needed
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18); // Reduced from 24 to fit longer titles
  pdf.setFont("helvetica", "bold");
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40; // 20mm margin on each side
  
  // Split long titles into multiple lines
  const titleLines = pdf.splitTextToSize(reportTitle, maxWidth);
  let yPos = 75; // Starting Y position
  
  // Render each line of the title
  titleLines.forEach(line => {
    pdf.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10; // Move down for next line
  });
  
  // Subtitle - positioned below the multi-line title
  pdf.setFontSize(14); // Reduced from 16
  pdf.setFont("helvetica", "normal");
  pdf.text('Quantitative Strategy Analysis Report', pageWidth / 2, yPos + 10, { align: 'center' });
  
  // Date - positioned further down
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  pdf.setFontSize(12);
  pdf.text(`Generated on ${formattedDate}`, pageWidth / 2, yPos + 25, { align: 'center' });
  
  // Bottom decoration
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pdf.internal.pageSize.getWidth(), 20, 'F');
  
  // Footer text
  pdf.setFontSize(9);
  pdf.text('CONFIDENTIAL - FOR PROFESSIONAL INVESTORS ONLY', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Add a new page for the next section
  pdf.addPage();
}

/**
 * Create the disclaimer page
 */
function createDisclaimerPage(pdf) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  // Header
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('IMPORTANT DISCLAIMER', pageWidth / 2, 14, { align: 'center' });
  
  // Reset text color for main content
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  // Disclaimer text
  const disclaimer = [
    "This report is generated for informational purposes only and does not constitute investment advice or an offer to sell or the solicitation of an offer to buy any securities.",
    "",
    "Past performance is not indicative of future results. The performance data presented in this report is based on historical market data and is not a guarantee of future performance.",
    "",
    "The information contained in this report, including metrics, analysis, and forecasts, has been obtained from sources believed to be reliable, but its accuracy and completeness are not guaranteed.",
    "",
    "Trading and investing involve substantial risk of loss and are not suitable for all investors. Before making any investment decision, you should carefully consider your financial situation, investment objectives, level of experience, and risk appetite.",
    "",
    "Monte Carlo simulations, backtests, and other predictive models have inherent limitations and may not reflect real-world trading conditions. Market conditions change frequently, and past patterns may not repeat.",
    "",
    "No part of this document may be reproduced in any manner without prior written permission.",
  ];
  
  let y = 40;
  disclaimer.forEach(paragraph => {
    const lines = pdf.splitTextToSize(paragraph, pageWidth - 2 * margin);
    pdf.text(lines, margin, y);
    y += 10 * (lines.length);
  });
  
  // Add company information at bottom
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by RoboQuant.ai Strategy Analysis Suite', pageWidth / 2, 250, { align: 'center' });
  pdf.text('© ' + new Date().getFullYear() + ' RoboQuant.ai. All Rights Reserved.', pageWidth / 2, 255, { align: 'center' });
  
  // Add a new page for the next section
  pdf.addPage();
}

/**
 * Create the executive summary section
 */
function createExecutiveSummary(pdf, metrics) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  // Section header
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text('EXECUTIVE SUMMARY', pageWidth / 2, 14, { align: 'center' });
  
  // Reset text color for main content
  pdf.setTextColor(40, 40, 40);
  
  // Summary introduction
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let y = 30;
  
  const summaryText = "This report provides a comprehensive quantitative analysis of the trading strategy performance. The strategy has been evaluated using industry-standard metrics to assess risk-adjusted returns, drawdown characteristics, and profit consistency across different market conditions.";
  const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
  pdf.text(summaryLines, margin, y);
  y += 10 * (summaryLines.length);
  
  // Key Performance Indicators section
  y += 10;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Key Performance Indicators', margin, y);
  y += 8;
  
  pdf.setFont("helvetica", "normal");
  
  // Check if we have any valid metrics (not all N/A)
  const hasValidMetrics = Object.values(metrics).some(value => value !== 'N/A');
  
  if (hasValidMetrics) {
    // Create a table with key metrics
    const tableData = [
      [{ content: 'Metric', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: 'Value', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ['Net Profit', metrics.netProfit],
      ['Profit Factor', metrics.profitFactor],
      ['Sharpe Ratio', metrics.sharpeRatio],
      ['Maximum Drawdown', metrics.maxDrawdown],
      ['Win Rate', metrics.winRate],
      ['Total Trades', metrics.trades],
    ];
    
    pdf.autoTable({
      startY: y,
      head: [],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
      },
      didDrawPage: function(data) {
        // Add footer to each page
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('RoboQuant.ai Quantitative Analysis', margin, pageHeight - 10);
        pdf.text('CONFIDENTIAL', pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
  } else {
    // If all metrics are N/A, show a message instead of a table
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    const noDataMessage = "Performance metrics are not available for this strategy. This may be due to insufficient trading history or data collection issues. The strategy should be evaluated further once more data becomes available.";
    const noDataLines = pdf.splitTextToSize(noDataMessage, pageWidth - 2 * margin);
    pdf.text(noDataLines, margin, y);
    y += 10 * (noDataLines.length) + 10;
    
    // Add a notice about the importance of data
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const dataNotice = "Note: Quantitative assessment requires sufficient historical trading data. Please ensure that trade data is properly imported and that the strategy has a meaningful sample size of trades before generating reports.";
    const noticeLines = pdf.splitTextToSize(dataNotice, pageWidth - 2 * margin);
    pdf.text(noticeLines, margin, y);
    y += 10 * (noticeLines.length) + 15;
  }
  
  // Interpretation section
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Performance Interpretation', margin, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  let interpretationText = "";
  
  // Determine interpretation based on metric validity
  if (hasValidMetrics && metrics.netProfit.includes("$") && !metrics.netProfit.includes("-")) {
    interpretationText = "The strategy demonstrates positive performance with favorable risk-adjusted metrics. With a profit factor above 1 and a positive Sharpe ratio, the strategy provides returns above the risk-free rate when accounting for volatility. The maximum drawdown is within acceptable parameters for the strategy's return profile.";
  } else if (hasValidMetrics) {
    interpretationText = "The strategy's performance metrics indicate areas for optimization. While providing valuable market exposure, the risk-adjusted returns suggest that further parameter refinement may enhance overall performance. Additional analysis of trade timing and position sizing is recommended.";
  } else {
    interpretationText = "Insufficient data is available to provide a detailed performance interpretation. It is recommended to accumulate more trading history or ensure that all data is properly imported before making definitive assessments of the strategy's performance characteristics.";
  }
  
  const intLines = pdf.splitTextToSize(interpretationText, pageWidth - 2 * margin);
  pdf.text(intLines, margin, y);
  
  // Add a new page for next section
  pdf.addPage();
}

/**
 * Create the performance metrics section
 */
function createPerformanceMetricsSection(pdf, metrics) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  // Section header
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text('PERFORMANCE ANALYSIS', pageWidth / 2, 14, { align: 'center' });
  
  // Reset text color for main content
  pdf.setTextColor(40, 40, 40);
  
  // Introduction
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  let y = 30;
  
  const introText = "This section provides a detailed breakdown of the strategy's performance characteristics across multiple dimensions including returns, risk metrics, and statistical distributions.";
  const introLines = pdf.splitTextToSize(introText, pageWidth - 2 * margin);
  pdf.text(introLines, margin, y);
  y += 8 * (introLines.length) + 10;
  
  // Check if we have any valid metrics (not all N/A)
  const hasValidMetrics = Object.values(metrics).some(value => value !== 'N/A');
  
  if (hasValidMetrics) {
    // Create subsections with metrics data
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('Return Metrics', margin, y);
    y += 8;
    
    // Return metrics table
    const returnTable = [
      [{ content: 'Metric', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: 'Value', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ['Net Profit', metrics.netProfit],
      ['Profit Factor', metrics.profitFactor],
      ['Win Rate', metrics.winRate],
      ['Trades', metrics.trades]
    ];
    
    pdf.autoTable({
      startY: y,
      head: [],
      body: returnTable,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
      }
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
    
    // Risk metrics section
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('Risk Metrics', margin, y);
    y += 8;
    
    // Risk metrics table
    const riskTable = [
      [{ content: 'Metric', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: 'Value', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ['Sharpe Ratio', metrics.sharpeRatio],
      ['Maximum Drawdown', metrics.maxDrawdown],
      ['Average Win', metrics.averageWin || 'N/A'],
      ['Average Loss', metrics.averageLoss || 'N/A']
    ];
    
    pdf.autoTable({
      startY: y,
      head: [],
      body: riskTable,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
      }
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
  } else {
    // If no valid metrics, show a message
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "italic");
    const noDataMessage = "Performance metrics are not available for this strategy. The report contains placeholder values as insufficient data is available for a comprehensive analysis.";
    const noDataLines = pdf.splitTextToSize(noDataMessage, pageWidth - 2 * margin);
    pdf.text(noDataLines, margin, y);
    y += 8 * (noDataLines.length) + 15;
    
    // Add a sample metrics table with explanations
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('Sample Metrics (For Reference)', margin, y);
    y += 8;
    
    const sampleTable = [
      [{ content: 'Metric', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
       { content: 'Description', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ['Net Profit', 'Total profit or loss from all trades after commissions/fees'],
      ['Profit Factor', 'Ratio of gross profits to gross losses (values > 1 indicate profitability)'],
      ['Sharpe Ratio', 'Risk-adjusted return relative to risk-free rate'],
      ['Maximum Drawdown', 'Largest peak-to-trough decline in equity'],
      ['Win Rate', 'Percentage of trades that were profitable']
    ];
    
    pdf.autoTable({
      startY: y,
      head: [],
      body: sampleTable,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      }
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
  }
  
  // Interpretation section
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Risk-Adjusted Performance', margin, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  let riskText = hasValidMetrics
    ? "The risk-adjusted metrics indicate the strategy's efficiency in utilizing capital relative to the risk taken. A higher Sharpe ratio suggests better risk-adjusted returns. The maximum drawdown represents the largest peak-to-trough decline experienced by the strategy, a critical measure for risk management."
    : "Risk-adjusted performance assessment requires sufficient trading history. When data becomes available, this section will analyze how efficiently the strategy utilizes capital relative to the risk taken.";
  
  const riskLines = pdf.splitTextToSize(riskText, pageWidth - 2 * margin);
  pdf.text(riskLines, margin, y);
  
  // Add a new page for the charts
  pdf.addPage();
}

/**
 * Capture and add charts from the DOM to the PDF
 */
async function addCharts(pdf, tabContents) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const chartWidth = pageWidth - 2 * margin;
  
  // Section header
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text('PERFORMANCE VISUALIZATION', pageWidth / 2, 14, { align: 'center' });
  
  pdf.setTextColor(40, 40, 40);
  let y = 30;
  
  // Try to find charts in the active tabs
  const chartElements = [];
  
  try {
    tabContents.forEach(tab => {
      // Find chart containers using multiple selector strategies
      const charts = [
        ...Array.from(tab.querySelectorAll('.recharts-wrapper')),
        ...Array.from(tab.querySelectorAll('[class*="Chart"]')),
        ...Array.from(tab.querySelectorAll('[class*="chart"]')),
        ...Array.from(tab.querySelectorAll('canvas')),
        ...Array.from(tab.querySelectorAll('svg'))
      ];
      
      charts.forEach(chart => {
        // Only add unique elements that look like charts (have sufficient dimensions)
        if (chart && 
            typeof chart === 'object' && 
            'getBoundingClientRect' in chart) {
          const element = chart as HTMLElement;
          const rect = element.getBoundingClientRect();
          if (rect.width > 50 && rect.height > 50) {
            chartElements.push(chart);
          }
        }
      });
    });
  } catch (error) {
    console.warn('Error searching for chart elements:', error);
  }
  
  // If we found charts, capture them
  if (chartElements.length) {
    for (let i = 0; i < Math.min(chartElements.length, 3); i++) { // Limit to 3 charts max
      const chart = chartElements[i];
      
      try {
        // Get chart title if available
        let title = 'Chart Analysis';
        try {
          const titleEl = chart.closest('[class*="Card"]')?.querySelector('h3, h2, [class*="Title"]');
          if (titleEl) {
            title = titleEl.textContent || title;
          }
        } catch (err) {
          console.warn('Error getting chart title:', err);
        }
        
        // Add chart title
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, y);
        y += 8;
        
        // Use a try/catch block for html2canvas to prevent crashes
        try {
          // Capture chart as image
          const canvas = await html2canvas(chart as HTMLElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true,
            useCORS: true
          });
          
          // Calculate dimensions to fit within page width
          const imgWidth = chartWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image to PDF
          pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            margin,
            y,
            imgWidth,
            imgHeight
          );
          
          y += imgHeight + 20;
        } catch (captureError) {
          console.error('Error capturing chart:', captureError);
          // Add a fallback when chart capture fails
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, y, chartWidth, 80, 'F');
          
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Chart visualization could not be captured', margin + 20, y + 40);
          
          y += 100;
        }
        
        // Add a new page if there's not enough space for another chart
        if (y > pdf.internal.pageSize.getHeight() - 40 && i < Math.min(chartElements.length, 3) - 1) {
          pdf.addPage();
          
          // Reset y position and add section header to new page
          pdf.setFillColor(70, 130, 210);
          pdf.rect(0, 0, pageWidth, 20, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text('PERFORMANCE VISUALIZATION (CONT.)', pageWidth / 2, 14, { align: 'center' });
          
          pdf.setTextColor(40, 40, 40);
          y = 30;
        }
      } catch (error) {
        console.error('Error processing chart for PDF:', error);
      }
    }
  } else {
    // Fallback for no charts found
    createPlaceholderCharts(pdf, y);
  }
}

/**
 * Create placeholder charts when no real charts could be found or captured
 */
function createPlaceholderCharts(pdf, startY) {
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const chartWidth = pageWidth - 2 * margin;
  let y = startY;
  
  // If no charts found, add a more comprehensive message and sample visualizations
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "italic");
  pdf.text('No visualization charts are available for this report.', margin, y);
  y += 10;
  
  pdf.setFont("helvetica", "normal");
  const noChartsMessage = "Charts and visualizations will be included in this section once sufficient trading data is available. Visualizations typically include:";
  const noChartsLines = pdf.splitTextToSize(noChartsMessage, pageWidth - 2 * margin);
  pdf.text(noChartsLines, margin, y);
  y += 8 * noChartsLines.length + 5;
  
  // Add a list of expected chart types
  const chartTypes = [
    "• Equity Growth Chart: Shows the cumulative account balance over time",
    "• Drawdown Analysis: Visualizes periods of drawdown and recovery",
    "• Monthly Performance: Breakdown of returns by calendar month",
    "• Trade Distribution: Statistical distribution of trade outcomes",
    "• Symbol Analysis: Performance breakdown by trading instrument"
  ];
  
  pdf.setFontSize(10);
  chartTypes.forEach(chartType => {
    pdf.text(chartType, margin + 5, y);
    y += 7;
  });
  
  y += 10;
  
  // Add a sample equity curve for reference
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Sample Equity Curve (For Reference Only)", margin, y);
  y += 10;
  
  // Draw a simple sample equity curve
  const startX = margin;
  const endX = pageWidth - margin;
  const centerY = y + 50;
  const curveHeight = 70;
  
  // Draw axes
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  
  // X-axis
  pdf.line(startX, centerY + curveHeight/2, endX, centerY + curveHeight/2);
  
  // Y-axis
  pdf.line(startX, centerY - curveHeight/2, startX, centerY + curveHeight/2);
  
  // Draw sample curve
  pdf.setDrawColor(70, 130, 210);
  pdf.setLineWidth(1.5);
  
  const points = [];
  const steps = 10;
  const stepSize = (endX - startX) / steps;
  
  // Generate some sample curve points
  for (let i = 0; i <= steps; i++) {
    const x = startX + i * stepSize;
    // Create a slightly wavy upward curve
    const y = centerY - 10 - (i * 4) - Math.sin(i) * 10;
    points.push([x, y]);
    
    // Add a dot at each point
    if (i % 2 === 0) {
      pdf.setFillColor(70, 130, 210);
      pdf.circle(x, y, 1, 'F');
    }
  }
  
  // Draw the lines connecting the points
  for (let i = 0; i < points.length - 1; i++) {
    pdf.line(points[i][0], points[i][1], points[i+1][0], points[i+1][1]);
  }
  
  // Add axis labels
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  
  // X-axis labels
  pdf.text("Time", (startX + endX) / 2, centerY + curveHeight/2 + 10, { align: 'center' });
  
  // Y-axis label
  pdf.text("Equity", startX - 10, centerY, { align: 'center', angle: 90 });
}

/**
 * Create the appendix section
 */
function createAppendix(pdf) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Section header
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text('APPENDIX & METHODOLOGY', pageWidth / 2, 14, { align: 'center' });
  
  // Reset text color for main content
  pdf.setTextColor(40, 40, 40);
  
  let y = 30;
  
  // Methodology section
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Methodology', margin, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const methodologyText = "This analysis employs standard quantitative metrics commonly used in the financial industry to evaluate trading strategies. Historical trade data is analyzed to derive performance metrics, risk characteristics, and statistical distributions.";
  const methodLines = pdf.splitTextToSize(methodologyText, pageWidth - 2 * margin);
  pdf.text(methodLines, margin, y);
  y += 6 * methodLines.length + 10;
  
  // Definitions
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Key Metrics Definitions', margin, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const definitions = [
    { term: 'Net Profit', definition: 'Total profit or loss generated by the strategy over the analyzed period.' },
    { term: 'Profit Factor', definition: 'Ratio of gross profit to gross loss. Values above 1 indicate a profitable strategy.' },
    { term: 'Sharpe Ratio', definition: 'Measure of risk-adjusted return, calculated as the average return earned in excess of the risk-free rate per unit of volatility.' },
    { term: 'Maximum Drawdown', definition: 'Largest peak-to-trough decline in account value, expressed as a percentage of peak value.' },
    { term: 'Win Rate', definition: 'Percentage of trades that result in a profit.' },
  ];
  
  let definitionContent = '';
  definitions.forEach(def => {
    definitionContent += `${def.term}: ${def.definition}\n\n`;
  });
  
  const defLines = pdf.splitTextToSize(definitionContent, pageWidth - 2 * margin);
  pdf.text(defLines, margin, y);
  y += 6 * defLines.length + 10;
  
  // Risk warning
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text('Risk Warning', margin, y);
  y += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const riskText = "RISK WARNING: Trading financial instruments carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.";
  
  const riskLines = pdf.splitTextToSize(riskText, pageWidth - 2 * margin);
  pdf.text(riskLines, margin, y);
  
  // Add company information at bottom
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by RoboQuant.ai Strategy Analysis Suite', pageWidth / 2, 255, { align: 'center' });
  pdf.text('© ' + new Date().getFullYear() + ' RoboQuant.ai. All Rights Reserved.', pageWidth / 2, 260, { align: 'center' });
}

/**
 * Add page numbers to all pages except the cover
 */
function addPageNumbers(pdf) {
  const pageCount = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add page numbers to each page (except cover page)
  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Page ${i - 1} of ${pageCount - 1}`, pageWidth - 20, 10, { align: 'right' });
  }
}

/**
 * Create a simpler PDF if autoTable isn't available
 */
function createSimplePdf(pdf: jsPDF, metrics: any, tabContents: Element[], reportTitle: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Title page
  pdf.setFillColor(70, 130, 210);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(reportTitle, pageWidth / 2, 25, { align: 'center' });
  
  // Date
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const today = new Date();
  pdf.text(`Generated on ${today.toLocaleDateString()}`, pageWidth / 2, 50, { align: 'center' });
  
  // Key metrics
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Key Performance Metrics", margin, 70);
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  let y = 80;
  
  // Draw metrics as simple text
  Object.entries(metrics).forEach(([key, value]) => {
    pdf.text(`${key}: ${value}`, margin, y);
    y += 10;
  });
  
  // Try to add charts
  if (tabContents.length > 0) {
    // Add a new page for charts
    pdf.addPage();
    
    pdf.setFillColor(70, 130, 210);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Charts", pageWidth / 2, 15, { align: 'center' });
    
    pdf.setTextColor(50, 50, 50);
    
    // Simple function to add charts
    addChartsSimple(pdf, tabContents);
  }
}

/**
 * Simplified version of adding charts
 */
async function addChartsSimple(pdf: jsPDF, tabContents: Element[]) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const chartWidth = pageWidth - 2 * margin;
  let y = 30;
  
  // Find charts
  const chartElements: any[] = [];
  tabContents.forEach(tab => {
    const charts = tab.querySelectorAll('.recharts-wrapper, [class*="Chart"], [class*="chart"]');
    charts.forEach(chart => chartElements.push(chart));
  });
  
  // If we found charts, capture them
  if (chartElements.length) {
    for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
      try {
        const chart = chartElements[i];
        
        // Capture chart as image
        const canvas = await html2canvas(chart as HTMLElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        // Calculate dimensions to fit within page width
        const imgWidth = chartWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          y,
          imgWidth,
          imgHeight
        );
        
        y += imgHeight + 20;
        
        // Add a new page if needed
        if (y > pdf.internal.pageSize.getHeight() - 40 && i < chartElements.length - 1) {
          pdf.addPage();
          y = 30;
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }
} 