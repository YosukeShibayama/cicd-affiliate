/**
 * Property Model
 * 物件情報とビジネスロジックを管理
 */
class PropertyModel {
  constructor() {
    this.properties = [];
    this.currentProperty = null;
  }

  /**
   * 物件情報を保存
   * @param {Object} propertyData - 物件情報
   */
  setProperty(propertyData) {
    this.currentProperty = {
      id: Date.now(),
      ...propertyData,
      createdAt: new Date().toISOString()
    };
    this.properties.push(this.currentProperty);
  }

  /**
   * 現在の物件情報を取得
   * @returns {Object} 現在の物件情報
   */
  getCurrentProperty() {
    return this.currentProperty;
  }

  /**
   * 物件情報のバリデーション
   * @param {Object} propertyData - 物件情報
   * @returns {Object} {isValid: boolean, errors: string[]}
   */
  validate(propertyData) {
    const errors = [];

    if (!propertyData.buildingAge || propertyData.buildingAge < 0 || propertyData.buildingAge > 100) {
      errors.push('築年数は0～100年で入力してください');
    }

    if (!propertyData.squareMeters || propertyData.squareMeters <= 0) {
      errors.push('平米数は正の数で入力してください');
    }

    if (propertyData.distanceToStation === undefined || propertyData.distanceToStation < 0) {
      errors.push('駅からの距離は正の数で入力してください');
    }

    if (!propertyData.currentPrice || propertyData.currentPrice <= 0) {
      errors.push('現在の価格は正の数で入力してください');
    }

    if (!propertyData.location) {
      errors.push('地域を選択してください');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 物件一覧を取得
   * @returns {Array} 物件一覧
   */
  getAllProperties() {
    return this.properties;
  }

  /**
   * 物件を削除
   * @param {number} id - 物件ID
   */
  deleteProperty(id) {
    this.properties = this.properties.filter(p => p.id !== id);
    if (this.currentProperty?.id === id) {
      this.currentProperty = null;
    }
  }
}

export default PropertyModel;
