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
    const comparison = compare(left[leftIndex], right[rightIndex]);
    if (comparison <= 0) {
      array.push(left[leftIndex]);
      leftIndex++;
    } else {
      array.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return array.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
