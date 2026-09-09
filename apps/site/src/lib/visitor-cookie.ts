export const VISITOR_COOKIE_NAME = 'dylan_visitor';
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(new Uint8Array(signed));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function readVisitorCookie(
  cookie: string | null | undefined,
  secret: string,
) {
  if (!cookie) return null;
  const [number, lastVisit, suppliedSignature] = cookie.split('.');
  if (!number || !lastVisit || !suppliedSignature) return null;

  const expectedSignature = await signature(`${number}.${lastVisit}`, secret);
  if (!constantTimeEqual(expectedSignature, suppliedSignature)) return null;

  const visitorNumber = Number(number);
  const lastVisitAt = Number(lastVisit);
  if (
    !Number.isSafeInteger(visitorNumber) ||
    !Number.isSafeInteger(lastVisitAt)
  ) {
    return null;
  }
  return { visitorNumber, lastVisitAt };
}

export async function createVisitorCookie(
  visitorNumber: number,
  visitedAt: number,
  secret: string,
) {
  const payload = `${visitorNumber}.${visitedAt}`;
  return `${payload}.${await signature(payload, secret)}`;
}
