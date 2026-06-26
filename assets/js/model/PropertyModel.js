import { toFiniteNumber } from '../security.js';

const ALLOWED_LOCATIONS = new Set(['tokyo', 'kanagawa', 'chiba', 'saitama']);

/**
 * Property Model
 * 物件情報とビジネスロジックを管理
 */
class PropertyModel {
  constructor() {
    this.properties = [];
    this.currentProperty = null;
  }

  normalize(propertyData) {
    return {
      buildingAge: toFiniteNumber(propertyData?.buildingAge),
      squareMeters: toFiniteNumber(propertyData?.squareMeters),
      distanceToStation: toFiniteNumber(propertyData?.distanceToStation),
      currentPrice: toFiniteNumber(propertyData?.currentPrice),
      location: String(propertyData?.location ?? '').trim()
    };
  }

  /**
   * 物件情報を保存
   * @param {Object} propertyData - 物件情報
   */
  setProperty(propertyData) {
    const sanitizedProperty = this.normalize(propertyData);
    this.currentProperty = {
      id: Date.now(),
      ...sanitizedProperty,
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
   * @returns {Object} {isValid: boolean, errors: string[], data: Object}
   */
  validate(propertyData) {
    const errors = [];
    const data = this.normalize(propertyData);

    if (!Number.isFinite(data.buildingAge) || data.buildingAge < 0 || data.buildingAge > 100) {
      errors.push('築年数は0～100年で入力してください');
    }

    if (!Number.isFinite(data.squareMeters) || data.squareMeters <= 0 || data.squareMeters > 1000) {
      errors.push('平米数は1～1000㎡で入力してください');
    }

    if (!Number.isFinite(data.distanceToStation) || data.distanceToStation < 0 || data.distanceToStation > 120) {
      errors.push('駅からの距離は0～120分で入力してください');
    }

    if (!Number.isFinite(data.currentPrice) || data.currentPrice <= 0 || data.currentPrice > 1000000) {
      errors.push('現在の価格は1～1000000万円で入力してください');
    }

    if (!ALLOWED_LOCATIONS.has(data.location)) {
      errors.push('地域を選択してください');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data
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