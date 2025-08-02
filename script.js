let autoRefreshInterval = null;
let earthquakeData = [];
let map = null;
let markersLayer = null;
let selectedEarthquakeId = null;

function getMagnitudeClass(magnitude) {
    if (magnitude < 3) return 'mag-mini';
    if (magnitude < 4) return 'mag-minor';
    if (magnitude < 5) return 'mag-light';
    if (magnitude < 6) return 'mag-moderate';
    if (magnitude < 7) return 'mag-strong';
    if (magnitude < 8) return 'mag-major';
    return 'mag-great';
}

function getMagnitudeColor(magnitude) {
    if (magnitude < 3) return '#28a745';
    if (magnitude < 4) return '#ffc107';
    if (magnitude < 5) return '#fd7e14';
    if (magnitude < 6) return '#dc3545';
    if (magnitude < 7) return '#6f42c1';
    if (magnitude < 8) return '#e83e8c';
    return '#dc3545';
}

function getMagnitudeRadius(magnitude) {
    return Math.max(4, magnitude * 3);
}

function getMagnitudeLabel(magnitude) {
    if (magnitude < 3) return 'Mini';
    if (magnitude < 4) return 'Minor';
    if (magnitude < 5) return 'Light';
    if (magnitude < 6) return 'Moderate';
    if (magnitude < 7) return 'Strong';
    if (magnitude < 8) return 'Major';
    return 'Great';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
        return `${minutes}分前`;
    } else if (hours < 24) {
        return `${hours}時間前`;
    } else if (days < 7) {
        return `${days}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function translateLocation(location) {
    if (!location) return '不明な場所';
    
    let translated = location;
    
    // 方角の翻訳
    translated = translated.replace(/\bN\b/g, '北');
    translated = translated.replace(/\bS\b/g, '南');
    translated = translated.replace(/\bE\b/g, '東');
    translated = translated.replace(/\bW\b/g, '西');
    translated = translated.replace(/\bNE\b/g, '北東');
    translated = translated.replace(/\bNW\b/g, '北西');
    translated = translated.replace(/\bSE\b/g, '南東');
    translated = translated.replace(/\bSW\b/g, '南西');
    translated = translated.replace(/\bESE\b/g, '東南東');
    translated = translated.replace(/\bSSE\b/g, '南南東');
    translated = translated.replace(/\bENE\b/g, '東北東');
    translated = translated.replace(/\bSSW\b/g, '南南西');
    translated = translated.replace(/\bWNW\b/g, '西北西');
    translated = translated.replace(/\bNNW\b/g, '北北西');
    
    // 前置詞・接続詞の翻訳
    translated = translated.replace(/\bof\b/g, 'の');
    translated = translated.replace(/\bnear\b/g, '付近');
    translated = translated.replace(/\boffshore\b/g, '沖');
    translated = translated.replace(/\bonshore\b/g, '陸上');
    translated = translated.replace(/\bthe\b/g, '');
    
    // 国名・地域名の翻訳
    const countryTranslations = {
        'Japan': '日本',
        'China': '中国',
        'South Korea': '韓国',
        'North Korea': '北朝鮮',
        'Taiwan': '台湾',
        'Philippines': 'フィリピン',
        'Indonesia': 'インドネシア',
        'Thailand': 'タイ',
        'Vietnam': 'ベトナム',
        'Malaysia': 'マレーシア',
        'Singapore': 'シンガポール',
        'Myanmar': 'ミャンマー',
        'Cambodia': 'カンボジア',
        'Laos': 'ラオス',
        'Russia': 'ロシア',
        'Mongolia': 'モンゴル',
        'United States': 'アメリカ',
        'USA': 'アメリカ',
        'Mexico': 'メキシコ',
        'Canada': 'カナダ',
        'Chile': 'チリ',
        'Peru': 'ペルー',
        'Ecuador': 'エクアドル',
        'Colombia': 'コロンビア',
        'Brazil': 'ブラジル',
        'Argentina': 'アルゼンチン',
        'Bolivia': 'ボリビア',
        'Venezuela': 'ベネズエラ',
        'Turkey': 'トルコ',
        'Greece': 'ギリシャ',
        'Italy': 'イタリア',
        'Spain': 'スペイン',
        'Portugal': 'ポルトガル',
        'France': 'フランス',
        'Germany': 'ドイツ',
        'United Kingdom': 'イギリス',
        'Norway': 'ノルウェー',
        'Sweden': 'スウェーデン',
        'Finland': 'フィンランド',
        'Iceland': 'アイスランド',
        'Iran': 'イラン',
        'Iraq': 'イラク',
        'Afghanistan': 'アフガニスタン',
        'Pakistan': 'パキスタン',
        'India': 'インド',
        'Nepal': 'ネパール',
        'Bangladesh': 'バングラデシュ',
        'Sri Lanka': 'スリランカ',
        'New Zealand': 'ニュージーランド',
        'Australia': 'オーストラリア',
        'Papua New Guinea': 'パプアニューギニア',
        'Fiji': 'フィジー',
        'Vanuatu': 'バヌアツ',
        'Solomon Islands': 'ソロモン諸島',
        'Tonga': 'トンガ',
        'Samoa': 'サモア',
        'Alaska': 'アラスカ',
        'California': 'カリフォルニア',
        'Nevada': 'ネバダ',
        'Oregon': 'オレゴン',
        'Washington': 'ワシントン',
        'Hawaii': 'ハワイ',
        'Puerto Rico': 'プエルトリコ',
        'Greenland': 'グリーンランド'
    };
    
    // 日本の都道府県・地域名
    const japanRegions = {
        'Honshu': '本州',
        'Kyushu': '九州',
        'Shikoku': '四国',
        'Hokkaido': '北海道',
        'Okinawa': '沖縄',
        'Tokyo': '東京',
        'Osaka': '大阪',
        'Kyoto': '京都',
        'Nagoya': '名古屋',
        'Yokohama': '横浜',
        'Kobe': '神戸',
        'Fukuoka': '福岡',
        'Sendai': '仙台',
        'Hiroshima': '広島',
        'Kumamoto': '熊本',
        'Kagoshima': '鹿児島',
        'Miyazaki': '宮崎',
        'Oita': '大分',
        'Saga': '佐賀',
        'Nagasaki': '長崎'
    };
    
    // 海洋・地理的特徴
    const geographicTerms = {
        'Pacific Ocean': '太平洋',
        'Sea': '海',
        'Bay': '湾',
        'Gulf': '湾',
        'Strait': '海峡',
        'Channel': '海峡',
        'Island': '島',
        'Islands': '諸島',
        'Peninsula': '半島',
        'Ridge': '海嶺',
        'Trench': '海溝',
        'Basin': '海盆',
        'Plateau': '高原',
        'Plain': '平原',
        'Coast': '海岸',
        'Shore': '沿岸'
    };
    
    // 翻訳辞書を統合
    const allTranslations = { ...countryTranslations, ...japanRegions, ...geographicTerms };
    
    // 翻訳を適用
    Object.entries(allTranslations).forEach(([english, japanese]) => {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translated = translated.replace(regex, japanese);
    });
    
    // 数字+km の表記を処理
    translated = translated.replace(/(\d+)\s*km/g, '$1km');
    
    // 余分な空白を削除
    translated = translated.replace(/\s+/g, ' ').trim();
    
    // 空の場合は元の文字列を返す
    return translated || location;
}

function initializeMap() {
    if (!map) {
        map = L.map('map').setView([35.6762, 139.6503], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        markersLayer = L.layerGroup().addTo(map);
    }
}

function updateMap(earthquakes) {
    if (!map) return;
    
    markersLayer.clearLayers();
    
    earthquakes.forEach((earthquake, index) => {
        const props = earthquake.properties;
        const coords = earthquake.geometry.coordinates;
        const magnitude = props.mag;
        const place = translateLocation(props.place) || '不明な場所';
        
        const marker = L.circleMarker([coords[1], coords[0]], {
            radius: getMagnitudeRadius(magnitude),
            fillColor: getMagnitudeColor(magnitude),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${place}</h3>
                <p style="margin: 5px 0;"><strong>マグニチュード:</strong> M${magnitude.toFixed(1)}</p>
                <p style="margin: 5px 0;"><strong>深さ:</strong> ${coords[2].toFixed(1)} km</p>
                <p style="margin: 5px 0;"><strong>時刻:</strong> ${formatDate(props.time)}</p>
                <p style="margin: 5px 0;"><strong>座標:</strong> ${coords[1].toFixed(3)}°, ${coords[0].toFixed(3)}°</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.earthquakeId = props.id || index;
        
        marker.on('click', function() {
            selectEarthquake(this.earthquakeId);
        });
        
        markersLayer.addLayer(marker);
    });
    
    if (earthquakes.length > 0) {
        const group = new L.featureGroup(markersLayer.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function selectEarthquake(earthquakeId) {
    selectedEarthquakeId = earthquakeId;
    
    // リストのアイテムを選択状態に
    document.querySelectorAll('.earthquake-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.earthquakeId === earthquakeId.toString()) {
            item.classList.add('selected');
            
            // リストコンテナ内でスクロール（ページ全体はスクロールしない）
            const listContainer = document.querySelector('.earthquake-list');
            if (listContainer) {
                const itemRect = item.getBoundingClientRect();
                const containerRect = listContainer.getBoundingClientRect();
                
                // アイテムがコンテナの可視範囲外にある場合のみスクロール
                if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
                    const scrollTop = listContainer.scrollTop + (itemRect.top - containerRect.top) - 50;
                    listContainer.scrollTo({
                        top: scrollTop,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
    
    // マップ上の対応するマーカーのポップアップを開く
    markersLayer.eachLayer(function(marker) {
        if (marker.earthquakeId === earthquakeId) {
            marker.openPopup();
        }
    });
}

async function loadEarthquakes() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const noData = document.getElementById('noData');

    if (!loading || !error || !noData) {
        console.error('Required DOM elements not found');
        return;
    }

    loading.style.display = 'block';
    error.style.display = 'none';
    noData.style.display = 'none';

    // リストをクリア
    const list = document.getElementById('earthquakeList');
    if (list) {
        list.innerHTML = '';
    }

    // 統計カードが残っている場合は削除
    const statsContainer = document.getElementById('stats');
    if (statsContainer) {
        statsContainer.remove();
    }

    try {
        const timeRange = document.getElementById('timeRange')?.value || 'day';
        const minMagnitude = document.getElementById('minMagnitude')?.value || '0';

        // USGSのAPIは現在時刻より未来の時刻を受け付けないため、現在時刻を使用
        const now = new Date();
        const endtime = now.toISOString();
        let starttime;
        
        switch(timeRange) {
            case 'day':
                starttime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'week':
                starttime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'month':
                starttime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case '3months':
                starttime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case '6months':
                starttime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'year':
                starttime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
                break;
            default:
                starttime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        }

        // URLパラメータを正しい形式で構築
        const params = new URLSearchParams({
            format: 'geojson',
            starttime: starttime,
            endtime: endtime,
            orderby: 'time'
        });
        
        if (minMagnitude > 0) {
            params.append('minmagnitude', minMagnitude);
        }
        
        const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`;
        console.log('リクエストURL:', url); // デバッグ用

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTPエラー: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        earthquakeData = data.features || [];

        if (earthquakeData.length === 0) {
            noData.style.display = 'block';
        } else {
            displayEarthquakesList(earthquakeData);
            updateMap(earthquakeData);
        }

    } catch (err) {
        if (error) {
            error.textContent = `エラーが発生しました: ${err.message}`;
            error.style.display = 'block';
        }
        console.error('地震データの取得に失敗:', err);
    } finally {
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

function displayEarthquakesList(earthquakes) {
    const list = document.getElementById('earthquakeList');
    if (!list) {
        console.warn('Earthquake list container not found');
        return;
    }
    
    list.innerHTML = earthquakes.map((earthquake, index) => {
        const props = earthquake.properties;
        const coords = earthquake.geometry.coordinates;
        const magnitude = props.mag;
        const place = translateLocation(props.place) || '不明な場所';
        const time = props.time;
        const depth = coords[2];
        const earthquakeId = props.id || index;
        
        return `
            <div class="earthquake-item" data-earthquake-id="${earthquakeId}" onclick="selectEarthquake(${earthquakeId})">
                <div class="item-header">
                    <div class="item-magnitude ${getMagnitudeClass(magnitude)}">
                        ${magnitude.toFixed(1)}
                    </div>
                    <div class="item-location">${place}</div>
                    <div class="item-time">${formatDate(time)}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <span class="item-detail-label">深さ</span>
                        <span class="item-detail-value">${depth.toFixed(1)} km</span>
                    </div>
                    <div class="item-detail">
                        <span class="item-detail-label">緯度</span>
                        <span class="item-detail-value">${coords[1].toFixed(3)}°</span>
                    </div>
                    <div class="item-detail">
                        <span class="item-detail-label">経度</span>
                        <span class="item-detail-value">${coords[0].toFixed(3)}°</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function sortEarthquakes(sortBy) {
    if (!earthquakeData || earthquakeData.length === 0) return;
    
    const sortedData = [...earthquakeData];
    
    if (sortBy === 'magnitude') {
        sortedData.sort((a, b) => b.properties.mag - a.properties.mag);
    } else {
        sortedData.sort((a, b) => b.properties.time - a.properties.time);
    }
    
    displayEarthquakesList(sortedData);
    updateMap(sortedData);
}

function toggleAutoRefresh() {
    const toggle = document.getElementById('autoRefreshToggle');
    const status = document.getElementById('refreshStatus');
    const intervalSelect = document.getElementById('refreshInterval');
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        toggle.classList.remove('active');
        status.textContent = 'オフ';
        intervalSelect.disabled = false;
    } else {
        const intervalSeconds = parseInt(intervalSelect.value);
        const intervalMs = intervalSeconds * 1000;
        
        autoRefreshInterval = setInterval(loadEarthquakes, intervalMs);
        toggle.classList.add('active');
        
        let intervalText;
        if (intervalSeconds < 60) {
            intervalText = `${intervalSeconds}秒間隔`;
        } else {
            intervalText = `${intervalSeconds / 60}分間隔`;
        }
        status.textContent = `オン (${intervalText})`;
        intervalSelect.disabled = true;
    }
}

// 初回読み込み
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // 必要な要素の存在確認
    const requiredElements = ['map', 'earthquakeList', 'loading', 'error', 'noData'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }
    
    // マップ初期化
    try {
        initializeMap();
        console.log('Map initialized');
    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
    
    // 地震データ読み込み
    loadEarthquakes();
    
    // ソートボタンのイベントリスナー
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // アクティブ状態を切り替え
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // ソート実行
            const sortBy = this.dataset.sort;
            sortEarthquakes(sortBy);
        });
    });
    
    // 更新頻度変更のイベントリスナー
    const intervalSelect = document.getElementById('refreshInterval');
    if (intervalSelect) {
        intervalSelect.addEventListener('change', function() {
            // 自動更新が有効な場合は新しい頻度で再開
            const toggle = document.getElementById('autoRefreshToggle');
            if (toggle && toggle.classList.contains('active')) {
                // 一度停止
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                }
                
                // 新しい頻度で再開
                const intervalSeconds = parseInt(this.value);
                const intervalMs = intervalSeconds * 1000;
                autoRefreshInterval = setInterval(loadEarthquakes, intervalMs);
                
                // ステータス更新
                const status = document.getElementById('refreshStatus');
                let intervalText;
                if (intervalSeconds < 60) {
                    intervalText = `${intervalSeconds}秒間隔`;
                } else {
                    intervalText = `${intervalSeconds / 60}分間隔`;
                }
                status.textContent = `オン (${intervalText})`;
            }
        });
    }
});

