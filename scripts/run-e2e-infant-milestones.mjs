const args = process.argv.slice(2);
const baseUrlArg = args.find((arg) => arg.startsWith('--baseUrl='));
const ageGroupArg = args.find((arg) => arg.startsWith('--ageGroup='));
const baseUrl = process.env.E2E_BASE_URL || baseUrlArg?.split('=')[1];
const ageGroup = process.env.E2E_AGE_GROUP || ageGroupArg?.split('=')[1] || '0-2';

if (!baseUrl) {
  console.error(
    'Missing E2E_BASE_URL. Set E2E_BASE_URL or pass --baseUrl=<url> to run the infant milestone E2E test.'
  );
  process.exit(1);
}

const endpoint = new URL('/api/test/e2e-infant-milestones', baseUrl);
endpoint.searchParams.set('ageGroup', ageGroup);

const response = await fetch(endpoint, {
  headers: {
    Accept: 'application/json',
  },
});

const payload = await response.json();

if (!response.ok || payload.status !== 'SUCCESS') {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(payload, null, 2));
