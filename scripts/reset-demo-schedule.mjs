/**
 * Reset After Break Supabase demo data:
 * - Empty schedules for B, C, MA, MB, MC
 * - Social demo sample for evening group A only
 * - Admins: Abdullah Yasir (superadmin) only
 * - Empty resources sections
 */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = 'https://dnpeszhmwtyckqiswztr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGVzemhtd3R5Y2txaXN3enRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDMzMzcsImV4cCI6MjA4ODExOTMzN30.Fl31zGYnh3JyFTkt4e9eZL3TDbslnk1qMhYoLAt3I74';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DAY_KEYS = [
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
];
const GROUPS = ['A', 'B', 'C', 'MA', 'MB', 'MC'];
const ADDED_BY = 'عبدالله ياسر';

const LECTURERS = ['د. سامي الرشيد', 'د. نورا القحطاني', 'د. ياسين المالكي'];

function emptySchedule() {
  return Object.fromEntries(DAY_KEYS.map((d) => [d, { events: [] }]));
}

function ev({ title, titleAr, type, time, room, instructor, isImportant = false, notes = '' }) {
  return {
    id: randomUUID(),
    title,
    titleAr,
    type,
    time,
    room,
    instructor,
    isImportant,
    isRecurring: true,
    date: null,
    notes,
    addedByName: ADDED_BY,
    createdAt: new Date().toISOString(),
  };
}

