import { fetchWithTimeout, limitText } from '../security.js';

/**
 * XIT002 API Test View Component
 * 都道府県内市区町村一覧取得 API の試験ページ
 */
export default {
  name: 'Xit002TestView',
  data() {
    return {
      endpoint: 'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002',
      area: '13',
      language: 'ja',
      subscriptionKey: '',
      responseBody: '',
      formattedResponse: '',
      statusMessage: '',
      isTesting: false,
      error: '',
      apiHistory: []
    };
  },
  computed: {
    queryString() {
      const params = new URLSearchParams();
      params.set('area', this.area);
      if (this.language) {
        params.set('language', this.language);
      }
      return params.toString();
    },
    fullUrl() {
      return `${this.endpoint}?${this.queryString}`;
    },
    sampleCommand() {
      return `curl -H "Ocp-Apim-Subscription-Key:{YOUR_API_KEY}" --compressed "${this.fullUrl}"`;
    }
  },
  methods: {
    formatJson(value) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    },
    validateRequest() {
      if (!/^\d{2}$/.test(this.area)) {
        return '都道府県コードは2桁の数字で入力してください。';
      }
      if (!['ja', 'en', ''].includes(this.language)) {
        return '言語は ja / en / 未指定 から選択してください。';
      }
      if (!this.subscriptionKey.trim()) {
        return 'APIキーを入力してください。';
      }
      if (this.subscriptionKey.length > 256) {
        return 'APIキーが長すぎます。';
      }
      return '';
    },
    async testApi() {
      this.statusMessage = '';
      this.responseBody = '';
      this.formattedResponse = '';
      this.error = '';
      this.isTesting = true;

      const validationError = this.validateRequest();
      if (validationError) {
        this.error = validationError;
        this.isTesting = false;
        return;
      }

      try {
        const response = await fetchWithTimeout(this.fullUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey.trim()
          }
        });

        const text = limitText(await response.text());
        this.responseBody = text;
        this.formattedResponse = this.formatJson(text);
        this.statusMessage = `${response.status} ${response.statusText}`;

        this.apiHistory.unshift({
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          url: this.fullUrl,
          request: `GET ${this.fullUrl}\nOcp-Apim-Subscription-Key: ${this.subscriptionKey ? '••••••••' : ''}`,
          response: this.formattedResponse || text,
          status: this.statusMessage
        });

        if (!response.ok) {
          this.error = `APIエラー: ${response.status} ${response.statusText}`;
        }
      } catch (err) {
        console.error(err);
        this.error = err?.name === 'AbortError'
          ? 'APIリクエストがタイムアウトしました。'
          : `APIリクエストに失敗しました: ${err.message}`;
      } finally {
        this.isTesting = false;
      }
    }
  },
  template: `
    <section class="api-test-section">
      <h2>XIT002 テスト</h2>
      <p>都道府県コードを指定して、その都道府県に含まれる市区町村一覧を取得します。</p>

      <div class="api-spec">
        <h3>エンドポイント</h3>
        <p><code>{{ endpoint }}</code></p>

        <h3>リクエスト</h3>
        <div>
          <label>都道府県コード (area)</label>
          <input v-model.trim="area" type="text" inputmode="numeric" pattern="[0-9]{2}" maxlength="2" placeholder="13" />
        </div>
        <div>
          <label>言語 (language)</label>
          <select v-model="language">
            <option value="ja">ja (日本語)</option>
            <option value="en">en (英語)</option>
            <option value="">未指定</option>
          </select>
        </div>
        <div>
          <label>APIキー</label>
          <input v-model="subscriptionKey" type="password" maxlength="256" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ここにAPIキーを入力" />
        </div>

        <h3>実際に送信される URL</h3>
        <pre class="api-request-body">{{ fullUrl }}</pre>

        <h3>curl 送信例</h3>
        <pre class="api-request-body">{{ sampleCommand }}</pre>

        <h3>期待されるレスポンス例</h3>
        <pre class="api-response-body">{
  "status": "OK",
  "data": [
    { "id": "13101", "name": "千代田区" },
    { "id": "13102", "name": "中央区" }
  ]
}</pre>
      </div>

      <div class="api-test-form">
        <button @click="testApi" class="submit-btn" type="button" :disabled="isTesting">
          {{ isTesting ? 'テスト中...' : 'XIT002 API を実行' }}
        </button>

        <div v-if="statusMessage" class="status-message">
          <strong>ステータス:</strong> {{ statusMessage }}
        </div>

        <div v-if="formattedResponse" class="api-response">
          <h3>整形レスポンス</h3>
          <pre>{{ formattedResponse }}</pre>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="apiHistory.length > 0" class="api-history">
          <h3>実行履歴</h3>
          <div v-for="entry in apiHistory" :key="entry.id" class="history-entry">
            <p><strong>{{ entry.timestamp }}</strong> - {{ entry.status }}</p>
            <details>
              <summary>リクエスト</summary>
              <pre>{{ entry.request }}</pre>
            </details>
            <details>
              <summary>レスポンス</summary>
              <pre>{{ entry.response }}</pre>
            </details>
          </div>
        </div>
      </div>
    </section>
  `
};