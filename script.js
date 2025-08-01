const earthquakeListElement = document.getElementById('earthquake-list');

// APIのエンドポイント (JSON形式)
const apiEndpoint = 'https://api.p2pquake.net/v2/jma/quake';

function fetchEarthquakes() {
  fetch(apiEndpoint)
    .then(response => response.json()) // JSONとしてデータを取得
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
  const earthquakeListElement = document.getElementById('earthquake-list');
  earthquakeListElement.innerHTML = ''; // 既存の地震情報をクリア

  if (data && Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const earthquake = data[i].earthquake;

      if (earthquake) {
        const time = earthquake.time;
        const place = earthquake.hypocenter.name;
        const magnitude = earthquake.hypocenter.magnitude;
        const maxScale = earthquake.maxScale;

        // カードを作成
        const cardElement = document.createElement('div');
        cardElement.classList.add('earthquake-card', 'col-md-12'); // Bootstrapのクラスを追加

        // カードの内容を構築
        let cardContent = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${place}</h5>
              <p class="card-text">マグニチュード: ${magnitude}</p>
              <p class="card-text">最大震度: ${maxScale}</p>
              <small class="text-muted earthquake-time">${new Date(time).toLocaleString()}</small>
            </div>
          </div>
        `;

        cardElement.innerHTML = cardContent;
        earthquakeListElement.appendChild(cardElement);
      } else {
        console.warn(`地震情報がありません: ${data[i]}`);
      }
    }
  } else {
    console.log("データが配列ではありませんでした。");
    earthquakeListElement.innerHTML = '<p>データが正しくありません。</p>';
  }
}



// 初回読み込みと定期的な更新
fetchEarthquakes();
setInterval(fetchEarthquakes, 60000); // 60秒ごとに更新 (APIの利用制限に注意)
