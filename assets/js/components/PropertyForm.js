/**
 * PropertyForm Component
 * 物件情報入力フォーム
 */
export default {
  name: 'PropertyForm',
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
  data() {
    return {
      form: {
        buildingAge: '',
        squareMeters: '',
        distanceToStation: '',
        currentPrice: '',
        location: ''
      }
    };
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', this.form);
      // フォームをリセット
      this.form = {
        buildingAge: '',
        squareMeters: '',
        distanceToStation: '',
        currentPrice: '',
        location: ''
      };
    }
  },
  template: `
    <div class="form-section">
      <h2>物件情報入力</h2>

      <div v-if="errors.length > 0" class="error-message">
        <p v-for="error in errors" :key="error" class="error-item">
          ✕ {{ error }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="buildingAge">築年数 (年)</label>
          <input
            v-model.number="form.buildingAge"
            type="number"
            id="buildingAge"
            placeholder="例: 10"
            min="0"
            max="100"
            required
          >
        </div>

        <div class="form-group">
          <label for="squareMeters">平米数 (㎡)</label>
          <input
            v-model.number="form.squareMeters"
            type="number"
            id="squareMeters"
            placeholder="例: 80"
            min="1"
            step="0.1"
            required
          >
        </div>

        <div class="form-group">
          <label for="distanceToStation">駅からの距離 (分)</label>
          <input
            v-model.number="form.distanceToStation"
            type="number"
            id="distanceToStation"
            placeholder="例: 5"
            min="0"
            step="0.1"
            required
          >
        </div>

        <div class="form-group">
          <label for="currentPrice">現在の価格 (万円)</label>
          <input
            v-model.number="form.currentPrice"
            type="number"
            id="currentPrice"
            placeholder="例: 3500"
            min="0"
            step="10"
            required
          >
        </div>

        <div class="form-group">
          <label for="location">地域</label>
          <select v-model="form.location" id="location" required>
            <option value="">--選択してください--</option>
            <option value="tokyo">東京都</option>
            <option value="kanagawa">神奈川県</option>
            <option value="osaka">大阪府</option>
            <option value="kyoto">京都府</option>
            <option value="other">その他</option>
          </select>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '予測中...' : '価格推移を予測' }}
        </button>
      </form>
    </div>
  `
};
