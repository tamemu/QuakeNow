// 地図の初期化
var map = L.map('map').setView([37.8, 139.7], 5); // 東京を中央に設定

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

function displayEarthquakes(data) {
  const earthquakeListElement = document.getElementById('earthquake-list');
  const detailModal = new bootstrap.Modal(document.getElementById('detailModal')); // モーダルインスタンスを作成
  earthquakeListElement.innerHTML = '';

  if (data && Array.isArray(data)) {
    let filteredData = data; // フィルタリングされたデータ

    // マグニチュードフィルターの適用
    const magnitudeFilterValue = document.getElementById('magnitudeFilter').value;
    if (magnitudeFilterValue > 0) {
      filteredData = data.filter(item => item.earthquake.hypocenter.magnitude >= magnitudeFilterValue);
    }

    for (let i = 0; i < filteredData.length; i++) {
      const earthquake = filteredData[i].earthquake;

      if (earthquake) {
        const time = earthquake.time;
        const place = earthquake.hypocenter.name;
        const magnitude = earthquake.hypocenter.magnitude;
        const maxScale = earthquake.maxScale;
        const latitude = earthquake.latitude;
        const longitude = earthquake.longitude;

        // カードを作成
        const cardElement = document.createElement('div');
        cardElement.classList.add('earthquake-card', 'col-md-12');

        // カードの内容を構築
        let cardContent = `
          <div class="card" data-bs-toggle="modal" data-bs-target="#detailModal">
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

        // 地図上にマーカーを追加
        L.marker([latitude, longitude]).addTo(map)
          .bindPopup(`<b>場所:</b> ${place}<br><b>マグニチュード:</b> ${magnitude}`)
          .openPopup();
      } else {
        console.warn(`地震情報がありません: ${data[i]}`);
      }
    }
  } else {
    console.log("データが配列ではありませんでした。");
    earthquakeListElement.innerHTML = '<p>データが正しくありません。</p>';
  }
}

// 詳細モーダルに表示する情報を設定
document.addEventListener('DOMContentLoaded', function() {
  const earthquakeCards = document.querySelectorAll('.card');
  earthquakeCards.forEach(card => {
    card.addEventListener('click', function() {
      const dataIndex = card.closest('.row').children.indexOf(card); // カードのインデックスを取得

      if (data) {
        const earthquake = data[dataIndex].earthquake;
        const detailContentElement = document.getElementById('detailContent');
        let detailHTML = `
          <h2>${earthquake.hypocenter.name}</h2>
          <p>マグニチュード: ${earthquake.hypocenter.magnitude}</p>
          <p>最大震度: ${earthquake.maxScale}</p>
          <p>震源地: ${earthquake.latitude}, ${earthquake.longitude}</p>
          <!-- 他の地震詳細情報 -->
        `;
        detailContentElement.innerHTML = detailHTML;

        // モーダルを表示
        detailModal.show();
      }
    });
  });
});

// リアルタイム更新 (例: 5秒ごとに)
setInterval(function() {
  // ここで地震データを取得して表示を更新する処理を記述
}, 5000);
