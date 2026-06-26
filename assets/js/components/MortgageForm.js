export default {
  name: 'MortgageForm',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: () => []
    }
  },
  emits: ['submit'],
  data() {
    return {
      form: {
        principalAmount: 3500,
        currentBalanceAmount: 3200,
        loanYears: 35,
        remainingYears: 30,
        annualRate: 1.2,
        interestType: 'variable',
        repaymentType: 'equal',
        monthlyPaymentAmount: 0,
        bonusPaymentAmount: 0,
        prepaymentAmount: 0,
        prepaymentYear: 5,
        prepaymentType: 'term_reduction',
        refinanceRate: 0,
        refinanceCost: 0
      },
      showPrepayment: false,
      showRefinance: false
    };
  },
  methods: {
    submitForm() {
      this.$emit('submit', { ...this.form });
    },
    togglePrepayment() {
      this.showPrepayment = !this.showPrepayment;
    },
    toggleRefinance() {
      this.showRefinance = !this.showRefinance;
    },
    clearPrepayment() {
      this.form.prepaymentAmount = 0;
      this.form.prepaymentYear = 5;
      this.form.prepaymentType = 'term_reduction';
    },
    clearRefinance() {
      this.form.refinanceRate = 0;
      this.form.refinanceCost = 0;
    }
  },
  template: `
    <div class="form-section" id="mortgage-form">
      <h2>住宅ローン条件入力</h2>

      <div v-if="errors.length > 0" class="error-box">
        <div v-for="(error, index) in errors" :key="index" class="error-item">
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="submitForm" class="mortgage-form">
        <section class="form-panel">
          <div class="form-section-header">
            <h3>基本条件</h3>
            <p>返済中のローンは現在残債と残り返済期間を優先して概算します。</p>
          </div>

          <div class="form-grid two-columns">
            <div class="form-group">
              <label for="principal">借入額 (万円)</label>
              <input id="principal" v-model.number="form.principalAmount" type="number" min="1" max="100000" step="1" required :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="balance">現在残債 (万円)</label>
              <input id="balance" v-model.number="form.currentBalanceAmount" type="number" min="0" max="100000" step="1" required :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="loanYears">借入期間 (年)</label>
              <input id="loanYears" v-model.number="form.loanYears" type="number" min="1" max="50" step="1" required :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="remainingYears">残り返済期間 (年)</label>
              <input id="remainingYears" v-model.number="form.remainingYears" type="number" min="1" max="50" step="1" required :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="rate">現在金利 (%)</label>
              <input id="rate" v-model.number="form.annualRate" type="number" min="0" max="10" step="0.01" required :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="interestType">金利タイプ</label>
              <select id="interestType" v-model="form.interestType" required :disabled="isLoading">
                <option value="fixed">固定金利</option>
                <option value="variable">変動金利</option>
                <option value="mixed">固定期間選択・ミックス</option>
              </select>
            </div>
            <div class="form-group">
              <label for="repayment">返済方式</label>
              <select id="repayment" v-model="form.repaymentType" required :disabled="isLoading">
                <option value="equal">元利均等返済</option>
                <option value="principal">元金均等返済</option>
              </select>
            </div>
            <div class="form-group">
              <label for="monthlyPayment">現在の毎月返済額 (万円・任意)</label>
              <input id="monthlyPayment" v-model.number="form.monthlyPaymentAmount" type="number" min="0" max="1000" step="0.1" :disabled="isLoading" />
            </div>
            <div class="form-group">
              <label for="bonusPayment">ボーナス返済額 (年2回合計・万円)</label>
              <input id="bonusPayment" v-model.number="form.bonusPaymentAmount" type="number" min="0" max="2000" step="1" :disabled="isLoading" />
            </div>
          </div>
        </section>

        <section class="details-section optional-input-section">
          <button type="button" class="accordion-button" @click="togglePrepayment" :aria-expanded="showPrepayment">
            <span><span class="accordion-icon">{{ showPrepayment ? '▼' : '▶' }}</span>繰上返済を入力する（任意）</span>
            <span class="optional-status">{{ form.prepaymentAmount > 0 ? '入力あり' : '未入力' }}</span>
          </button>
          <div v-if="showPrepayment" class="accordion-content">
            <p class="details-info">繰上返済をしない場合は入力不要です。金額が0のとき、結果には繰上返済シミュレーションを表示しません。</p>
            <div class="form-grid three-columns">
              <div class="form-group">
                <label for="prepaymentAmount">繰上返済額 (万円)</label>
                <input id="prepaymentAmount" v-model.number="form.prepaymentAmount" type="number" min="0" max="100000" step="1" :disabled="isLoading" />
              </div>
              <div class="form-group">
                <label for="prepaymentYear">実施時期 (何年後)</label>
                <input id="prepaymentYear" v-model.number="form.prepaymentYear" type="number" min="1" :max="form.remainingYears" step="1" :disabled="isLoading" />
              </div>
              <div class="form-group">
                <label for="prepaymentType">繰上返済タイプ</label>
                <select id="prepaymentType" v-model="form.prepaymentType" :disabled="isLoading">
                  <option value="term_reduction">期間短縮型</option>
                  <option value="payment_reduction">返済額軽減型</option>
                </select>
              </div>
            </div>
            <button type="button" class="clear-button inline-clear" @click="clearPrepayment" :disabled="isLoading">繰上返済入力をクリア</button>
          </div>
        </section>

        <section class="details-section optional-input-section">
          <button type="button" class="accordion-button" @click="toggleRefinance" :aria-expanded="showRefinance">
            <span><span class="accordion-icon">{{ showRefinance ? '▼' : '▶' }}</span>借り換えを入力する（任意）</span>
            <span class="optional-status">{{ form.refinanceRate > 0 || form.refinanceCost > 0 ? '入力あり' : '未入力' }}</span>
          </button>
          <div v-if="showRefinance" class="accordion-content">
            <p class="details-info">借り換えを検討しない場合は入力不要です。借り換え後金利・諸費用がどちらも0のとき、結果には借り換えシミュレーションを表示しません。</p>
            <div class="form-grid two-columns">
              <div class="form-group">
                <label for="refinanceRate">借り換え後金利 (%)</label>
                <input id="refinanceRate" v-model.number="form.refinanceRate" type="number" min="0" max="10" step="0.01" :disabled="isLoading" />
              </div>
              <div class="form-group">
                <label for="refinanceCost">借り換え諸費用 (万円)</label>
                <input id="refinanceCost" v-model.number="form.refinanceCost" type="number" min="0" max="1000" step="1" :disabled="isLoading" />
              </div>
            </div>
            <button type="button" class="clear-button inline-clear" @click="clearRefinance" :disabled="isLoading">借り換え入力をクリア</button>
          </div>
        </section>

        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '計算中...' : '概算シミュレーションを実行' }}
        </button>
      </form>

      <div class="form-info">
        <h3>このシミュレーションについて</h3>
        <ul>
          <li>結果は概算です。金融機関の審査、保証料、団信、手数料、税金などは簡略化しています。</li>
          <li>金利上昇、繰上返済、借り換えを同じ条件で比較し、相談や比較のきっかけを作るための参考値です。</li>
          <li>将来の金利や返済条件は保証されません。</li>
        </ul>
      </div>
    </div>
  `
};