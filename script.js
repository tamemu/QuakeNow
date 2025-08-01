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
    // テーブルの作成
    const table = document.createElement('table');
    table.classList.add('earthquake-table');

    // テーブルヘッダーの作成
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.insertCell().textContent = '発生日時';
    headerRow.insertCell().textContent = '震源地';
    headerRow.insertCell().textContent = 'マグニチュード';
    headerRow.insertCell().textContent = '最大震度';

    // テーブルボディの作成
    const tbody = table.createTBody();

    earthquakeItems.forEach(earthquakeItem => {
      const row = tbody.insertRow();

      const timeElement = earthquakeItem.querySelector('time');
      const locationElement = earthquakeItem.querySelector('location');
      const magnitudeElement = earthquakeItem.querySelector('magnitude');
      const intensityElement = earthquakeItem.querySelector('intensity'); // 震度情報

      row.insertCell().textContent = timeElement ? new Date(timeElement.textContent) : '-';
      row.insertCell().textContent = locationElement ? locationElement.textContent : '-';
      row.insertCell().textContent = magnitudeElement ? magnitudeElement.textContent : '-';
      row.insertCell().textContent = intensityElement ? intensityElement.textContent : '-';
    });

    earthquakeListElement.appendChild(table);
  } else {
    earthquakeListElement.innerHTML = '<p>地震情報はありません。</p>';
  }
}

// 初回読み込みと定期的な更新
fetchEarthquakes();
setInterval(fetchEarthquakes, 60000); // 60秒ごとに更新 (APIの利用制限に注意)
