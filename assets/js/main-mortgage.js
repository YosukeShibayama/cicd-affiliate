import MortgagePresenter from './presenter/MortgagePresenter.js';
import MortgageForm from './components/MortgageForm.js';
import MortgageResult from './components/MortgageResult.js';

const { createApp } = Vue;

/**
 * Vue App - Mortgage Simulator
 * MVP Architecture Implementation
 */
const app = createApp({
  name: 'MortgageSimulatorApp',
  components: {
    MortgageForm,
    MortgageResult
  },
  data() {
    return {
      presenter: new MortgagePresenter(),
      result: null,
      isLoading: false,
      errors: [],
      history: []
    };
  },
  computed: {
    displayErrors() {
      if (this.errors.length > 0) {
        return this.errors;
      }
      if (this.presenter.getError()) {
        return [this.presenter.getError()];
      }
      return [];
    }
  },
  methods: {
    async handleMortgageSubmit(mortgageData) {
      this.errors = [];
      this.isLoading = true;

      try {
        const response = this.presenter.handleMortgageSubmit(mortgageData);

        if (response.success) {
          this.result = response.result;
          this.history = this.presenter.getHistory();
          this.$nextTick(() => {
            const resultSection = document.querySelector('.result-section');
            if (resultSection) {
              resultSection.scrollIntoView({ behavior: 'smooth' });
            }
          });
        } else {
          this.errors = response.errors;
        }
      } catch (error) {
        console.error('Error:', error);
        this.errors = ['シミュレーション生成中にエラーが発生しました'];
      } finally {
        this.isLoading = false;
      }
    },
    clearErrors() {
      this.errors = [];
      this.presenter.clearError();
    },
    deleteHistoryItem(index) {
      this.presenter.deleteHistoryItem(index);
      this.history = this.presenter.getHistory();
    },
    clearHistory() {
      this.presenter.clearHistory();
      this.history = [];
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('ja-JP');
    }
  },
  template: `
    <div class="page mortgage-page">
      <header class="header mortgage-header">
        <h1>住宅ローンシミュレーション</h1>
        <p>毎月返済額、金利上昇、繰上返済、借り換えメリットをまとめて概算できます</p>
      </header>

      <section class="mortgage-overview">
        <div>
          <h2>返済計画を比較しやすくするための参考ツール</h2>
          <p>
            現在の残債や金利をもとに、総返済額・総利息・完済時期を概算します。
            金利が上がった場合、繰上返済した場合、借り換えた場合を並べて見ることで、相談や比較の前に条件を整理できます。
          </p>
        </div>
        <ul>
          <li>将来の金利変動は保証されません</li>
          <li>審査結果や諸費用は金融機関ごとに異なります</li>
          <li>結果は参考値であり、個別の投資・借入判断を勧めるものではありません</li>
        </ul>
      </section>

      <section class="container mortgage-container">
        <mortgage-form
          :isLoading="isLoading"
          :errors="displayErrors"
          @submit="handleMortgageSubmit"
        ></mortgage-form>

        <mortgage-result
          :result="result"
        ></mortgage-result>
      </section>

      <section v-if="history.length > 0" class="history-section">
        <h2>シミュレーション履歴</h2>
        <div class="history-controls">
          <button @click="clearHistory" class="clear-button">履歴をクリア</button>
        </div>
        <div class="history-list">
          <div v-for="(item, index) in history" :key="index" class="history-item">
            <div class="history-details">
              <span class="history-label">残債: {{ item.currentBalanceAmount }}万円</span>
              <span class="history-label">金利: {{ item.annualRate }}%</span>
              <span class="history-label">残期間: {{ item.remainingYears }}年</span>
              <span class="history-label">方式: {{ item.repaymentType === 'equal' ? '元利均等' : '元金均等' }}</span>
              <span class="history-result">月返済額: ¥{{ formatCurrency(item.result.monthlyPayment) }}</span>
              <span class="history-result">総利息: ¥{{ formatCurrency(item.result.totalInterest) }}</span>
            </div>
            <button @click="deleteHistoryItem(index)" class="delete-button">削除</button>
          </div>
        </div>
      </section>

      <nav class="navigation">
        <a href="index.html">不動産価格予測システムへ</a>
        <a href="xit002.html">XIT002 API テストページへ</a>
      </nav>
    </div>
  `
});

app.mount('#app');