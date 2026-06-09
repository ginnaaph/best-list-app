import { mockEntries } from './data/mockEntries';
import { calculateOverallScore } from './lib/entry-score';

// Test 1: Verify structure
const firstEntry = mockEntries[0];
console.log('✓ First entry loaded:', firstEntry.placeName);

const overallScore = calculateOverallScore(firstEntry);
console.log(`✓ ${firstEntry.placeName} overall score: ${overallScore.toFixed(2)}`);
console.log(`  Taste: ${firstEntry.taste}, Value: ${firstEntry.value}, Portion: ${firstEntry.portion}, Vibe: ${firstEntry.vibe}`);

// Test 3: Verify all entries have required fields
const allValid = mockEntries.every(entry =>
  entry.id &&
  entry.categoryId === 'breakfast-burrito' &&
  entry.placeName &&
  entry.dishName &&
  entry.city &&
  typeof entry.taste === 'number' &&
  typeof entry.value === 'number' &&
  typeof entry.portion === 'number' &&
  typeof entry.vibe === 'number' &&
  typeof entry.createdAt === 'string'
);

console.log(`✓ All ${mockEntries.length} entries valid: ${allValid}`);

// Test 4: Show score distribution
console.log('\n📊 Score distribution:');
mockEntries.forEach(entry => {
  const score = calculateOverallScore(entry);
  console.log(`  ${entry.placeName}: ${score.toFixed(2)}`);
});
