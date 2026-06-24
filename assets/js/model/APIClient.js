/**
 * API Client
 * 不動産情報ライブラリAPIとの通信を管理
 */
class APIClient {
  constructor() {
    this.baseURL = 'https://api.realestate-lib.example.com';
  }

  /**
   * 価格予測を取得
   * @param {Object} propertyData - 物件情報
   * @returns {Promise<Object>} 予測データ
   */
  async fetchForecast(propertyData) {
    try {
      const response = await fetch(`${this.baseURL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      }).catch(() => null);

      if (response && response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }
}

export default APIClient;
