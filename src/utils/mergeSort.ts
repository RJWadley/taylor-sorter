export default function mergeSort<T>(
  array: T[],
  compare: (a: T, b: T) => number
): T[] {
  if (array.length <= 1) {
    return array;
  }

  const middle = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, middle), compare);
  const right = mergeSort(array.slice(middle), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const array: T[] = [];

  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftItem = left[leftIndex];
    const rightItem = right[rightIndex];
    if (leftItem && rightItem) {
      const comparison = compare(leftItem, rightItem);
      if (comparison <= 0) {
        array.push(leftItem);
        leftIndex++;
      } else {
        array.push(rightItem);
        rightIndex++;
      }
    }
  }

  return array.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
