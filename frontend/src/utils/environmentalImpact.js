/**
 * Environmental Impact Calculator
 * Based on EPA and environmental research data
 * Converts waste management metrics into tangible environmental benefits
 */

/**
 * Calculate environmental impact from total waste collected (kg)
 * @param {number} totalWasteKg - Total waste in kilograms
 * @param {Array} byType - Array of {type, value} showing waste breakdown
 * @returns {Object} Environmental metrics
 */
export const calculateEnvironmentalImpact = (totalWasteKg, byType = []) => {
    // Get breakdown values
    const recyclableKg = byType.find(t => t.type === 'Recyclable')?.value || 0;
    const wetKg = byType.find(t => t.type === 'Wet')?.value || 0;
    const ewasteKg = byType.find(t => t.type === 'E-waste')?.value || 0;

    // TREES PROTECTED
    // Average: 17 trees saved per ton of paper recycled (EPA)
    // Assume 30% of dry waste is paper
    const dryWaste = byType.find(t => t.type === 'Dry')?.value || 0;
    const paperKg = dryWaste * 0.3;
    const treesSaved = Math.round((paperKg / 1000) * 17);

    // CARBON OFFSET
    // Recycling: ~0.7 kg CO2 saved per kg of recyclables (varies by material)
    // Composting wet waste: ~0.3 kg CO2 saved per kg
    // E-waste proper disposal: ~2.0 kg CO2 saved per kg
    const carbonFromRecyclables = recyclableKg * 0.7;
    const carbonFromComposting = wetKg * 0.3;
    const carbonFromEwaste = ewasteKg * 2.0;
    const totalCarbonKg = carbonFromRecyclables + carbonFromComposting + carbonFromEwaste;

    // ENERGY CONSERVED
    // Recycling saves ~4 kWh per kg of mixed recyclables (aluminum, plastic, glass avg)
    // Composting saves ~0.5 kWh per kg (vs landfill methane)
    const energyFromRecyclables = recyclableKg * 4.0;
    const energyFromComposting = wetKg * 0.5;
    const totalEnergyKwh = energyFromRecyclables + energyFromComposting;

    // WATER PURIFIED/SAVED
    // Proper waste management prevents ~15L of water pollution per kg (groundwater protection)
    // Composting saves ~10L per kg in irrigation water (nutrient-rich compost)
    const waterFromPrevention = totalWasteKg * 15;
    const waterFromComposting = wetKg * 10;
    const totalWaterLiters = waterFromPrevention + waterFromComposting;

    return {
        trees: Math.max(treesSaved, 0),
        carbonKg: Math.max(totalCarbonKg, 0),
        energyKwh: Math.max(totalEnergyKwh, 0),
        waterLiters: Math.max(totalWaterLiters, 0),
        // Bonus metrics for display
        equivalents: {
            // 1 tree absorbs ~21kg CO2/year
            treesEquivalent: Math.round(totalCarbonKg / 21),
            // Average home uses ~30 kWh/day
            homeDaysEquivalent: (totalEnergyKwh / 30).toFixed(1),
            // Average person uses ~150L/day
            personDaysEquivalent: (totalWaterLiters / 150).toFixed(1)
        }
    };
};

/**
 * Calculate eco level/rank based on total waste logged
 * @param {number} totalWasteKg 
 * @returns {string} Eco level (I to X)
 */
export const calculateEcoLevel = (totalWasteKg) => {
    if (totalWasteKg < 5) return 'I';
    if (totalWasteKg < 15) return 'II';
    if (totalWasteKg < 30) return 'III';
    if (totalWasteKg < 50) return 'IV';
    if (totalWasteKg < 75) return 'V';
    if (totalWasteKg < 100) return 'VI';
    if (totalWasteKg < 150) return 'VII';
    if (totalWasteKg < 250) return 'VIII';
    if (totalWasteKg < 500) return 'IX';
    return 'X';
};

/**
 * Calculate impact points (gamification score)
 * @param {number} totalWasteKg 
 * @param {number} totalLogs 
 * @returns {number} Points
 */
export const calculateImpactPoints = (totalWasteKg, totalLogs) => {
    // Base: 10 points per kg
    const basePoints = Math.round(totalWasteKg * 10);
    // Bonus: 50 points per log entry (encourages consistent logging)
    const logBonus = totalLogs * 50;
    return basePoints + logBonus;
};

/**
 * Format large numbers for display
 */
export const formatMetric = (value, unit = '') => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k${unit}`;
    }
    return `${Math.round(value)}${unit}`;
};
