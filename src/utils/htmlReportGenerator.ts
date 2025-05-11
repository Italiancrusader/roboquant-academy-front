import { ParsedStrategyReport } from '@/types/strategyreportgenie';

// Helper functions to safely parse values from metrics
const parseBalanceValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(/[$,]/g, '')) || 10000;
  return 10000; // Default value if undefined or invalid
};

const parseNumericValue = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(/[$,%\-]/g, '')) || defaultValue;
  return defaultValue;
};

const isPositiveValue = (value: any): boolean => {
  return parseNumericValue(value) >= 0;
};

/**
 * Limit the length of a title by truncating if necessary
 */
function limitTitleLength(title: string, maxLength: number = 80): string {
  if (!title) return '';
  
  // If the title is already short enough, return it as is
  if (title.length <= maxLength) return title;
  
  // Try to find a sensible breaking point (like a space or underscore)
  const halfLength = Math.floor(maxLength / 2);
  const firstPart = title.substring(0, halfLength);
  const secondPart = title.substring(title.length - halfLength);
  
  return `${firstPart}...${secondPart}`;
}

/**
 * Generate a professional HTML trading strategy report
 * @param data The parsed strategy report data
 * @param reportTitle Title for the report
 * @returns HTML string containing the full report
 */
export const generateHtmlReport = (
  data: any, // Changed from ParsedStrategyReport to any for flexibility
  reportTitle: string = 'Quantitative Trading Analysis'
): string => {
  // Get current date for the report
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Extract metrics from the data
  const metrics = data.summary || {};
  const trades = data.trades || [];
  
  // More robust trade filtering - handle different formats from different platforms
  const completedTrades = trades.filter(t => {
    // MT4/5 format with state
    if (t.state === 'out' || t.direction === 'out') return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  // Calculate win rate directly from trades if not available in metrics
  let winRate = metrics['Profit Trades']?.split('(')[1]?.split('%')[0] || '0';
  if (winRate === '0' && completedTrades.length > 0) {
    const winningTrades = completedTrades.filter(t => t.profit > 0);
    winRate = ((winningTrades.length / completedTrades.length) * 100).toFixed(2);
  }
  
  // Calculate profit statistics if not available in metrics
  let profitFactor = metrics['Profit Factor'] || '0.00';
  let grossProfit = 0;
  let grossLoss = 0;
  let avgWin = 0;
  let avgLoss = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let longPositions = 0;
  let shortPositions = 0;
  let totalLossTrades = 0;
  let totalWinTrades = 0;
  
  if (completedTrades.length > 0) {
    const winningTrades = completedTrades.filter(t => t.profit > 0);
    const losingTrades = completedTrades.filter(t => t.profit < 0);
    
    totalWinTrades = winningTrades.length;
    totalLossTrades = losingTrades.length;
    
    // Calculate trade direction statistics
    completedTrades.forEach(trade => {
      // Count directions - check different format properties
      if (trade.side === 'long' || trade.type?.toLowerCase().includes('buy')) {
        longPositions++;
      } else if (trade.side === 'short' || trade.type?.toLowerCase().includes('sell')) {
        shortPositions++;
      }
    });
    
    // Calculate profit statistics
    grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '0.00';
    
    avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    
    largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0;
    largestLoss = losingTrades.length > 0 ? Math.max(...losingTrades.map(t => Math.abs(t.profit))) : 0;
  }
  
  // Calculate total trades directly if not available or incorrect in metrics
  const totalTrades = completedTrades.length;
  
  // Handle balance values that could be in different formats
  const initialBalance = parseBalanceValue(metrics['Initial Balance']);
  const finalBalance = parseBalanceValue(metrics['Final Balance']);
  
  // If final balance is not available, calculate it from trades
  let calculatedFinalBalance = initialBalance;
  if (!metrics['Final Balance'] && completedTrades.length > 0) {
    calculatedFinalBalance = completedTrades.reduce((balance, trade) => balance + trade.profit, initialBalance);
  }
  
  // Use calculated final balance if needed
  const effectiveFinalBalance = finalBalance > initialBalance ? finalBalance : calculatedFinalBalance;
  const totalNetProfit = effectiveFinalBalance - initialBalance;
  const percentChange = ((effectiveFinalBalance - initialBalance) / initialBalance * 100).toFixed(2);
  
  // Calculate drawdown if not available
  let maxDrawdown = 0;
  let maxDrawdownPct = '0.00';
  
  if (metrics['Maximal Drawdown']) {
    // Try to extract from metrics
    const drawdownParts = metrics['Maximal Drawdown'].split(' ');
    if (drawdownParts.length > 1) {
      maxDrawdownPct = drawdownParts[1].replace('%', '').replace('(', '').replace(')', '');
    }
  } else if (completedTrades.length > 0) {
    // Calculate drawdown from trades
    let peak = initialBalance;
    let currentDrawdown = 0;
    let balance = initialBalance;
    
    // Sort trades by date for accurate drawdown calculation
    const sortedTrades = [...completedTrades].sort((a, b) => 
      new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    );
    
    sortedTrades.forEach(trade => {
      balance += trade.profit;
      
      if (balance > peak) {
        peak = balance;
        currentDrawdown = 0;
      } else {
        currentDrawdown = peak - balance;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
      }
    });
    
    maxDrawdownPct = peak > 0 ? ((maxDrawdown / peak) * 100).toFixed(2) : '0.00';
  }
  
  // Calculate consecutive statistics
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateConsecutiveStats(trades);
  
  // Generate equityCurve data points for the chart
  const equityCurveData = generateEquityCurveData(trades, initialBalance);
  
  // Calculate monthly performance for chart
  const monthlyPerformance = calculateMonthlyPerformance(trades);
  
  // Calculate trade distribution for chart
  const profitDistribution = calculateProfitDistribution(trades);
  
  // Create HTML template with embedded styles and scripts
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle} | RoboQuant.ai</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
      padding: 0;
      margin: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Header styles */
    header {
      background: linear-gradient(135deg, #294994 0%, #4361ee 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header-content {
      position: relative;
      z-index: 2;
      max-width: 100%;
    }
    
    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIxMDAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiIGlkPSJhIj48c3RvcCBzdG9wLWNvbG9yPSIjRkZGIiBzdG9wLW9wYWNpdHk9Ii4wNSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNGRkYiIHN0b3Atb3BhY2l0eT0iLjAyIiBvZmZzZXQ9IjEwMCUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMTQ0MCAyNjdWMEgwdjQwMGMxMTQuMDQxLTMzLjAxOSAyNDQuNDMzLTUwLjY5MyAzOTEuMTc3LTUzLjAyMkM2ODkuODUyIDM0My43MDggODE0LjQ0NSA0MTMuNTY4IDk2MCA0MDBoMTQ0YzE0Mi45NDkgMCAyNTQuODUtNDQuNCA0NzEuNTQ1LTEzMy44MzhaIiBmaWxsPSJ1cmwoI2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3N2Zz4=');
      background-size: cover;
      opacity: 0.4;
      z-index: 1;
    }
    
    .logo {
      margin-bottom: 20px;
      font-size: 1.3rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }
    
    .logo span {
      color: #7fe3ff;
    }
    
    header h1 {
      font-size: 2.2rem;
      margin-bottom: 15px;
      font-weight: 700;
      line-height: 1.3;
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      padding: 0 10px;
    }
    
    header p {
      font-size: 1.2rem;
      opacity: 0.95;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .header-meta {
      margin-top: 20px;
      font-size: 0.95rem;
      opacity: 0.9;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 30px;
    }
    
    .header-meta div {
      display: flex;
      align-items: center;
    }
    
    .header-meta svg {
      margin-right: 6px;
      width: 18px;
      height: 18px;
    }
    
    /* Section styles */
    section {
      padding: 30px 40px;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    
    h2 {
      color: #294994;
      margin-bottom: 20px;
      font-size: 1.8rem;
      font-weight: 600;
      border-bottom: 2px solid #e7e9fd;
      padding-bottom: 10px;
    }
    
    h3 {
      color: #334195;
      margin: 25px 0 15px;
      font-size: 1.4rem;
    }
    
    p {
      margin-bottom: 15px;
      color: #555;
    }
    
    /* Card grid layout */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      border: 1px solid #e0e0e0;
    }
    
    .metric-card h4 {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .metric-card .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 5px;
    }
    
    .metric-card .description {
      font-size: 0.8rem;
      color: #888;
    }
    
    /* Positive/negative values */
    .positive {
      color: #2e8540;
    }
    
    .negative {
      color: #d83933;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 0.9rem;
    }
    
    th {
      background-color: #f5f7ff;
      text-align: left;
      padding: 12px 15px;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
      color: #333;
    }
    
    td {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    
    tr:hover {
      background-color: #f9f9f9;
    }
    
    /* Charts */
    .chart-container {
      height: 400px;
      margin: 30px 0;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      border: 1px solid #eee;
    }
    
    /* Footer */
    footer {
      background-color: #294994;
      color: white;
      text-align: center;
      padding: 40px 30px;
      font-size: 0.9rem;
      position: relative;
      overflow: hidden;
    }
    
    footer .footer-content {
      position: relative;
      z-index: 2;
    }
    
    footer .footer-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0NDAsMjIuMjQyNDI0MiBDMTI3Mi43MTQyOSw5My41NzU3NTc2IDExMDUuNDI4NTcsMTIyLjUxNTE1MSA5MzguMTQyODU3LDEyMi41MTUxNTEgQzY4Ny4yMTQyODYsMTIyLjUxNTE1MSA2MTMuMTQyODU3LDQyLjIyNzI3MjcgMzYyLjIxNDI4Niw0Mi4yMjcyNzI3IEMyMzYuMDcxNDI5LDQyLjIyNzI3MjcgMTE4LjAzNTcxNCw2OC45MDkwOTA5IDAsMTIyLjUxNTE1MSBMMCwyMDAgTDE0NDAsMjAwIEwxNDQwLDIyLjI0MjQyNDIgWiIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsPSIjRkZGIi8+PC9zdmc+');
      background-position: bottom;
      background-size: cover;
      opacity: 0.2;
      z-index: 1;
    }
    
    footer p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 10px;
    }
    
    .footer-logo {
      margin-bottom: 20px;
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .footer-logo span {
      color: #7fe3ff;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }
    
    .footer-links a {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    .footer-links a:hover {
      opacity: 1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      header {
        padding: 30px 20px;
      }
      
      section {
        padding: 20px;
      }
      
      h2 {
        font-size: 1.5rem;
      }
      
      header h1 {
        font-size: 1.8rem;
      }
    }
    
    /* Print styles */
    @media print {
      body {
        background-color: white;
      }
      
      .container {
        box-shadow: none;
      }
      
      header {
        background: white;
        color: #294994;
        padding: 20px;
      }
      
      .chart-container {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      section {
        page-break-inside: avoid;
      }
    }
    
    /* Badges */
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-left: 8px;
    }
    
    .badge-mt5 {
      background-color: rgba(67, 97, 238, 0.1);
      color: #4361ee;
    }
    
    .badge-mt4 {
      background-color: rgba(50, 115, 220, 0.1);
      color: #3273dc;
    }
    
    .badge-tv {
      background-color: rgba(255, 107, 0, 0.1);
      color: #ff6b00;
    }
    
    /* Buttons */
    .button {
      display: inline-block;
      background-color: #294994;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 500;
      margin-top: 20px;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #1e3a7b;
    }
    
    /* Trade list table */
    .trade-table {
      width: 100%;
      overflow-x: auto;
    }
  </style>
  <!-- Include Chart.js for interactive charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-background"></div>
      <div class="header-content">
        <div class="logo">Robo<span>Quant</span>.ai</div>
        <h1>${limitTitleLength(reportTitle, 80)}</h1>
        <p>Professional Quantitative Performance Analysis</p>
        <div class="header-meta">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Generated on ${dateStr}
          </div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line><circle cx="18.5" cy="15.5" r="2.5"></circle><path d="M20.27 17.27 22 19"></path></svg>
            ${data.source || 'Trading Strategy Analysis'}
          </div>
        </div>
      </div>
    </header>
    
    <section id="executive-summary">
      <h2>Executive Summary</h2>
      <p>
        This report was generated by <strong>RoboQuant.ai Strategy Analysis Suite</strong>, providing comprehensive
        analysis of the trading strategy's performance, risk characteristics, and statistical metrics based on
        historical trade data. Use this information to assess the strategy's efficacy and opportunities for optimization.
      </p>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Net Profit</h4>
          <div class="value ${isPositiveValue(totalNetProfit) ? 'positive' : 'negative'}">
            ${totalNetProfit.toFixed(2)}
          </div>
          <div class="description">Total return after costs</div>
        </div>
        
        <div class="metric-card">
          <h4>Profit Factor</h4>
          <div class="value ${parseNumericValue(profitFactor) >= 1.5 ? 'positive' : parseNumericValue(profitFactor) >= 1 ? '' : 'negative'}">
            ${profitFactor}
          </div>
          <div class="description">Gross profit / gross loss</div>
        </div>
        
        <div class="metric-card">
          <h4>Win Rate</h4>
          <div class="value ${parseNumericValue(winRate) >= 50 ? 'positive' : 'negative'}">
            ${winRate}%
          </div>
          <div class="description">Percentage of winning trades</div>
        </div>
        
        <div class="metric-card">
          <h4>Max Drawdown</h4>
          <div class="value ${parseNumericValue(maxDrawdownPct) < 1000 ? 'positive' : 'negative'}">
            ${maxDrawdownPct}
          </div>
          <div class="description">Largest peak-to-trough decline</div>
        </div>
      </div>
      
      <p><strong>Trading Platform:</strong> 
        <span class="badge ${data.source === 'MT5' ? 'badge-mt5' : data.source === 'MT4' ? 'badge-mt4' : 'badge-tv'}">
          ${data.source}
        </span>
      </p>
      <p><strong>Total Trades:</strong> ${totalTrades} trades analyzed</p>
      <p><strong>Trading Period:</strong> ${formatDate(getEarliestDate(trades))} to ${formatDate(getLatestDate(trades))}</p>
    </section>
    
    <section id="performance-analysis">
      <h2>Performance Analysis</h2>
      
      <h3>Key Metrics</h3>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Description</th>
        </tr>
        <tr>
          <td>Initial Balance</td>
          <td>${initialBalance.toFixed(2)}</td>
          <td>Starting capital</td>
        </tr>
        <tr>
          <td>Final Balance</td>
          <td>${effectiveFinalBalance.toFixed(2)}</td>
          <td>Ending capital</td>
        </tr>
        <tr>
          <td>Total Return</td>
          <td class="${parseFloat(percentChange) >= 0 ? 'positive' : 'negative'}">${percentChange}%</td>
          <td>Percentage gain/loss</td>
        </tr>
        <tr>
          <td>Profit Factor</td>
          <td>${profitFactor}</td>
          <td>Ratio of gross profits to gross losses</td>
        </tr>
        <tr>
          <td>Expected Payoff</td>
          <td>${avgWin.toFixed(2)}</td>
          <td>Average profit per trade</td>
        </tr>
        <tr>
          <td>Maximal Drawdown</td>
          <td>${maxDrawdownPct}</td>
          <td>Largest peak-to-trough decline</td>
        </tr>
      </table>
      
      <h3>Equity Curve</h3>
      <div class="chart-container">
        <canvas id="equityChart"></canvas>
      </div>
      
      <h3>Monthly Performance</h3>
      <div class="chart-container">
        <canvas id="monthlyChart"></canvas>
      </div>
    </section>
    
    <section id="trade-analysis">
      <h2>Trade Analysis</h2>
      
      <h3>Trade Statistics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Trades</h4>
          <div class="value">${totalTrades}</div>
          <div class="description">Number of completed trades</div>
        </div>
        
        <div class="metric-card">
          <h4>Winning Trades</h4>
          <div class="value positive">${totalWinTrades}</div>
          <div class="description">${winRate}% win rate</div>
        </div>
        
        <div class="metric-card">
          <h4>Losing Trades</h4>
          <div class="value negative">${totalLossTrades}</div>
          <div class="description">${(100 - parseFloat(winRate)).toFixed(2)}% loss rate</div>
        </div>
        
        <div class="metric-card">
          <h4>Average Win</h4>
          <div class="value positive">${avgWin.toFixed(2)}</div>
          <div class="description">Mean profit per winning trade</div>
        </div>
        
        <div class="metric-card">
          <h4>Average Loss</h4>
          <div class="value negative">${avgLoss.toFixed(2)}</div>
          <div class="description">Mean loss per losing trade</div>
        </div>
        
        <div class="metric-card">
          <h4>Largest Win</h4>
          <div class="value positive">${largestWin.toFixed(2)}</div>
          <div class="description">Biggest single winning trade</div>
        </div>
        
        <div class="metric-card">
          <h4>Largest Loss</h4>
          <div class="value negative">${largestLoss.toFixed(2)}</div>
          <div class="description">Biggest single losing trade</div>
        </div>
        
        <div class="metric-card">
          <h4>Consecutive Wins</h4>
          <div class="value">${maxConsecutiveWins}</div>
          <div class="description">Longest winning streak</div>
        </div>
        
        <div class="metric-card">
          <h4>Consecutive Losses</h4>
          <div class="value">${maxConsecutiveLosses}</div>
          <div class="description">Longest losing streak</div>
        </div>
      </div>
      
      <h3>Profit Distribution</h3>
      <div class="chart-container">
        <canvas id="distributionChart"></canvas>
      </div>
      
      <h3>Direction Analysis</h3>
      <table>
        <tr>
          <th>Direction</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
        <tr>
          <td>Long Positions</td>
          <td>${longPositions}</td>
          <td>${((longPositions / totalTrades) * 100).toFixed(2)}%</td>
        </tr>
        <tr>
          <td>Short Positions</td>
          <td>${shortPositions}</td>
          <td>${((shortPositions / totalTrades) * 100).toFixed(2)}%</td>
        </tr>
      </table>
    </section>
    
    <section id="risk-analysis">
      <h2>Risk Analysis</h2>
      
      <h3>Risk Metrics</h3>
      <p>
        Risk analysis provides insights into the downside characteristics of the trading strategy
        and helps assess its resilience during adverse market conditions.
      </p>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Maximum Drawdown</h4>
          <div class="value">${maxDrawdownPct}</div>
          <div class="description">Peak to trough decline</div>
        </div>
        
        <div class="metric-card">
          <h4>Win/Loss Ratio</h4>
          <div class="value">${parseNumericValue(profitFactor) >= 1.5 ? 'Low Risk' : parseNumericValue(profitFactor) >= 1 ? 'Medium Risk' : 'High Risk'}</div>
          <div class="description">Avg win / avg loss</div>
        </div>
        
        <div class="metric-card">
          <h4>Profit Factor</h4>
          <div class="value">${profitFactor}</div>
          <div class="description">Gross profit / gross loss</div>
        </div>
        
        <div class="metric-card">
          <h4>Risk Assessment</h4>
          <div class="value">${parseNumericValue(profitFactor) >= 1.5 ? 'Low Risk' : parseNumericValue(profitFactor) >= 1 ? 'Medium Risk' : 'High Risk'}</div>
          <div class="description">Overall risk profile</div>
        </div>
      </div>
    </section>
    
    <section id="trade-list">
      <h2>Trade List</h2>
      <p>
        The table below shows up to 50 most recent trades. The complete trade history
        is available in the original CSV data.
      </p>
      
      <div class="trade-table">
        <table>
          <tr>
            <th>Date</th>
            <th>Symbol</th>
            <th>Type</th>
            <th>Direction</th>
            <th>Volume</th>
            <th>Price</th>
            <th>Profit</th>
          </tr>
          ${generateTradeRows(trades)}
        </table>
      </div>
    </section>
    
    <section id="disclaimer">
      <h2>Important Disclaimer</h2>
      <p>
        <strong>RISK WARNING:</strong> Trading financial instruments carries a high level of risk and may not be suitable for all investors.
        The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully
        consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could
        sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot
        afford to lose.
      </p>
      <p>
        <strong>PAST PERFORMANCE:</strong> Past performance is not necessarily indicative of future results. The results presented
        in this report are based on historical data and do not guarantee similar outcomes in the future.
        Market conditions change frequently and strategies that performed well in the past might not perform
        similarly in the future.
      </p>
      <p>
        <strong>NO INVESTMENT ADVICE:</strong> This report is for informational purposes only and does not constitute investment advice or
        an offer to sell or solicitation of an offer to buy any securities. All information provided here is
        to be used at your own risk. RoboQuant.ai and its affiliates are not responsible for any losses incurred
        as a result of using this report.
      </p>
    </section>
    
    <footer>
      <div class="footer-background"></div>
      <div class="footer-content">
        <div class="footer-logo">Robo<span>Quant</span>.ai</div>
        <p>Professional algorithmic trading tools and analytics</p>
        <p>© ${new Date().getFullYear()} RoboQuant.ai. All Rights Reserved.</p>
        <div class="footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  </div>
  
  <!-- Chart initialization scripts -->
  <script>
    // Initialize charts once the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Equity curve chart
      const equityCtx = document.getElementById('equityChart').getContext('2d');
      new Chart(equityCtx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(equityCurveData.labels)},
          datasets: [{
            label: 'Equity',
            data: ${JSON.stringify(equityCurveData.data)},
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return '$' + context.raw.toFixed(2);
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxTicksLimit: 12
              }
            },
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
      
      // Monthly performance chart
      const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
      new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(monthlyPerformance.labels)},
          datasets: [{
            label: 'Return %',
            data: ${JSON.stringify(monthlyPerformance.data)},
            backgroundColor: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? 'rgba(46, 133, 64, 0.7)' : 'rgba(216, 57, 51, 0.7)';
            },
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.raw.toFixed(2) + '%';
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
      
      // Profit distribution chart
      const distCtx = document.getElementById('distributionChart').getContext('2d');
      new Chart(distCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(profitDistribution.labels)},
          datasets: [{
            label: 'Number of Trades',
            data: ${JSON.stringify(profitDistribution.data)},
            backgroundColor: function(context) {
              const value = parseFloat(context.chart.data.labels[context.dataIndex]);
              return value >= 0 ? 'rgba(46, 133, 64, 0.7)' : 'rgba(216, 57, 51, 0.7)';
            },
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                title: function(context) {
                  const value = parseFloat(context[0].label);
                  if (value === 0) return 'Breakeven';
                  return (value > 0 ? '$' : '-$') + Math.abs(value).toFixed(2);
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'Profit/Loss Range ($)'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: 'Number of Trades'
              }
            }
          }
        }
      });
    });
  </script>
