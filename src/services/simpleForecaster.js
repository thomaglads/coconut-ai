
/**
 * SimpleForecaster (The "Lite" Scientist)
 * Pure JavaScript implementation of Linear Regression.
 * Zero dependencies, Instant execution.
 */
export const simpleForecaster = {
    /**
     * Calculate linear regression and forecast
     * @param {Array} data - Array of objects
     * @param {string} dateCol - Key for date
     * @param {string} valCol - Key for numeric value
     * @param {number} periods - Number of future periods
     */
    createForecast: (data, dateCol, valCol, periods = 6) => {
        try {
            // 1. Prepare Data (X = time index, Y = value)
            const cleanData = data
                .map((row, i) => ({ x: i, y: parseFloat(row[valCol]), original: row }))
                .filter(p => !isNaN(p.y));

            if (cleanData.length < 2) throw new Error("Not enough data points");

            // 2. Calculate Linear Regression (Least Squares)
            const n = cleanData.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

            cleanData.forEach(p => {
                sumX += p.x;
                sumY += p.y;
                sumXY += p.x * p.y;
                sumXX += p.x * p.x;
            });

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // 3. Calculate R-squared (Confidence)
            const yMean = sumY / n;
            let ssRes = 0, ssTot = 0;
            cleanData.forEach(p => {
                const yPred = slope * p.x + intercept;
                ssRes += (p.y - yPred) ** 2;
                ssTot += (p.y - yMean) ** 2;
            });
            const rSquared = 1 - (ssRes / ssTot);

            // 4. Generate forecast descriptions
            const trend = slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable";

            return {
                success: true,
                result: { trend, slope, intercept },
                confidence: rSquared,
                explanation: `Analysis shows a **${trend}** trend with a confidence of ${(rSquared * 100).toFixed(1)}%.`,
                forecastPoints: Array.from({ length: periods }, (_, i) => ({
                    [dateCol]: `Forecast ${i + 1}`,
                    [valCol]: slope * (n + i) + intercept,
                    isForecast: true
                }))
            };

        } catch (err) {
            return { success: false, error: err.message };
        }
    }
};
