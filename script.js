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

  console.log("取得したデータ:", data); // データの内容をコンソールに出力

  if (data && Array.isArray(data)) { // data が配列であることを確認
    for (let i = 0; i < data.length; i++) {
      const earthquake = data[i].earthquake; // earthquakeオブジェクトを取得

      if (earthquake) {
        const time = earthquake.time;
        // 震源地の説明として、地震オブジェクトのhypocenter.nameを使用
        const place = earthquake.hypocenter.name;
        // マグニチュードを取得
        const magnitude = earthquake.hypocenter.magnitude;
        const maxScale = earthquake.maxScale;

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

        const row = tbody.insertRow();

        row.insertCell().textContent = time ? new Date(time) : '-';
        row.insertCell().textContent = place ? place : '-';
        row.insertCell().textContent = magnitude ? magnitude : '-';
        row.insertCell().textContent = maxScale ? maxScale : '-';


        earthquakeListElement.appendChild(table);
      } else {
        console.warn(`地震情報がありません: ${data[i]}`); // データ全体を警告として出力
        // earthquakeListElement.innerHTML += '<p>地震情報はありません。</p>';  // 各イベントごとにエラーメッセージを表示する場合
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
