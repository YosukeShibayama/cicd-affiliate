import Xit002TestView from './components/Xit002TestView.js';

const { createApp } = Vue;

createApp({
  name: 'XIT002ApiTestApp',
  components: {
    Xit002TestView
  },
  template: `
    <div class="page">
      <header class="header">
        <h1>XIT002 API テストページ</h1>
        <p>不動産情報ライブラリの XIT002 API（都道府県内市区町村一覧取得）を試せます。</p>
      </header>
      <section class="container">
        <xit002-test-view />
      </section>
      <footer class="footer">
        <p><a href="index.html">戻る</a></p>
      </footer>
    </div>
  `
}).mount('#app');
