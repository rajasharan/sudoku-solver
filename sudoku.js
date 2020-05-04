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
  context.postMessage({cmd: 'inprogress', i, j, num});
  await timeout(context.speed);
}

function findNext(items) {
  for (let i=0; i<SIZE; i++) {
    for (let j=0; j<SIZE; j++) {
      if (items[i][j] === 0) return {i, j};
    }
  }
  
  return false;
}

async function solve(items, context) {
  const next = findNext(items);
  if (!next) return true;

  const {i, j} = next;

  for (let num=1; num<=9; num++) {
    if (noConflicts(i,j,num,items)) {
      await update(i,j,num,items,context);
      if (await solve(items, context)) return true;
      await update(i,j,0,items,context);
    }
  }
  return false;
}

self.addEventListener('message', async function (e) {
  const { cmd, items, speed } = e.data;
  switch (cmd) {
    case 'solve': {
      const result = await solve(items, self);
      self.speed = speed;
      self.postMessage({cmd: 'done', result});
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
