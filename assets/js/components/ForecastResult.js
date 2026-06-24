/**
 * ForecastResult Component
 * 予測結果表示
 */
export default {
  name: 'ForecastResult',
  props: {
    forecast: {
      type: Object,
      default: null
    },
    summary: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatPrice(price) {
      return Math.round(price).toLocaleString();
    },
    formatChange(change) {
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
    }
  },
  template: `
    <div v-if="forecast && summary" class="result-section">
      <h2>価格推移予測結果</h2>

      <div class="result-info">
        <p>
          <strong>現在の価格:</strong>
          <span>{{ formatPrice(forecast.currentPrice) }}万円</span>
        </p>
        <p>
          <strong>5年後の予測価格:</strong>
          <span>{{ formatPrice(summary.price5Year) }}万円</span>
          <span class="change-rate" :class="summary.change5Year < 0 ? 'negative' : 'positive'">
            {{ formatChange(summary.change5Year) }}
          </span>
        </p>
        <p>
          <strong>10年後の予測価格:</strong>
          <span>{{ formatPrice(summary.price10Year) }}万円</span>
          <span class="change-rate" :class="summary.change10Year < 0 ? 'negative' : 'positive'">
            {{ formatChange(summary.change10Year) }}
          </span>
        </p>
      </div>

      <h3>価格推移グラフ</h3>
      <div class="chart-container">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>年</th>
              <th>予測価格 (万円)</th>
              <th>変化率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in forecast.forecast" :key="item.year">
              <td>{{ item.year }}年</td>
              <td>{{ formatPrice(item.price) }}</td>
              <td :class="item.changeRate < 0 ? 'negative' : 'positive'">
                {{ formatChange(item.changeRate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="analysis">
        <h3>分析要素</h3>
        <ul>
          <li v-for="(item, index) in forecast.analysis" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  `
};
