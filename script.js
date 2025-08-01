const earthquakeListElement = document.getElementById('earthquake-list');

// APIのエンドポイント (XML形式)
const apiEndpoint = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';

function fetchEarthquakes() {
  fetch(apiEndpoint)
    .then(response => response.text()) // XMLとしてテキストを取得
    .then(xmlString => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      // データの処理と表示
      displayEarthquakes(xmlDoc);
    })
    .catch(error => {
      console.error('データ取得エラー:', error);
      earthquakeListElement.innerHTML = '<p>データ取得に失敗しました。</p>';
    });
}

function displayEarthquakes(xmlDoc) {
  earthquakeListElement.innerHTML = ''; // 既存の地震情報をクリア

  const earthquakeItems = xmlDoc.querySelectorAll('eq'); // eq要素を全て選択

  if (earthquakeItems && earthquakeItems.length > 0) {
    earthquakeItems.forEach(earthquakeItem => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('earthquake-item');

      const timeElement = earthquakeItem.querySelector('time');
      const locationElement = earthquakeItem.querySelector('location');
      const magnitudeElement = earthquakeItem.querySelector('magnitude');
      const intensityElement = earthquakeItem.querySelector('intensity'); // 震度情報

      let message = "";
      if (timeElement) {
        message += `発生日時: ${new Date(timeElement.textContent)}<br>`;
      }
      if (locationElement) {
        message += `震源地: ${locationElement.textContent}<br>`;
      }
      if (magnitudeElement) {
        message += `マグニチュード: ${magnitudeElement.textContent}<br>`;
      }

      if(intensityElement){
          message += `最大震度: ${intensityElement.textContent}<br>`
      }


      itemDiv.innerHTML = message;
      earthquakeListElement.appendChild(itemDiv);
    });
  } else {
    earthquakeListElement.innerHTML = '<p>地震情報はありません。</p>';
  }
}

// 初回読み込みと定期的な更新
fetchEarthquakes();
setInterval(fetchEarthquakes, 60000); // 60秒ごとに更新 (APIの利用制限に注意)
