const SIZE = 9;
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
    case 'solve':
      const result = await solve(items, self);
      self.speed = speed;
      self.postMessage({cmd: 'done', i:-1, j:-1, num:-1, result});
      break;
    case 'speed':
      self.speed = speed;
      break;
  };
}, false);