</body>
</html>
  `;
  
  return html;
};

/**
 * Save the HTML report as a downloadable file
 * @param html HTML content of the report
 * @param filename Filename for the download (without extension)
 */
export const downloadHtmlReport = (html: string, filename: string = 'quant-trading-report'): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  
  // Append to the document, click, and remove
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// Helper functions

/**
 * Format a date object as YYYY-MM-DD
 */
function formatDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return 'N/A';
  return date.toISOString().split('T')[0];
}

/**
 * Get a valid date from a trade object
 */
function getTradeDate(trade: any): Date | null {
  // Try all possible date properties
  const dateStr = trade.openTime || trade.timeFlag || trade.time;
  if (!dateStr) return null;
  
  // Convert to Date
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get the earliest date from an array of trades
 */
function getEarliestDate(trades: any[]): Date | null {
  if (!trades || trades.length === 0) return null;
  
  // Extract valid dates from all trades
  const dates = trades
    .map(t => getTradeDate(t))
    .filter(d => d !== null) as Date[];
  
  if (dates.length === 0) return null;
  
  // Find earliest date
  return new Date(Math.min(...dates.map(d => d.getTime())));
}

/**
 * Get the latest date from an array of trades
 */
function getLatestDate(trades: any[]): Date | null {
  if (!trades || trades.length === 0) return null;
  
  // Extract valid dates from all trades
  const dates = trades
    .map(t => getTradeDate(t))
    .filter(d => d !== null) as Date[];
  
  if (dates.length === 0) return null;
  
  // Find latest date
  return new Date(Math.max(...dates.map(d => d.getTime())));
}

/**
 * Calculate a percentage from count and total
 */
function calculatePercentage(count: string | undefined, total: string | undefined): string {
  if (!count || !total) return '0.00';
  const countNum = parseInt(count);
  const totalNum = parseInt(total);
  if (isNaN(countNum) || isNaN(totalNum) || totalNum === 0) return '0.00';
  return ((countNum / totalNum) * 100).toFixed(2);
}

/**
 * Calculate win/loss ratio from average win and average loss
 */
function calculateWinLossRatio(avgWin: string | undefined, avgLoss: string | undefined): string {
  if (!avgWin || !avgLoss) return '0.00';
  
  const winNum = parseNumericValue(avgWin);
  const lossNum = parseNumericValue(avgLoss);
  
  if (isNaN(winNum) || isNaN(lossNum) || lossNum === 0) return '0.00';
  return (winNum / lossNum).toFixed(2);
}

/**
 * Generate equity curve data for chart
 */
function generateEquityCurveData(trades: any[], initialBalance: number): { labels: string[], data: number[] } {
  const labels: string[] = [];
  const data: number[] = [];
  
  if (!trades || trades.length === 0) {
    return { labels: ['Start'], data: [initialBalance] };
  }
  
  // Filter trades to only include completed ones with profit 
  const validTrades = trades.filter(t => {
    // MT4/5 format with state
    if ((t.state === 'out' || t.direction === 'out') && t.profit !== undefined) return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  // Sort trades by date
  const sortedTrades = [...validTrades].sort((a, b) => {
    return new Date(a.openTime || a.timeFlag || a.time || 0).getTime() - 
           new Date(b.openTime || b.timeFlag || b.time || 0).getTime();
  });
  
  if (sortedTrades.length === 0) {
    return { labels: ['Start'], data: [initialBalance] };
  }
  
  let equity = initialBalance;
  
  // Add initial point
  const firstDate = new Date(sortedTrades[0]?.openTime || sortedTrades[0]?.timeFlag || sortedTrades[0]?.time || new Date());
  labels.push(formatDate(firstDate));
  data.push(equity);
  
  // Process trades
  for (const trade of sortedTrades) {
    if (trade.balance !== undefined) {
      equity = trade.balance;
    } else if (trade.profit !== undefined) {
      equity += trade.profit;
    } else {
      continue;
    }
    
    const tradeDate = new Date(trade.openTime || trade.timeFlag || trade.time || new Date());
    labels.push(formatDate(tradeDate));
    data.push(equity);
  }
  
  // Limit to a reasonable number of points for the chart
  if (labels.length > 50) {
    const step = Math.floor(labels.length / 50);
    return {
      labels: labels.filter((_, i) => i % step === 0 || i === labels.length - 1),
      data: data.filter((_, i) => i % step === 0 || i === data.length - 1)
    };
  }
  
  return { labels, data };
}

/**
 * Calculate monthly performance data for chart
 */
function calculateMonthlyPerformance(trades: any[]): { labels: string[], data: number[] } {
  const monthlyData: Record<string, number> = {};
  
  if (!trades || trades.length === 0) {
    return { labels: [], data: [] };
  }
  
  // Only use completed trades with profit values
  const validTrades = trades.filter(t => {
    // MT4/5 format with state
    if ((t.state === 'out' || t.direction === 'out') && t.profit !== undefined) return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  if (validTrades.length === 0) {
    return { labels: [], data: [] };
  }
  
  // Group profits by month
  for (const trade of validTrades) {
    const date = getTradeDate(trade);
    if (!date) continue;
    
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    
    monthlyData[monthKey] += trade.profit;
  }
  
  // Convert to arrays and sort by date
  const entries = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12); // Only show the last 12 months
  
  const labels = entries.map(([month]) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
  
  // Get actual profit values (no need to scale them)
  const data = entries.map(([_, profit]) => profit);
  
  return { labels, data };
}

/**
 * Calculate profit distribution data for chart
 */
function calculateProfitDistribution(trades: any[]): { labels: string[], data: number[] } {
  // Define profit ranges
  const ranges = [
    -1000, -500, -250, -100, -50, -20, -10, -5, 0, 5, 10, 20, 50, 100, 250, 500, 1000
  ];
  
  // Initialize bins
  const bins: number[] = Array(ranges.length).fill(0);
  
  if (!trades || trades.length === 0) {
    return { 
      labels: ranges.map(r => r.toString()), 
      data: bins 
    };
  }
  
  // Only use completed trades with profit values
  const validTrades = trades.filter(t => {
    // MT4/5 format with state
    if ((t.state === 'out' || t.direction === 'out') && t.profit !== undefined) return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  if (validTrades.length === 0) {
    return { 
      labels: ranges.map(r => r.toString()), 
      data: bins 
    };
  }
  
  // Populate bins
  for (const trade of validTrades) {
    const profit = trade.profit;
    
    // Find the appropriate bin
    let binIndex = 0;
    while (binIndex < ranges.length - 1 && profit > ranges[binIndex]) {
      binIndex++;
    }
    
    bins[binIndex]++;
  }
  
  // Create labels that show ranges
  const labels: string[] = [];
  for (let i = 0; i < ranges.length - 1; i++) {
    labels.push(`${ranges[i]} to ${ranges[i+1]}`);
  }
  
  // Combine data and return
  return { 
    labels: labels, 
    data: bins.slice(0, -1) // remove the last bin as it's not needed for the chart
  };
}

/**
 * Generate HTML for trade rows
 */
function generateTradeRows(trades: any[]): string {
  if (!trades || trades.length === 0) {
    return '<tr><td colspan="7">No trades available</td></tr>';
  }
  
  // Filter to only include completed trades with profit
  const validTrades = trades.filter(t => {
    // MT4/5 format with state
    if ((t.state === 'out' || t.direction === 'out') && t.profit !== undefined) return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  // Sort and limit to 50 trades
  const displayTrades = validTrades
    .sort((a, b) => new Date(b.openTime || b.timeFlag || b.time || 0).getTime() - 
                    new Date(a.openTime || a.timeFlag || a.time || 0).getTime())
    .slice(0, 50);
  
  if (displayTrades.length === 0) {
    return '<tr><td colspan="7">No completed trades available</td></tr>';
  }
  
  return displayTrades.map(trade => {
    const profit = trade.profit || 0;
    const profitClass = profit > 0 ? 'positive' : profit < 0 ? 'negative' : '';
    
    // Determine trade direction based on available data
    let tradeDirection = 'N/A';
    if (trade.side === 'long' || trade.type?.toLowerCase().includes('buy')) {
      tradeDirection = 'Buy';
    } else if (trade.side === 'short' || trade.type?.toLowerCase().includes('sell')) {
      tradeDirection = 'Sell';
    }
    
    return `
      <tr>
        <td>${formatDate(new Date(trade.openTime || trade.timeFlag || trade.time || new Date()))}</td>
        <td>${trade.symbol || 'N/A'}</td>
        <td>${trade.type || 'N/A'}</td>
        <td>${tradeDirection}</td>
        <td>${trade.volumeLots || trade.volume || '1'}</td>
        <td>${(trade.priceOpen || trade.price || 0).toFixed(2)}</td>
        <td class="${profitClass}">${profit.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Get a risk assessment based on metrics
 */
function getRiskAssessment(metrics: Record<string, string>): string {
  const profitFactor = parseNumericValue(metrics['Profit Factor']);
  const drawdown = parseNumericValue(metrics['Maximal Drawdown']?.split(' ')[1]);
  
  if (profitFactor >= 2 && drawdown < 10) {
    return 'Low Risk';
  } else if (profitFactor >= 1.5 || (profitFactor >= 1.2 && drawdown < 15)) {
    return 'Medium Risk';
  } else {
    return 'High Risk';
  }
}

/**
 * Calculate consecutive wins/losses from trade data
 */
function calculateConsecutiveStats(trades: any[]): { maxConsecutiveWins: number, maxConsecutiveLosses: number } {
  if (!trades || trades.length === 0) {
    return { maxConsecutiveWins: 0, maxConsecutiveLosses: 0 };
  }
  
  // Filter to only include completed trades with profit
  const validTrades = trades.filter(t => {
    // MT4/5 format with state
    if ((t.state === 'out' || t.direction === 'out') && t.profit !== undefined) return true;
    // TradingView format with profit values
    if (t.profit !== undefined && t.profit !== null) return true;
    return false;
  });
  
  if (validTrades.length === 0) {
    return { maxConsecutiveWins: 0, maxConsecutiveLosses: 0 };
  }
  
  // Sort trades chronologically to find actual streaks
  const sortedTrades = [...validTrades].sort((a, b) => {
    const dateA = getTradeDate(a);
    const dateB = getTradeDate(b);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
  
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  
  for (const trade of sortedTrades) {
    const profit = trade.profit || 0;
    
    if (profit > 0) {
      // Winning trade
      currentWinStreak++;
      currentLossStreak = 0;
      
      if (currentWinStreak > maxWinStreak) {
        maxWinStreak = currentWinStreak;
      }
    } else if (profit < 0) {
      // Losing trade
      currentLossStreak++;
      currentWinStreak = 0;
      
      if (currentLossStreak > maxLossStreak) {
        maxLossStreak = currentLossStreak;
      }
    }
    // If profit is exactly 0, we don't count it for streaks
  }
  
  return {
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak
  };
} 