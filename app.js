'use strict';
// モジュールを呼び出す
const fs = require('fs');
const readline = require('readline');
// ファイルの読み込みを行うStreamを生成
const rs = fs.ReadStream('./popu-pref.csv');
// 上記Streamをインプットとしてrlオブジェクトを作成
const rl = readline.createInterface({'input': rs, 'output': {}});
// key: 都道府県 & value: 集計データのオブジェクト　(連想配列という)
const map = new Map();
// lineイベントが発生したらこの無名関数を呼ぶ
rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture);
        // まだ集計していない都道府県ならデータを初期化
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        // 2010 北海道　男　A人，2010　北海道　女　B人，...
        // みたいに入ってくるから男女で合計する
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
rl.resume();
rl.on('close', () => {
    // MapやArrayの中身をpairに代入してループできる．pair[0]は都道府県
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    // Arrayにmapを渡して普通の配列にする
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        // 返り値の正負で順番を入れ替える(この場合は降順)
        // 並び替えに使う値と昇降を指定してる感じかな
        return pair2[1].change - pair1[1].change;
    });
    // Python的map関数
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率' + pair[1].change;
    });
    console.log(rankingStrings);
});