/** Demo week for evening / group A — 2:30 PM–6:30 PM, 1 h slots, all event types */
function buildGroupADemo() {
  const [sami, nora, yasin] = LECTURERS;
  const sched = emptySchedule();

  sched.saturday.events = [
    ev({ title: 'Computer Networks', titleAr: 'شبكات الحاسوب', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 102', instructor: sami }),
    ev({ title: 'Networks Lab', titleAr: 'مختبر شبكات', type: 'lab', time: '3:30 PM - 4:30 PM', room: 'مختبر 1', instructor: nora }),
    ev({ title: 'Operating Systems', titleAr: 'نظم التشغيل', type: 'lecture', time: '4:30 PM - 5:30 PM', room: 'قاعة 104', instructor: yasin }),
    ev({ title: 'OS Tutorial', titleAr: 'تطبيقات نظم التشغيل', type: 'other', time: '5:30 PM - 6:30 PM', room: 'قاعة 104', instructor: yasin }),
  ];

  sched.sunday.events = [
    ev({ title: 'Information Security', titleAr: 'أمن المعلومات', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 201', instructor: sami }),
    ev({ title: 'Security Quiz', titleAr: 'اختبار أمن المعلومات', type: 'quiz', time: '3:30 PM - 4:30 PM', room: 'قاعة 201', instructor: sami }),
    ev({ title: 'Security Lab', titleAr: 'مختبر أمن المعلومات', type: 'lab', time: '4:30 PM - 5:30 PM', room: 'مختبر 2', instructor: nora }),
    ev({ title: 'Weekly Report', titleAr: 'تقرير أسبوعي', type: 'report', time: '5:30 PM - 6:30 PM', room: '—', instructor: sami, notes: 'تسليم التقرير عبر المنصة' }),
  ];

  sched.monday.events = [
    ev({ title: 'Database Systems', titleAr: 'قواعد البيانات', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 103', instructor: nora }),
    ev({ title: 'Database Lab', titleAr: 'مختبر قواعد البيانات', type: 'lab', time: '3:30 PM - 4:30 PM', room: 'مختبر 3', instructor: nora }),
    ev({ title: 'SQL Practice', titleAr: 'تطبيقات SQL', type: 'lecture', time: '4:30 PM - 5:30 PM', room: 'مختبر 3', instructor: yasin }),
    ev({ title: 'Database H.W', titleAr: 'واجب قواعد البيانات', type: 'assignment', time: '5:30 PM - 6:30 PM', room: '—', instructor: nora, notes: 'الفصل الثالث — استعلامات JOIN' }),
  ];

  sched.tuesday.events = [
    ev({ title: 'Software Engineering', titleAr: 'هندسة البرمجيات', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 105', instructor: yasin }),
    ev({ title: 'UI Design', titleAr: 'تصميم واجهات المستخدم', type: 'lecture', time: '3:30 PM - 4:30 PM', room: 'قاعة 105', instructor: sami }),
    ev({ title: 'Design Lab', titleAr: 'مختبر التصميم', type: 'lab', time: '4:30 PM - 5:30 PM', room: 'مختبر 4', instructor: sami }),
    ev({ title: 'Project Report', titleAr: 'تقرير المشروع', type: 'report', time: '5:30 PM - 6:30 PM', room: '—', instructor: yasin }),
  ];

  sched.wednesday.events = [
    ev({ title: 'Algorithms', titleAr: 'تحليل الخوارزميات', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 106', instructor: yasin }),
    ev({ title: 'Algorithms Lab', titleAr: 'مختبر الخوارزميات', type: 'lab', time: '3:30 PM - 4:30 PM', room: 'مختبر 1', instructor: yasin }),
    ev({ title: 'Midterm Exam', titleAr: 'امتحان منتصف الفصل', type: 'exam', time: '4:30 PM - 5:30 PM', room: 'قاعة 106', instructor: nora, isImportant: true }),
    ev({ title: 'AI Introduction', titleAr: 'مقدمة في الذكاء الاصطناعي', type: 'lecture', time: '5:30 PM - 6:30 PM', room: 'قاعة 106', instructor: nora }),
  ];

  sched.thursday.events = [
    ev({ title: 'Web Development', titleAr: 'تطوير الويب', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 108', instructor: sami }),
    ev({ title: 'Web Lab', titleAr: 'مختبر الويب', type: 'lab', time: '3:30 PM - 4:30 PM', room: 'مختبر 2', instructor: sami }),
    ev({ title: 'Quick Quiz', titleAr: 'اختبار قصير', type: 'quiz', time: '4:30 PM - 5:30 PM', room: 'قاعة 108', instructor: nora }),
    ev({ title: 'Networks H.W', titleAr: 'واجب شبكات', type: 'assignment', time: '5:30 PM - 6:30 PM', room: '—', instructor: sami, notes: 'تحليل بروتوكول TCP/IP' }),
  ];

  sched.friday.events = [
    ev({ title: 'Cloud Computing', titleAr: 'الحوسبة السحابية', type: 'lecture', time: '2:30 PM - 3:30 PM', room: 'قاعة 110', instructor: yasin }),
    ev({ title: 'Seminar', titleAr: 'ندوة تطبيقية', type: 'other', time: '3:30 PM - 4:30 PM', room: 'قاعة 110', instructor: nora }),
    ev({ title: 'Final Report Draft', titleAr: 'مسودة التقرير النهائي', type: 'report', time: '4:30 PM - 5:30 PM', room: '—', instructor: yasin }),
    ev({ title: 'Review Session', titleAr: 'مراجعة عامة', type: 'other', time: '5:30 PM - 6:30 PM', room: 'قاعة 110', instructor: sami }),
  ];

  return sched;
}

const ABDULLAH_ADMIN = {
  id: 'admin1',
  username: 'vancipher',
  password: 'Abdallah=7920s',
  displayName: 'عبدالله ياسر',
  role: 'superadmin',
  allowedGroups: ['A', 'B', 'C', 'MA', 'MB', 'MC'],
};

async function main() {
  const demoA = buildGroupADemo();
  const rows = GROUPS.map((id) => ({
    id,
    data: id === 'A' ? demoA : emptySchedule(),
  }));

  console.log('Upserting schedules…');
  for (const row of rows) {
    const { error } = await supabase.from('schedule').upsert(row);
    if (error) throw new Error(`schedule ${row.id}: ${error.message}`);
    const count = Object.values(row.data).reduce((n, d) => n + (d.events?.length ?? 0), 0);
    console.log(`  ${row.id}: ${count} events`);
  }

  console.log('Setting admins (Abdullah Yasir only)…');
  const { error: adminErr } = await supabase
    .from('admins')
    .upsert({ id: 'accounts', data: [ABDULLAH_ADMIN] });
  if (adminErr) throw new Error(`admins: ${adminErr.message}`);

  console.log('Clearing resources…');
  for (const section of ['evening', 'morning']) {
    const { error } = await supabase
      .from('resources')
      .upsert({ id: section, data: { subjects: [] } });
    if (error) console.warn(`  resources ${section}: ${error.message}`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
