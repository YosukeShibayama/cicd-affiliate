/**
 * Forecast Model
 * 価格予測ロジックを管理
 */
class ForecastModel {
  /**
   * ローカル予測エンジン
   * APIが接続できない場合の代替処理
   * @param {Object} propertyData - 物件情報
   * @returns {Object} 予測データ
   */
  static generateLocalForecast(propertyData) {
    const { buildingAge, squareMeters, distanceToStation, currentPrice, location } = propertyData;

    // 価格低下率の計算（複数要因を考慮）
    let depreciationRate = 0.02; // 基本的な年率減価

    // 築年数による影響（古いほど下落が大きい）
    if (buildingAge > 20) {
      depreciationRate += 0.01 * (buildingAge - 20) / 10;
    }

    // 駅からの距離による影響（遠いほど下落が大きい）
    if (distanceToStation > 10) {
      depreciationRate += 0.005 * (distanceToStation - 10) / 5;
    }

    // 地域による調整
    const locationMultiplier = {
      'tokyo': 1.0,
      'kanagawa': 0.95,
      'chiba': 0.93,
      'saitama': 0.94
    }[location] || 0.92;

    depreciationRate *= locationMultiplier;
    depreciationRate = Math.min(depreciationRate, 0.05); // 最大5%の年率に制限

    const forecast = {
      currentPrice,
      depreciationRate: depreciationRate,
      forecast: [],
      analysis: this.generateAnalysis(propertyData, depreciationRate)
    };

    let price = currentPrice;
    for (let year = 1; year <= 10; year++) {
      price = price * (1 - depreciationRate);
      forecast.forecast.push({
        year,
        price: Math.round(price * 100) / 100,
        changeRate: parseFloat(((price - currentPrice) / currentPrice * 100).toFixed(1))
      });
    }

    return forecast;
  }

  /**
   * 分析情報を生成
   * @param {Object} propertyData - 物件情報
   * @param {number} depreciationRate - 減価率
   * @returns {Array<string>} 分析レポート
   */
  static generateAnalysis(propertyData, depreciationRate) {
    const { buildingAge, squareMeters, distanceToStation, location } = propertyData;
    const analysis = [];

    if (buildingAge < 5) {
      analysis.push('✓ 築年数が浅いため、比較的安定した価格が期待できます');
    } else if (buildingAge > 30) {
      analysis.push('⚠ 築年数が古いため、価格下落が加速する可能性があります');
    }

    if (distanceToStation < 5) {
      analysis.push('✓ 駅に近いため、比較的価値が保ちやすいです');
    } else if (distanceToStation > 15) {
      analysis.push('⚠ 駅から遠いため、価格下落が加速する可能性があります');
    }

    if (squareMeters > 100) {
      analysis.push('✓ 広い物件は需要が安定しやすい傾向があります');
    } else if (squareMeters < 30) {
      analysis.push('⚠ 小規模物件は供給過剰による価格下落リスクがあります');
    }

    if (location === 'tokyo') {
      analysis.push('✓ 東京都は不動産需要が高く、相対的に価値が保ちやすいです');
    }

    if (depreciationRate > 0.04) {
      analysis.push('⚠ 予測される年率下落が高めです。リフォームなどで価値を維持することをお勧めします');
    } else if (depreciationRate < 0.015) {
      analysis.push('✓ 予測される年率下落が低めで、比較的安心できる物件です');
    }

    return analysis;
  }

  /**
   * 5年後と10年後の価格をサマリーで取得
   * @param {Object} forecast - 予測データ
   * @returns {Object} {price5Year, price10Year, change5Year, change10Year}
   */
  static getSummary(forecast) {
    const data5Year = forecast.forecast[4] || null;
    const data10Year = forecast.forecast[9] || null;

    return {
      price5Year: data5Year ? data5Year.price : null,
      price10Year: data10Year ? data10Year.price : null,
      change5Year: data5Year ? data5Year.changeRate : null,
      change10Year: data10Year ? data10Year.changeRate : null
    };
  }
}

export default ForecastModel;
