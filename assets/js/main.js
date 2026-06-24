import PropertyPresenter from './presenter/PropertyPresenter.js';
import PropertyForm from './components/PropertyForm.js';
import ForecastResult from './components/ForecastResult.js';

const { createApp } = Vue;

/**
 * Vue App - Real Estate Price Forecast System
 * MVP Architecture Implementation
 */
const app = createApp({
  name: 'RealEstateForecastApp',
  components: {
    PropertyForm,
    ForecastResult
  },
  data() {
    return {
      presenter: new PropertyPresenter(),
      forecast: null,
      summary: null,
      isLoading: false,
      errors: [],
      savedProperties: []
    };
  },
  computed: {
    displayErrors() {
      if (this.errors.length > 0) {
        return this.errors;
      }
      if (this.presenter.getError()) {
        return this.presenter.getError();
      }
      return [];
    }
  },
  methods: {
    /**
     * フォーム送信ハンドラ
     * @param {Object} propertyData - 入力された物件情報
     */
    async handlePropertySubmit(propertyData) {
      this.errors = [];
      this.isLoading = true;

      try {
        const result = await this.presenter.handlePropertySubmit(propertyData);

        if (result.success) {
          this.forecast = result.forecast;
          this.summary = result.summary;
          this.savedProperties = this.presenter.getAllProperties();
          // 結果セクションにスクロール
          this.$nextTick(() => {
            const resultSection = document.querySelector('.result-section');
            if (resultSection) {
              resultSection.scrollIntoView({ behavior: 'smooth' });
            }
          });
        } else {
          this.errors = result.errors;
        }
      } catch (error) {
        console.error('Error:', error);
        this.errors = ['予測生成中にエラーが発生しました'];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * エラーをクリア
     */
    clearErrors() {
      this.errors = [];
      this.presenter.clearError();
    },

    /**
     * 物件を削除
     * @param {number} id - 物件ID
     */
    deleteProperty(id) {
      this.presenter.deleteProperty(id);
      this.savedProperties = this.presenter.getAllProperties();
    }
  },
  template: `
    <div class="page">
      <header class="header">
        <h1>不動産価格推移予測システム</h1>
        <p>物件情報を入力すると、今後の価格推移を予測できます</p>
      </header>

      <section class="container">
        <property-form
          :isLoading="isLoading"
          :errors="displayErrors"
          @submit="handlePropertySubmit"
        />
        <forecast-result
          :forecast="forecast"
          :summary="summary"
        />
      </section>

      <section v-if="savedProperties.length > 0" class="saved-properties">
        <h2>保存済み物件</h2>
        <div class="properties-list">
          <div v-for="property in savedProperties" :key="property.id" class="property-card">
            <div class="property-info">
              <p><strong>築年数:</strong> {{ property.buildingAge }}年</p>
              <p><strong>平米数:</strong> {{ property.squareMeters }}㎡</p>
              <p><strong>駅距離:</strong> {{ property.distanceToStation }}分</p>
              <p><strong>価格:</strong> {{ property.currentPrice }}万円</p>
              <p><strong>地域:</strong> {{ property.location }}</p>
            </div>
            <button @click="deleteProperty(property.id)" class="delete-btn">
              削除
            </button>
          </div>
        </div>
      </section>
    </div>
  `
});

app.mount('#app');
