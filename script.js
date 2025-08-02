let autoRefreshInterval = null;
let earthquakeData = [];

function getMagnitudeClass(magnitude) {
    if (magnitude < 3) return 'mag-mini';
    if (magnitude < 4) return 'mag-minor';
    if (magnitude < 5) return 'mag-light';
    if (magnitude < 6) return 'mag-moderate';
    if (magnitude < 7) return 'mag-strong';
    if (magnitude < 8) return 'mag-major';
    return 'mag-great';
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

function calculateStats(earthquakes) {
    const total = earthquakes.length;
    const avgMagnitude = total > 0 ? (earthquakes.reduce((sum, eq) => sum + eq.properties.mag, 0) / total).toFixed(1) : 0;
    const maxMagnitude = total > 0 ? Math.max(...earthquakes.map(eq => eq.properties.mag)).toFixed(1) : 0;
    const recentCount = earthquakes.filter(eq => Date.now() - eq.properties.time < 86400000).length;

    return { total, avgMagnitude, maxMagnitude, recentCount };
}

function displayStats(stats) {
    const statsContainer = document.getElementById('stats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">総地震数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.maxMagnitude}</div>
            <div class="stat-label">最大マグニチュード</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgMagnitude}</div>
            <div class="stat-label">平均マグニチュード</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.recentCount}</div>
            <div class="stat-label">過去24時間</div>
        </div>
    `;
}

async function loadEarthquakes() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('earthquakeGrid');
    const noData = document.getElementById('noData');

    loading.style.display = 'block';
    error.style.display = 'none';
    grid.innerHTML = '';
    noData.style.display = 'none';

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
        }

        // URLパラメータを正しい形式で構築
        const params = new URLSearchParams({
            format: 'geojson',
            starttime: starttime,
            endtime: endtime,
            orderby: 'time',
            limit: '100'
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
            displayEarthquakes(earthquakeData);
        }

        const stats = calculateStats(earthquakeData);
        displayStats(stats);

    } catch (err) {
        error.textContent = `エラーが発生しました: ${err.message}`;
        error.style.display = 'block';
        console.error('地震データの取得に失敗:', err);
    } finally {
        loading.style.display = 'none';
    }
}

function displayEarthquakes(earthquakes) {
    const grid = document.getElementById('earthquakeGrid');
    
    grid.innerHTML = earthquakes.map(earthquake => {
        const props = earthquake.properties;
        const coords = earthquake.geometry.coordinates;
        const magnitude = props.mag;
        const place = props.place || '不明な場所';
        const time = props.time;
        const depth = coords[2];
        
        return `
            <div class="earthquake-card">
                <div class="magnitude ${getMagnitudeClass(magnitude)}">
                    ${magnitude.toFixed(1)}
                </div>
                <div class="earthquake-info">
                    <h3>${place}</h3>
                    <div class="earthquake-details">
                        <div class="detail-item">
                            <span class="detail-label">マグニチュード</span>
                            <span class="detail-value">M${magnitude.toFixed(1)} (${getMagnitudeLabel(magnitude)})</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">深さ</span>
                            <span class="detail-value">${depth.toFixed(1)} km</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">緯度</span>
                            <span class="detail-value">${coords[1].toFixed(3)}°</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">経度</span>
                            <span class="detail-value">${coords[0].toFixed(3)}°</span>
                        </div>
                    </div>
                    <div class="earthquake-time">
                        ${formatDate(time)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
    loadEarthquakes();
});
