const earthquakeListElement = document.getElementById('earthquake-list');

// APIのエンドポイント (最新の地震情報)
const apiEndpoint = 'https://www.data.jma.go.jp/developer/json/eq_earlywarning/current.json';

function fetchEarthquakes() {
  fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => {
      // データの処理と表示
      displayEarthquakes(data);
    })
    .catch(error => {
      console.error('データ取得エラー:', error);
      earthquakeListElement.innerHTML = '<p>データ取得に失敗しました。</p>';
    });
}

function displayEarthquakes(data) {
  earthquakeListElement.innerHTML = ''; // 既存の地震情報をクリア

  if (data && data.result && data.result.length > 0) {
    data.result.forEach(earthquake => {
      const earthquakeItem = document.createElement('div');
      earthquakeItem.classList.add('earthquake-item');

      let message = `発生日時: ${new Date(earthquake.created)}<br>`;
      message += `震源地: ${earthquake.location}<br>`;
      message += `マグニチュード: ${earthquake.magnitude}<br>`;

      if (earthquake.intensity) {
        message += `最大震度: ${earthquake.intensity} (${earthquake.intensityType})<br>`;
      }

      earthquakeItem.innerHTML = message;
      earthquakeListElement.appendChild(earthquakeItem);
    });
  } else {
    earthquakeListElement.innerHTML = '<p>地震情報はありません。</p>';
  }
}


// 初回読み込みと定期的な更新
fetchEarthquakes();
setInterval(fetchEarthquakes, 60000); // 60秒ごとに更新 (APIの利用制限に注意)
