const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function f() {
  const users = await p.user.findMany({ where: { role: { in: ['faculty', 'hod', 'admin'] } } });
  console.log('Users count:', users.length);
  for (const u of users) {
    console.log(u.role, '|', u.email, '|', u.name, '| mustChange:', u.mustChangePassword);
  }
  const fac = await p.faculty.findMany();
  console.log('Faculty count:', fac.length);
  for (const item of fac) {
    console.log(item.facultyId, '| advisorBatch:', item.advisorBatch, '| yr:', item.advisorYear, '| sec:', item.advisorSec);
  }
  const hods = await p.hOD.findMany();
  console.log('HODs count:', hods.length);
  for (const h of hods) {
    console.log(h.facultyId, '| dept:', h.department);
  }
}
f().then(() => p.$disconnect());
