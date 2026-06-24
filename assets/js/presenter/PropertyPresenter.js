import PropertyModel from '../model/PropertyModel.js';
import ForecastModel from '../model/ForecastModel.js';
import APIClient from '../model/APIClient.js';

/**
 * Property Presenter
 * ModelとViewの橋渡しをし、ビジネスロジックを管理
 */
class PropertyPresenter {
  constructor() {
    this.propertyModel = new PropertyModel();
    this.apiClient = new APIClient();
    this.currentForecast = null;
    this.isLoading = false;
    this.error = null;
  }

  /**
   * 物件情報を処理して予測を生成
   * @param {Object} propertyData - 入力された物件情報
   * @returns {Promise<Object>} 予測結果
   */
  async handlePropertySubmit(propertyData) {
    // バリデーション
    const validation = this.propertyModel.validate(propertyData);
    if (!validation.isValid) {
      this.error = validation.errors;
      return { success: false, errors: validation.errors };
    }

    this.error = null;
    this.isLoading = true;

    try {
      // 物件情報を保存
      this.propertyModel.setProperty(propertyData);

      // API経由での予測取得を試みる
      let forecast = await this.apiClient.fetchForecast(propertyData);

      // APIが失敗した場合はローカルエンジンを使用
      if (!forecast) {
        forecast = ForecastModel.generateLocalForecast(propertyData);
      }

      this.currentForecast = forecast;
      this.isLoading = false;

      return {
        success: true,
        forecast: forecast,
        summary: ForecastModel.getSummary(forecast)
      };
    } catch (error) {
      console.error('Error in presenter:', error);
      this.error = ['予測生成中にエラーが発生しました'];
      this.isLoading = false;
      return { success: false, errors: this.error };
    }
  }

  /**
   * 現在の予測データを取得
   * @returns {Object} 予測データ
   */
  getForecast() {
    return this.currentForecast;
  }

  /**
   * 現在の物件情報を取得
   * @returns {Object} 物件情報
   */
  getCurrentProperty() {
    return this.propertyModel.getCurrentProperty();
  }

  /**
   * 保存済みの全物件を取得
   * @returns {Array} 物件一覧
   */
  getAllProperties() {
    return this.propertyModel.getAllProperties();
  }

  /**
   * 物件を削除
   * @param {number} id - 物件ID
   */
  deleteProperty(id) {
    this.propertyModel.deleteProperty(id);
  }

  /**
   * エラーをクリア
   */
  clearError() {
    this.error = null;
  }

  /**
   * ローディング状態を取得
   * @returns {boolean}
   */
  getIsLoading() {
    return this.isLoading;
  }

  /**
   * エラーを取得
   * @returns {Array|null}
   */
  getError() {
    return this.error;
  }
}

export default PropertyPresenter;
