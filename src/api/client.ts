const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** 模拟 API 调用延迟 (200-600ms)，让交互有真实网络感 */
export function simulateApiCall<T>(
  data: T,
  options?: { delay?: number; shouldFail?: boolean }
): Promise<T> {
  const { delay = randomBetween(200, 600), shouldFail = false } = options || {};
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('请求失败，请稍后重试'));
        return;
      }
      resolve(data);
    }, delay);
  });
}
