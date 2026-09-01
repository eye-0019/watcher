const { initDb } = require('../utils/db');
const {
  getRisk,
  addRisk,
  removeRisk,
  setRisk,
  resetRisk,
  getRiskLevel
} = require('./riskScore');

async function test() {
  await initDb();

  const testUserId = 'WATCHER_TEST_USER';

  console.log('Testing Watcher security risk system...');

  await resetRisk(testUserId);

  console.log('Initial risk:', await getRisk(testUserId));

  const afterAdd = await addRisk(testUserId, 25);
  console.log('After adding 25:', afterAdd);
  console.log('Risk level:', getRiskLevel(afterAdd));

  const afterMore = await addRisk(testUserId, 40);
  console.log('After adding 40:', afterMore);
  console.log('Risk level:', getRiskLevel(afterMore));

  const afterRemove = await removeRisk(testUserId, 20);
  console.log('After removing 20:', afterRemove);
  console.log('Risk level:', getRiskLevel(afterRemove));

  await setRisk(testUserId, 90);

  console.log('After setting to 90:', await getRisk(testUserId));
  console.log('Risk level:', getRiskLevel(await getRisk(testUserId)));

  await resetRisk(testUserId);

  console.log('After reset:', await getRisk(testUserId));

  console.log('✅ Security risk system test complete.');

  process.exit(0);
}

test().catch((error) => {
  console.error('❌ Security risk test failed:', error);
  process.exit(1);
});
