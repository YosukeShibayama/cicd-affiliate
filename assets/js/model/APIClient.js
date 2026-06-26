import { fetchWithTimeout } from '../security.js';

/**
 * API Client
 * 不動産情報ライブラリAPIとの通信を管理
 */
class APIClient {
  constructor() {
    this.baseURL = 'https://api.realestate-lib.example.com';
    this.timeoutMs = 8000;
    this.maxJsonBytes = 100000;
  }

  /**
   * 価格予測を取得
   * @param {Object} propertyData - 物件情報
   * @returns {Promise<Object|null>} 予測データ
   */
  async fetchForecast(propertyData) {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/forecast`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      }, this.timeoutMs).catch(() => null);

      if (!response || !response.ok) {
        return null;
      }

      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > this.maxJsonBytes) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('API Error:', error);
      }
      return null;
    }
  }
}

export default APIClient;