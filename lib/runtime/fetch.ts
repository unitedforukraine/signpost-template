import { StatusCodes } from 'http-status-codes';

function sleepMs(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function getMillisToSleep(retryHeader: string, now?: Date): number {
  let millisToSleep = Math.round(parseFloat(retryHeader) * 1000);
  if (isNaN(millisToSleep)) {
    now = now ?? new Date();
    const retryDate = new Date(retryHeader);
    millisToSleep = Math.max(0, retryDate.getTime() - now.getTime());
  }
  return millisToSleep;
}

/** Calls fetch and retries on TOO_MANY_REQUESTS.
 *
 * This function calls on fetch and does up to 3 retries if it returns TOO_MANY_REQUESTS.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const MAX_RETRIES = 3;
  let response = new Response();
  for (let i = 0; i < MAX_RETRIES; ++i) {
    response = await fetch(input, init);
    if (response.status !== StatusCodes.TOO_MANY_REQUESTS) return response;

    const retryAfter = response.headers.get('retry-after');
    // Just retry if the retry-after header is missing.
    if (!retryAfter) continue;
    const millisToSleep = getMillisToSleep(retryAfter);
    await sleepMs(millisToSleep);
  }
  return response;
}

async function delay(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function directusWithRetry<T>(
  action: () => Promise<T>,
  maxRetries = 50,
  retryDelay = 5000
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await action();
    } catch (error) {
      console.error('Error occurred:', error);
      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        // await new Promise((resolve) => setTimeout(resolve, retryDelay))
        await delay(retryDelay);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Exceeded maximum number of retries');
}
