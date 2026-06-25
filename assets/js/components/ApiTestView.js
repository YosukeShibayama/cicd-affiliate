/**
 * API Test View Component
 * 不動産情報サービスAPI仕様の確認とテストを行う
 */
export default {
  name: 'ApiTestView',
  data() {
    return {
      endpoint: 'https://api.realestate-lib.example.com/forecast',
      requestBody: JSON.stringify({
        buildingAge: 10,
        squareMeters: 80,
        distanceToStation: 5,
        currentPrice: 3500,
        location: 'tokyo'
      }, null, 2),
      responseBody: '',
      formattedResponse: '',
      statusMessage: '',
      isTesting: false,
      error: '',
      apiHistory: []
    };
  },
  methods: {
    formatJson(value) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    },
    formatRequestBody() {
      try {
        const parsed = JSON.parse(this.requestBody);
        this.requestBody = JSON.stringify(parsed, null, 2);
        this.error = '';
      } catch (err) {
        this.error = `JSON 形式が無効です: ${err.message}`;
      }
    },
    async testApi() {
      this.statusMessage = '';
      this.responseBody = '';
      this.formattedResponse = '';
      this.error = '';
      this.isTesting = true;

      let body;
      try {
        body = JSON.parse(this.requestBody);
      } catch (err) {
        this.error = `JSON 形式が無効です: ${err.message}`;
        this.isTesting = false;
        return;
      }

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        const text = await response.text();
        this.responseBody = text;
        this.formattedResponse = this.formatJson(text);
        this.statusMessage = `${response.status} ${response.statusText}`;

        this.apiHistory.unshift({
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          endpoint: this.endpoint,
          request: JSON.stringify(body, null, 2),
          response: this.formattedResponse || text,
          status: this.statusMessage
        });

        if (!response.ok) {
          this.error = `APIエラー: ${response.status} ${response.statusText}`;
        }
      } catch (err) {
        console.error(err);
        this.error = `APIリクエストに失敗しました: ${err.message}`;
      } finally {
        this.isTesting = false;
      }
    }
  },
  template: `
    <section class="api-test-section">
      <h2>API テストビュー</h2>
      <p>以下の仕様で API を検証できます。</p>

      <div class="api-spec">
        <h3>エンドポイント</h3>
        <p><code>{{ endpoint }}</code></p>

        <h3>リクエストボディ</h3>
        <pre class="api-request-body">{{ requestBody }}</pre>

        <h3>レスポンス例</h3>
        <pre class="api-response-body">{
  "currentPrice": 3500,
  "forecast": [
    { "year": 1, "price": 3430, "changeRate": -2.0 },
    { "year": 2, "price": 3360, "changeRate": -4.0 }
  ],
  "analysis": [
    "..." ]
}</pre>
      </div>

      <div class="api-test-form">
        <label for="apiRequestBody">送信データ</label>
        <textarea id="apiRequestBody" v-model="requestBody" rows="10"></textarea>

        <div class="api-actions">
          <button @click="formatRequestBody" class="submit-btn" type="button" :disabled="isTesting">
            リクエストを整形
          </button>
          <button @click="testApi" class="submit-btn" type="button" :disabled="isTesting">
            {{ isTesting ? 'テスト中...' : 'APIを実行' }}
          </button>
        </div>

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
            <p><strong>エンドポイント:</strong> {{ entry.endpoint }}</p>
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
