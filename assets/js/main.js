// Real Estate Price Forecast System
// 不動産価格推移予測システム

const API_BASE_URL = 'https://api.realestate-lib.example.com';

const form = document.querySelector('#propertyForm');
const resultSection = document.querySelector('#resultSection');
const errorMessage = document.querySelector('#errorMessage');

// API連携: 不動産情報ライブラリから価格予測データを取得
async function fetchPriceForecast(propertyData) {
  try {
    // 実際のAPIエンドポイント（バックエンドが提供）
    const response = await fetch(`${API_BASE_URL}/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData)
    }).catch(() => {
      // API未接続時の代替処理
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      return data;
    }

    // APIが接続できない場合は、ローカル予測エンジンを使用
    return generateLocalForecast(propertyData);
  } catch (error) {
    console.error('API Error:', error);
    return generateLocalForecast(propertyData);
  }
}

// ローカル予測エンジン（APIが接続できない場合の代替）
function generateLocalForecast(propertyData) {
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
    'osaka': 0.92,
    'kyoto': 0.90,
    'other': 0.85
  }[location] || 0.9;
  
  depreciationRate *= locationMultiplier;
  depreciationRate = Math.min(depreciationRate, 0.05); // 最大5%の年率に制限
  
  const forecast = {
    currentPrice,
    forecast: []
  };
  
  let price = currentPrice;
  for (let year = 1; year <= 10; year++) {
    price = price * (1 - depreciationRate);
    forecast.forecast.push({
      year,
      price: Math.round(price * 100) / 100,
      changeRate: ((price - currentPrice) / currentPrice * 100).toFixed(1)
    });
  }
  
  forecast.analysis = generateAnalysis(propertyData, depreciationRate);
  
  return forecast;
}

// 分析情報を生成
function generateAnalysis(propertyData, depreciationRate) {
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
  }
  
  return analysis;
}

// フォーム送信処理
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // フォームデータを取得
  const propertyData = {
    buildingAge: parseInt(document.querySelector('#buildingAge').value),
    squareMeters: parseFloat(document.querySelector('#squareMeters').value),
    distanceToStation: parseFloat(document.querySelector('#distanceToStation').value),
    currentPrice: parseInt(document.querySelector('#currentPrice').value),
    location: document.querySelector('#location').value
  };
  
  // エラーメッセージをクリア
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  
  try {
    // 価格予測を取得（API連携または代替処理）
    const forecast = await fetchPriceForecast(propertyData);
    
    // 結果を表示
    displayResults(forecast, propertyData);
  } catch (error) {
    showError('エラーが発生しました。もう一度お試しください。');
    console.error('Error:', error);
  }
});

// 結果を表示
function displayResults(forecast, propertyData) {
  const { currentPrice } = propertyData;
  const data5Year = forecast.forecast[4]; // 5年後
  const data10Year = forecast.forecast[9]; // 10年後
  
  document.querySelector('#resultCurrentPrice').textContent = currentPrice.toLocaleString();
  document.querySelector('#result5YearPrice').textContent = data5Year.price.toLocaleString();
  document.querySelector('#result5YearChange').textContent = `${data5Year.changeRate}%`;
  document.querySelector('#result10YearPrice').textContent = data10Year.price.toLocaleString();
  document.querySelector('#result10YearChange').textContent = `${data10Year.changeRate}%`;
  
  // 予測テーブルを生成
  const tableBody = document.querySelector('#forecastTableBody');
  tableBody.innerHTML = '';
  forecast.forecast.forEach(item => {
    const row = document.createElement('tr');
    const changeClass = parseFloat(item.changeRate) < 0 ? 'negative' : 'positive';
    row.innerHTML = `
      <td>${item.year}年</td>
      <td>${item.price.toLocaleString()}</td>
      <td class="${changeClass}">${item.changeRate}%</td>
    `;
    tableBody.appendChild(row);
  });
  
  // 分析情報を表示
  const analysisList = document.querySelector('#analysisList');
  analysisList.innerHTML = '';
  forecast.analysis.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    analysisList.appendChild(li);
  });
  
  // 結果セクションを表示
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

// エラーを表示
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}
