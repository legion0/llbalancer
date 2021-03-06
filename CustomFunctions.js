/**
* Custom function to calculate the average power level of gear while pulling up all values below average to the average recursively.
* @param {Range} range the range of values to calculate the average over.
* @return {number} the resulting average after all items below average are pulled up to average.
*/
function RecursiveAverage(range) {
  let values = range.flat();
  
  let average = 0;
  for (let i = 0; i < 100; i++) {
    let avgFloor = Math.floor(average);
    average = values.reduce((sum,value) => sum + Math.max(value, avgFloor), 0) / values.length;
    if (Math.floor(average) == avgFloor) {
      break;
    }
  }
  return average;
}

function BalanceMinItemCount(range, average, required) {
  let values = range.flat();
  values = values.sort().reverse();
  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    let value = values[i];
    if (value < average) {
      sum += average - value;
      count++;
      if (sum >= required) {
        break;
      }
    }
  }
  return count;
}

