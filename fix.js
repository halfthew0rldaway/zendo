const fs = require('fs');

const files = [
  'app/projects/[id]/board/KanbanBoardClient.tsx',
  'app/projects/[id]/board/AddTaskModal.tsx',
  'app/projects/[id]/board/InviteModal.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content
      .replace(/bg-white/g, 'bg-surface-container-lowest')
      .replace(/bg-\[#f8f9fa\]/g, 'bg-surface')
      .replace(/bg-\[#eaeff1\]/g, 'bg-surface-container-high')
      .replace(/text-\[#586064\]/g, 'text-on-surface-variant')
      .replace(/border-\[#eaeff1\]/g, 'border-outline-variant/30')
      .replace(/text-\[#2b3437\]/g, 'text-on-surface')
      .replace(/text-\[#abb3b7\]/g, 'text-outline')
      .replace(/border-\[#abb3b7\]/g, 'border-outline')
      .replace(/bg-\[#f1f4f6\]/g, 'bg-surface-container')
      .replace(/bg-\[#e3e9ec\]/g, 'bg-surface-container-highest');
    fs.writeFileSync(file, content);
  }
}
