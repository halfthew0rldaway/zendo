const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes('px-10 py-10')) {
    content = content.replace(/px-10 py-10/g, 'px-5 py-6 md:px-10 md:py-10');
    changed = true;
  }
  if (content.includes('px-10 py-8')) {
    content = content.replace(/px-10 py-8/g, 'px-5 py-6 md:px-10 md:py-8');
    changed = true;
  }
  if (content.includes('px-10 py-6')) {
    content = content.replace(/px-10 py-6/g, 'px-5 py-4 md:px-10 md:py-6');
    changed = true;
  }
  if (content.includes('bottom-10 right-10')) {
    content = content.replace(/bottom-10 right-10/g, 'bottom-6 right-6 md:bottom-10 md:right-10');
    changed = true;
  }
  // Let's also handle KanbanBoardClient specifically for header heights and overflow issues on mobile
  if (f.includes('KanbanBoardClient.tsx') && content.includes('h-[calc(100vh-170px)]')) {
      content = content.replace(/h-\[calc\(100vh-170px\)\]/g, 'h-[calc(100vh-140px)] md:h-[calc(100vh-170px)]');
      changed = true;
  }
  
  if (content.includes('min-w-[320px] max-w-[320px]')) {
      content = content.replace(/min-w-\[320px\] max-w-\[320px\]/g, 'min-w-[280px] max-w-[280px] md:min-w-[320px] md:max-w-[320px]');
      changed = true;
  }

  if (content.includes('grid-cols-4')) {
    content = content.replace(/grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
