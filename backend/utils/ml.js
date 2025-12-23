const ss = require('simple-statistics');

// Predict next day's waste based on history
const predictNextDay = (historicalData) => {
    // historicalData = [{ day_index: 0, qty: 10 }, { day_index: 1, qty: 12 }, ...]
    if (!historicalData || historicalData.length < 2) {
        return { prediction: 0, confidence: 'low', reason: 'Insufficient data' };
    }

    const dataPoints = historicalData.map(d => [d.day_index, d.qty]);

    // Linear Regression
    const line = ss.linearRegression(dataPoints);
    const nextDayIndex = historicalData.length; // Predict for tomorrow relative to start
    const prediction = ss.linearRegressionLine(line)(nextDayIndex);

    // Calculate R-squared for confidence
    const rSquared = ss.rSquared(dataPoints, ss.linearRegressionLine(line));
    const confidence = rSquared > 0.6 ? 'high' : (rSquared > 0.3 ? 'medium' : 'low');

    return {
        prediction: Math.max(0, parseFloat(prediction.toFixed(2))), // No negative waste
        confidence,
        trend: line.m > 0 ? 'increasing' : 'decreasing',
        growth_rate: (line.m).toFixed(2)
    };
};

const analyzeRisk = (currentLoad, capacity = 100) => {
    const riskScore = (currentLoad / capacity) * 100;
    let level = 'low';
    if (riskScore > 80) level = 'critical';
    else if (riskScore > 50) level = 'high';
    else if (riskScore > 30) level = 'medium';

    return {
        score: riskScore.toFixed(1),
        level
    };
};

module.exports = { predictNextDay, analyzeRisk };
