export default {
  name: 'MortgageResult',
  props: {
    result: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      chartInstances: {}
    };
  },
  watch: {
    result(newVal) {
      if (newVal) {
        this.$nextTick(() => this.renderCharts());
      }
    }
  },
  mounted() {
    if (this.result) {
      this.$nextTick(() => this.renderCharts());
    }
  },
  beforeUnmount() {
    this.destroyCharts();
  },
  computed: {
    displaySchedule() {
      if (!this.result?.schedule) {
        return { first: [], last: [], totalMonths: 0 };
      }
      const schedule = this.result.schedule;
      return {
        first: schedule.slice(0, 6),
        last: schedule.slice(-6),
        totalMonths: schedule.length
      };
    },
    prepaymentAdvice() {
      if (!this.result?.prepayment) {
        return '繰上返済額を入力すると、利息削減額や期間短縮の目安を確認できます。';
      }
      if (this.result.prepayment.type === 'term_reduction') {
        return '期間短縮型は、月々の返済額を大きく変えずに完済時期を早めたい場合の目安になります。';
      }
      return '返済額軽減型は、返済期間を保ちながら毎月負担を下げたい場合の目安になります。';
    },
    refinanceAdvice() {
      if (!this.result?.refinance) {
        return '借り換え後金利と諸費用を入力すると、費用回収年数の目安を確認できます。';
      }
      if (this.result.refinance.netBenefit > 0) {
        return '概算では借り換えメリットが出ています。実際の条件や諸費用を確認する価値があります。';
      }
      return '概算では諸費用を差し引くとメリットが小さめです。金利差、残期間、手数料を確認しましょう。';
    }
  },
  methods: {
    formatCurrency(value) {
      const numberValue = Number(value || 0);
      return numberValue.toLocaleString('ja-JP');
    },
    formatMan(value) {
      return `${Math.round(Number(value || 0) / 10000).toLocaleString('ja-JP')}万円`;
    },
    formatSignedMan(value) {
      const numberValue = Math.round(Number(value || 0) / 10000);
      if (numberValue > 0) return `+${numberValue.toLocaleString('ja-JP')}万円`;
      if (numberValue < 0) return `${numberValue.toLocaleString('ja-JP')}万円`;
      return '0万円';
    },
    formatSignedCurrency(value) {
      const numberValue = Number(value || 0);
      if (numberValue > 0) return `+¥${numberValue.toLocaleString('ja-JP')}`;
      if (numberValue < 0) return `-¥${Math.abs(numberValue).toLocaleString('ja-JP')}`;
      return '¥0';
    },
    formatMonths(months) {
      const total = Number(months || 0);
      const years = Math.floor(total / 12);
      const rest = total % 12;
      if (total <= 0) return '短縮なし';
      if (rest === 0) return `約${years}年`;
      return `約${years}年${rest}か月`;
    },
    formatPayback(years) {
      if (!Number.isFinite(years) || years < 0) {
        return '回収困難';
      }
      if (years === 0) {
        return '即時回収相当';
      }
      return `約${years.toFixed(1)}年`;
    },
    valueClass(value, inverse = false) {
      const numberValue = Number(value || 0);
      if (numberValue === 0) return '';
      const positive = inverse ? numberValue < 0 : numberValue > 0;
      return positive ? 'positive' : 'negative';
    },
    destroyCharts() {
      Object.values(this.chartInstances).forEach(chart => chart?.destroy?.());
      this.chartInstances = {};
    },
    renderCharts() {
      if (!this.result || typeof Chart === 'undefined') return;
      this.destroyCharts();
      this.renderBalanceChart();
      this.renderScenarioChart();
      this.renderComparisonChart();
    },
    renderBalanceChart() {
      const canvas = this.$refs.balanceChart;
      if (!canvas) return;
      const labels = this.result.yearlyBalance.map(item => `${item.year}年目`);
      const datasets = [
        {
          label: '基本プラン残高',
          data: this.result.yearlyBalance.map(item => Math.round(item.balance / 10000)),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          borderWidth: 2,
          tension: 0.35
        }
      ];

      if (this.result.prepayment) {
        datasets.push({
          label: '繰上返済後残高',
          data: this.result.prepayment.yearlyBalance.map(item => Math.round(item.balance / 10000)),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          borderWidth: 2,
          tension: 0.35
        });
      }

      this.chartInstances.balance = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: this.commonChartOptions('残高（万円）')
      });
    },
    renderScenarioChart() {
      const canvas = this.$refs.scenarioChart;
      if (!canvas || !this.result.scenarioComparison?.length) return;
      this.chartInstances.scenario = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.result.scenarioComparison.map(item => item.label),
          datasets: [{
            label: '毎月返済額（万円）',
            data: this.result.scenarioComparison.map(item => Math.round(item.monthlyPayment / 10000)),
            backgroundColor: ['#2563eb', '#f59e0b', '#ef4444', '#7c3aed', '#0f766e']
          }]
        },
        options: this.commonChartOptions('毎月返済額（万円）')
      });
    },
    renderComparisonChart() {
      const canvas = this.$refs.comparisonChart;
      if (!canvas) return;
      const labels = ['基本プラン'];
      const values = [Math.round(this.result.totalPayment / 10000)];
      const colors = ['#2563eb'];

      if (this.result.prepayment) {
        labels.push('繰上返済後');
        values.push(Math.round(this.result.prepayment.totalPayment / 10000));
        colors.push('#16a34a');
      }
      if (this.result.refinance) {
        labels.push('借り換え後（費用込）');
        values.push(Math.round(this.result.refinance.totalPaymentAfterCost / 10000));
        colors.push('#f97316');
      }

      this.chartInstances.comparison = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '総返済額（万円）',
            data: values,
            backgroundColor: colors
          }]
        },
        options: this.commonChartOptions('総返済額（万円）')
      });
    },
    commonChartOptions(yTitle) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ${context.parsed.y.toLocaleString('ja-JP')}万円`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: yTitle }
          }
        }
      };
    }
  },
  template: `
    <div v-if="result" class="result-section mortgage-result">
      <h2>概算シミュレーション結果</h2>

      <section class="result-block">
        <div class="metric-grid">
          <div class="metric-tile primary">
            <span class="metric-label">毎月返済額</span>
            <strong>¥{{ formatCurrency(result.summary.monthlyPayment) }}</strong>
            <small v-if="result.repaymentType === 'principal'">元金均等は初月返済額の目安</small>
          </div>
          <div class="metric-tile">
            <span class="metric-label">年間返済額</span>
            <strong>¥{{ formatCurrency(result.summary.annualPayment) }}</strong>
            <small>ボーナス返済を含む概算</small>
          </div>
          <div class="metric-tile">
            <span class="metric-label">総返済額</span>
            <strong>¥{{ formatCurrency(result.summary.totalPayment) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">概算総利息</span>
            <strong>¥{{ formatCurrency(result.summary.totalInterest) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">完済予定時期</span>
            <strong>{{ result.summary.payoffDateLabel }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">残り返済年数</span>
            <strong>{{ result.summary.remainingYearsLabel }}</strong>
          </div>
        </div>
        <p class="result-note">
          この結果は概算です。金融機関の正式な返済予定表、保証料、団信、手数料、税金などとは異なる場合があります。
        </p>
      </section>

      <section class="result-block" id="scenario-comparison">
        <h3>金利上昇シナリオ比較</h3>
        <div class="table-wrapper">
          <table class="schedule-table comparison-table">
            <thead>
              <tr>
                <th>金利</th>
                <th>毎月返済額</th>
                <th>現在との差額</th>
                <th>年間負担増</th>
                <th>総返済額の増加目安</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="scenario in result.scenarioComparison" :key="scenario.label">
                <td>{{ scenario.label }}</td>
                <td>¥{{ formatCurrency(scenario.monthlyPayment) }}</td>
                <td :class="valueClass(scenario.monthlyDiff, true)">{{ formatSignedCurrency(scenario.monthlyDiff) }}</td>
                <td :class="valueClass(scenario.annualDiff, true)">{{ formatSignedCurrency(scenario.annualDiff) }}</td>
                <td :class="valueClass(scenario.totalIncrease, true)">{{ formatSignedMan(scenario.totalIncrease) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="result.prepayment" class="result-block" id="prepayment-section">
        <h3>繰上返済シミュレーション</h3>
        <p class="section-lead">{{ prepaymentAdvice }}</p>
        <div v-if="result.prepayment" class="metric-grid compact">
          <div class="metric-tile">
            <span class="metric-label">繰上返済タイプ</span>
            <strong>{{ result.prepayment.typeLabel }}</strong>
          </div>
          <div class="metric-tile positive-tone">
            <span class="metric-label">削減できる利息</span>
            <strong>{{ formatMan(result.prepayment.reducedInterest) }}</strong>
          </div>
          <div class="metric-tile positive-tone">
            <span class="metric-label">短縮できる返済期間</span>
            <strong>{{ formatMonths(result.prepayment.shortenedMonths) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">毎月返済額の変化</span>
            <strong :class="valueClass(result.prepayment.monthlyPaymentChange, true)">
              {{ formatSignedCurrency(result.prepayment.monthlyPaymentChange) }}
            </strong>
          </div>
        </div>
      </section>

      <section v-if="result.refinance" class="result-block" id="refinance-section">
        <h3>借り換えシミュレーション</h3>
        <p class="section-lead">{{ refinanceAdvice }}</p>
        <div v-if="result.refinance" class="metric-grid compact">
          <div class="metric-tile">
            <span class="metric-label">毎月返済額の削減額</span>
            <strong :class="valueClass(result.refinance.monthlySaving)">{{ formatSignedCurrency(result.refinance.monthlySaving) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">年間削減額</span>
            <strong :class="valueClass(result.refinance.annualSaving)">{{ formatSignedCurrency(result.refinance.annualSaving) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">総削減額</span>
            <strong :class="valueClass(result.refinance.grossSaving)">{{ formatMan(result.refinance.grossSaving) }}</strong>
          </div>
          <div class="metric-tile" :class="valueClass(result.refinance.netBenefit)">
            <span class="metric-label">諸費用差引後メリット</span>
            <strong>{{ formatSignedMan(result.refinance.netBenefit) }}</strong>
          </div>
          <div class="metric-tile">
            <span class="metric-label">費用回収年数</span>
            <strong>{{ formatPayback(result.refinance.paybackYears) }}</strong>
          </div>
        </div>
      </section>

      <section class="result-block chart-grid-section">
        <h3>グラフで見る返済イメージ</h3>
        <div class="chart-grid">
          <div class="chart-panel">
            <h4>年別ローン残高推移</h4>
            <div class="chart-container mortgage-chart-container">
              <canvas ref="balanceChart"></canvas>
            </div>
          </div>
          <div class="chart-panel">
            <h4>金利別の毎月返済額</h4>
            <div class="chart-container mortgage-chart-container">
              <canvas ref="scenarioChart"></canvas>
            </div>
          </div>
          <div class="chart-panel wide">
            <h4>総返済額比較</h4>
            <div class="chart-container mortgage-chart-container">
              <canvas ref="comparisonChart"></canvas>
            </div>
          </div>
        </div>
      </section>

      <section class="result-block consultation-options" id="consultation-options">
        <h3>次に確認したいこと</h3>
        <p class="section-lead">結果を見て気になる項目があれば、条件比較や専門家相談の入口を用意できます。</p>
        <div class="affiliate-grid">
          <a :href="result.refinance ? '#refinance-section' : '#mortgage-form'" class="affiliate-card" data-affiliate-slot="mortgage-refinance">
            <strong>住宅ローン借り換え相談</strong>
            <span>金利差と諸費用を確認したい人向け</span>
          </a>
          <a href="#scenario-comparison" class="affiliate-card" data-affiliate-slot="mortgage-compare">
            <strong>住宅ローン比較サービス</strong>
            <span>複数の金利条件を並べて見たい人向け</span>
          </a>
          <a :href="result.prepayment ? '#prepayment-section' : '#mortgage-form'" class="affiliate-card" data-affiliate-slot="fp-consultation">
            <strong>ファイナンシャルプランナー相談</strong>
            <span>繰上返済と教育費・老後資金を一緒に見たい人向け</span>
          </a>
          <a href="index.html" class="affiliate-card" data-affiliate-slot="real-estate-service">
            <strong>不動産・住宅関連サービス</strong>
            <span>住み替えや資産価値も合わせて確認したい人向け</span>
          </a>
          <a href="#mortgage-form" class="affiliate-card" data-affiliate-slot="insurance-review">
            <strong>保険見直しサービス</strong>
            <span>住宅ローンと固定費のバランスを見直したい人向け</span>
          </a>
        </div>
      </section>

      <section class="result-block schedule-section">
        <h3>返済スケジュール抜粋</h3>
        <div class="table-wrapper">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>月</th>
                <th>返済額</th>
                <th>元金</th>
                <th>利息</th>
                <th>追加返済</th>
                <th>残高</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in displaySchedule.first" :key="'first-' + payment.month">
                <td>{{ payment.month }}</td>
                <td>¥{{ formatCurrency(payment.payment) }}</td>
                <td>¥{{ formatCurrency(payment.principal) }}</td>
                <td>¥{{ formatCurrency(payment.interest) }}</td>
                <td>¥{{ formatCurrency(payment.bonusPayment + payment.prepayment) }}</td>
                <td>¥{{ formatCurrency(payment.balance) }}</td>
              </tr>
              <tr v-if="displaySchedule.totalMonths > 12">
                <td colspan="6" class="schedule-info">... 中間 {{ displaySchedule.totalMonths - 12 }} か月を省略 ...</td>
              </tr>
              <tr v-for="payment in displaySchedule.last" :key="'last-' + payment.month">
                <td>{{ payment.month }}</td>
                <td>¥{{ formatCurrency(payment.payment) }}</td>
                <td>¥{{ formatCurrency(payment.principal) }}</td>
                <td>¥{{ formatCurrency(payment.interest) }}</td>
                <td>¥{{ formatCurrency(payment.bonusPayment + payment.prepayment) }}</td>
                <td>¥{{ formatCurrency(payment.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
};