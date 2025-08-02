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
        const place = props.place || '不明な場所';
        
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
    switch(region) {
        case 'japan':
function getRegionBounds(region) {
    switch(region) {
        case 'japan':
            return {
                minlatitude: '24',
                maxlatitude: '46', 
                minlongitude: '123',
                maxlongitude: '146'
            };
        case 'pacific':
            return {
                minlatitude: '-60',
                maxlatitude: '60',
                minlongitude: '120',
                maxlongitude: '-60'
            };
        case 'uswest':
            return {
                minlatitude: '32',
                maxlatitude: '49',
                minlongitude: '-125',
                maxlongitude: '-114'
            };
        case 'mediterranean':
            return {
                minlatitude: '30',
                maxlatitude: '47',
                minlongitude: '-6',
                maxlongitude: '42'
            };
        default:
            return null;
    }
}
}

function calculateStats(earthquakes) {
    const total = earthquakes.length;
    const avgMagnitude = total > 0 ? (earthquakes.reduce((sum, eq) => sum + eq.properties.mag, 0) / total).toFixed(1) : 0;
    const maxMagnitude = total > 0 ? Math.max(...earthquakes.map(eq => eq.properties.mag)).toFixed(1) : 0;
    const recentCount = earthquakes.filter(eq => Date.now() - eq.properties.time < 86400000).length;

    return { total, avgMagnitude, maxMagnitude, recentCount };
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
        const timeRange = document.getElementById('timeRange').value;
        const minMagnitude = document.getElementById('minMagnitude').value;
        const region = document.getElementById('region').value;

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
        
        // 地域パラメータを追加
        if (region !== 'global') {
            const regionBounds = getRegionBounds(region);
            if (regionBounds) {
                Object.entries(regionBounds).forEach(([key, value]) => {
                    params.append(key, value);
                });
            }
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
        const place = props.place || '不明な場所';
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
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        toggle.classList.remove('active');
        status.textContent = 'オフ';
    } else {
        autoRefreshInterval = setInterval(loadEarthquakes, 60000); // 1分ごと
        toggle.classList.add('active');
        status.textContent = 'オン (1分間隔)';
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
});
