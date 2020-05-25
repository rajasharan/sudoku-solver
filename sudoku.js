const SIZE = 9;
function verify(items) {
  for (let i=0; i<SIZE; i++) {
    const test = [];
    for (let j=0; j<SIZE; j++) {
      const item = items[i][j];
      if (item !== 0) {
        const count = test[item];
        if (count) return {conflict: true, i: j+1, j: i+1};
        else {
          test[item] = 1;
        }
      }
    }
  }

  for (let j=0; j<SIZE; j++){
    const test = [];
    for (let i=0; i<SIZE; i++) {
      const item = items[i][j];
      if (item !== 0) {
        const count = test[item];
        if (count) return {conflict: true, i: j+1, j: i+1};
        else {
          test[item] = 1;
        }
      }
    }
  }

  // verify each 3x3 grid
  for (let k=0; k<SIZE; k = k+(SIZE/3)) {
    for (let l=0; l<SIZE; l = l+(SIZE/3)) {
      const test = [];
      for (let i=k; i<k+SIZE/3; i++) {
        for (let j=l; j<l+SIZE/3; j++) {
          const item = items[i][j];
          if (item !== 0) {
            const count = test[item];
            if (count) return {conflict: true, i: j+1, j: i+1};
            else {
              test[item] = 1;
            }
          }
        }
      }
    }
  }

  return {conflict: false};
}

function noConflicts(i, j, num, items) {
  for (let k=0; k<SIZE; k++) {
    if (items[i][k] === num) return false
  }

  for (let k=0; k<SIZE; k++) {
    if (items[k][j] === num) return false;
  }

  const iStart = i - (i%3);
  const jStart = j - (j%3);

  for (let k=iStart; k < iStart + 3; k++) {
    for (let l=jStart; l < jStart + 3; l++) {
      if (items[k][l] === num) return false;
    }
  }

  return true;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function update(i, j, num, items, context) {
  items[i][j] = num;
  context.steps += 1;
  context.postMessage({cmd: 'inprogress', i, j, num, steps: context.steps});
  await timeout(context.speed);
}

/*
 * most constrained square selection
 * (select the square with least possible choices to pick from)
 */
function findNext(items) {
  let min = SIZE + 1;
  let result = {};
  let done = true;
  for (let i=0; i<SIZE; i++) {
    for (let j=0; j<SIZE; j++) {
      if (items[i][j] === 0) {
        done = false;
        let nums = [];
        for (let num=1; num<=SIZE; num++) {
          if (noConflicts(i, j, num, items)) {
            nums.push(num);
          }
        }
        if (nums.length < min) {
          min = nums.length;
          result.i = i;
          result.j = j;
          result.nums = nums;
        }
      }
    }
  }

  result.done = done;
  return result;
}

async function solve(items, context) {
  const {i, j, nums, done} = findNext(items);
  if (done) return true;
  if (nums.length === 0) return false; // with look ahead; if possible choices is empty then reject

  for (let n=0; n<nums.length; n++) {
    await update(i,j,nums[n],items,context);
    if (await solve(items, context)) return true;
    await update(i,j,0,items,context);
  }
  return false;
}

self.addEventListener('message', async function (e) {
  const { cmd, items, speed } = e.data;
  switch (cmd) {
    case 'solve': {
      self.speed = speed;
      self.steps = 0;
      const result = await solve(items, self);
      self.postMessage({cmd: 'done', result, steps: self.steps});
      break;
    }
    case 'speed': {
      self.speed = speed;
      break;
    }
    case 'verify': {
      const result = await verify(items);
      console.log(result);
      self.postMessage({cmd: 'verified', result});
      break;
    }
  };
}, false);
