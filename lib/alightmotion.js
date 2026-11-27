import axios from 'axios';

const BASE_URL = 'https://am.kyzzz.xyz';

export async function sendAmLink(email) {
  const { data } = await axios.post(
    `${BASE_URL}/api/send-link`,
    { email },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    }
  );
  return data;
}

export async function verifyAmAccount(email, link) {
  const { data } = await axios.post(
    `${BASE_URL}/api/verify`,
    { email, link },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000
    }
  );
  return data;
}
