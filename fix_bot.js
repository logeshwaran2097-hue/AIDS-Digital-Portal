const fs = require('fs');
const file = 'd:/app/src/app/admin/activity-logs/components/AdminActivityLogsView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Bot,')) {
  content = content.replace(
    /AlertCircle,(\s*)\} from 'lucide-react'/,
    "AlertCircle,\n    Bot,} from 'lucide-react'"
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed Bot import');
} else {
  console.log('Bot already imported');
}
