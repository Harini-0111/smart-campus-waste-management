const ss = require('simple-statistics');

// Predict next day's waste based on history
const predictNextDay = (historicalData) => {
    if (!historicalData || historicalData.length < 2) {
        return { prediction: 0, confidence: 'low', reason: 'Insufficient data' };
    }

    const dataPoints = historicalData.map(d => [d.day_index, d.qty]);
    const line = ss.linearRegression(dataPoints);
    const nextDayIndex = historicalData.length;
    const prediction = ss.linearRegressionLine(line)(nextDayIndex);

    const rSquared = ss.rSquared(dataPoints, ss.linearRegressionLine(line));
    const confidence = rSquared > 0.6 ? 'high' : (rSquared > 0.3 ? 'medium' : 'low');

    return {
        prediction: Math.max(0, parseFloat(prediction.toFixed(2))),
        confidence,
        trend: line.m > 0 ? 'increasing' : 'decreasing',
        growth_rate: (line.m).toFixed(2)
    };
};

// Identify high-risk "Hotspots" based on frequency and severity
const detectHotspots = (logs) => {
    // logs = [{ location_id, severity, quantity_kg }, ...]
    const locationStats = {};

    logs.forEach(log => {
        if (!locationStats[log.location_id]) {
            locationStats[log.location_id] = { count: 0, weight: 0, score: 0 };
        }
        locationStats[log.location_id].count += 1;
        locationStats[log.location_id].weight += parseFloat(log.quantity_kg);

        // Scoring: Critical = 3, High = 2, Normal = 1
        const severityScore = log.severity === 'Critical' ? 3 : (log.severity === 'High' ? 2 : 1);
        locationStats[log.location_id].score += severityScore;
    });

    return Object.entries(locationStats).map(([loc, data]) => ({
        location_id: loc,
        event_frequency: data.count,
        total_mass: data.weight.toFixed(2),
        heat_index: (data.score * (data.weight / data.count)).toFixed(2)
    })).sort((a, b) => b.heat_index - a.heat_index);
};

// Calculate staff performance metrics
const calculateEfficiency = (tasks) => {
    // tasks = [{ staff_id, response_time_hrs, status }, ...]
    const staffMetrics = {};

    tasks.forEach(t => {
        if (!staffMetrics[t.staff_id]) {
            staffMetrics[t.staff_id] = { completed: 0, total: 0, total_time: 0 };
        }
        staffMetrics[t.staff_id].total += 1;
        if (t.status === 'Completed' || t.status === 'Verified') {
            staffMetrics[t.staff_id].completed += 1;
            if (t.response_time_hrs) staffMetrics[t.staff_id].total_time += t.response_time_hrs;
        }
    });

    return Object.entries(staffMetrics).map(([id, data]) => ({
        staff_id: id,
        completion_rate: ((data.completed / data.total) * 100).toFixed(1),
        avg_response_time: data.completed > 0 ? (data.total_time / data.completed).toFixed(1) : 0
    }));
};

module.exports = { predictNextDay, detectHotspots, calculateEfficiency };

