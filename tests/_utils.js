/**
 * Adapted from code generated by AI
 * Cf. [prompt](./ai prompt and answer - how to test uniform distribution)
 * Chi-Square critical values for different significance levels
    const chiSquareCriticalValues = {
        0.1: 14.684,
        0.05: 16.919,
        0.01: 21.666,
        0.001: 27.877
    };
 * @param {} f 
 * @param {*} p 
 * @returns 
 */
export function check_generator(
  sampleSize,
  observedFrequencies,
  chiSquareCriticalValue
) {
  // Create a histogram of the generated numbers
  const numBins = 4;
  // const observedFrequencies = new Array(numBins).fill(0);
  // randomNumbers.forEach(num => {
  //     const binIndex = Math.floor(num * numBins);
  //     observedFrequencies[binIndex]++;
  // });

  // Calculate expected frequencies for a uniform distribution
  const expectedFrequencies = new Array(numBins).fill(sampleSize / numBins);

  // Calculate Chi-Square Statistic
  let chiSquareStat = 0;
  for (let i = 0; i < numBins; i++) {
    chiSquareStat +=
      Math.pow(observedFrequencies[i] - expectedFrequencies[i], 2) /
      expectedFrequencies[i];
  }

  // Calculate degrees of freedom
  const degreesOfFreedom = numBins - 1;
  // Determine if the Chi-Square statistic exceeds the critical value for the given p-value
  return chiSquareStat < chiSquareCriticalValue ? 1 : 0;
}

export function are_array_deep_equal(arr1, arr2){
  return arr1.join(",") === arr2.join(",");
}