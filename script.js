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
  earthquakeListElement.innerHTML = ''; // 既存の地震情報をクリア

  if (data && data.results && data.results.length > 0) {
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

    data.results.forEach(earthquake => {
      const row = tbody.insertRow();

      row.insertCell().textContent = earthquake.time ? new Date(earthquake.time) : '-';
      row.insertCell().textContent = earthquake.place ? earthquake.place : '-';
      row.insertCell().textContent = earthquake.magnitude ? earthquake.magnitude : '-';
      row.insertCell().textContent = earthquake.maxIntensity ? earthquake.maxIntensity : '-';
    });

    earthquakeListElement.appendChild(table);
  } else {
    earthquakeListElement.innerHTML = '<p>地震情報はありません。</p>';
  }
}

function displayEarthquakes(data) {
  earthquakeListElement.innerHTML = ''; // 既存の地震情報をクリア

  if (data && data.results && data.results.length > 0) {
    console.log("取得したデータ:", data); // データの内容をコンソールに出力

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

    data.results.forEach(earthquake => {
      const row = tbody.insertRow();

      row.insertCell().textContent = earthquake.time ? new Date(earthquake.time) : '-';
      row.insertCell().textContent = earthquake.place ? earthquake.place : '-';
      row.insertCell().textContent = earthquake.magnitude ? earthquake.magnitude : '-';
      row.insertCell().textContent = earthquake.maxIntensity ? earthquake.maxIntensity : '-';
    });

    earthquakeListElement.appendChild(table);
  } else {
    console.log("地震情報はありませんでした。"); // データがない場合のメッセージをコンソールに出力
    earthquakeListElement.innerHTML = '<p>地震情報はありません。</p>';
  }
}


// 初回読み込みと定期的な更新
fetchEarthquakes();
setInterval(fetchEarthquakes, 60000); // 60秒ごとに更新 (APIの利用制限に注意)
