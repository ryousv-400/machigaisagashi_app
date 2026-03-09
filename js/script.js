document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('title-screen');
    const gameUi = document.getElementById('game-ui');
    const startButton = document.getElementById('start-button');
    const panelLeft = document.getElementById('panel-left');
    const panelRight = document.getElementById('panel-right');
    const clearScreen = document.getElementById('clear-screen');
    const replayButton = document.getElementById('replay-button');
    const effectContainer = document.getElementById('effect-container');
    const starContainer = document.getElementById('star-container');
    let stars = [];

    // ゲーム設定
    let currentLevel = 1;
    const STAGE_TIME_LIMIT = 60; // 各ステージ60秒固定
    let timeRemaining = 0;
    let timerInterval = null;
    let TOTAL_MISTAKES = 3;
    let foundMistakes = 0;
    let isGameOver = false;
    let hintGiven = false;

    // スコア
    let totalScore = 0;
    let stageScore = 0;

    // ステージデータ定義
    const STAGES = [
        {
            level: 1,
            title: "まほうの どうぶつの もり",
            leftImg: "assets/stage1_left.png",
            rightImg: "assets/stage1_right.png",
            mistakes: [
                { id: 1, x: 30.0, y: 20.16, w: 8.12, h: 7.81 },
                { id: 2, x: 3.59, y: 73.91, w: 5.31, h: 6.88 },
                { id: 3, x: 97.58, y: 79.45, w: 3.59, h: 4.53 },
                { id: 4, x: 3.83, y: 32.27, w: 2.66, h: 5.78 }
            ]
        },
        {
            level: 2,
            title: "おひめさまの おしろ",
            leftImg: "assets/stage2_left.png",
            rightImg: "assets/stage2_right.png",
            mistakes: [
                { id: 1, x: 91.8, y: 6.8, w: 11.09, h: 6.09 },
                { id: 2, x: 16.48, y: 31.87, w: 5.47, h: 5.94 },
                { id: 3, x: 20.62, y: 68.28, w: 4.0, h: 4.0 } // 補正: clickしやすいように最小サイズを確保
            ]
        },
        {
            level: 3,
            title: "スイーツと キャンディのくに",
            leftImg: "assets/stage3_left.png",
            rightImg: "assets/stage3_right.png",
            mistakes: [
                { id: 1, x: 31.67, y: 68.33, w: 16.67, h: 23.33 }, // 緑のクマ
                { id: 2, x: 70.42, y: 18.75, w: 29.17, h: 19.17 }, // ドーナツ
                { id: 3, x: 74.17, y: 82.08, w: 12.00, h: 15.00 }  // キャンディ
            ]
        },
        {
            level: 4,
            title: "にんぎょと うみのなかまたち",
            leftImg: "assets/stage4_left.png",
            rightImg: "assets/stage4_right.png",
            mistakes: [
                { id: 1, x: 21.25, y: 76.25, w: 12.0, h: 12.0 }, // 真珠
                { id: 2, x: 67.50, y: 17.08, w: 10.0, h: 10.0 }, // 紫の人魚のヒトデ
                { id: 3, x: 88.33, y: 10.42, w: 20.0, h: 19.17 }, // タコ
                { id: 4, x: 37.5, y: 34.5, w: 10.0, h: 10.0 } // 金髪の人魚の横の星
            ]
        },
        {
            level: 5,
            title: "ようせいの おはなばたけ",
            leftImg: "assets/stage5_left.png",
            rightImg: "assets/stage5_right.png",
            mistakes: [
                { id: 1, x: 6.5, y: 20.4, w: 12.0, h: 12.0 }, // ハチ消えた
                { id: 2, x: 69.2, y: 53.8, w: 10.0, h: 16.0 }, // ドア茶→青
                { id: 3, x: 21.7, y: 75.6, w: 28.0, h: 26.0 } // バラ赤→黄
            ]
        },
        {
            level: 6,
            title: "にじいろ ユニコーン",
            leftImg: "assets/stage6_left.png",
            rightImg: "assets/stage6_right.png",
            mistakes: [
                { id: 1, x: 6.2, y: 21.9, w: 10.0, h: 10.0 }, // ダイヤモンド消えた
                { id: 2, x: 37.1, y: 25.6, w: 8.0, h: 10.0 }, // ツノ色変化
                { id: 3, x: 10.0, y: 45.0, w: 15.0, h: 15.0 } // 雲の色変化
            ]
        },
        {
            level: 7,
            title: "猫カフェの午後",
            leftImg: "assets/stage7_left.png",
            rightImg: "assets/stage7_right.png",
            mistakes: [
                { id: 1, x: 33.75, y: 34.17, w: 17.5, h: 11.67 },
                { id: 2, x: 51.67, y: 70.42, w: 15.0, h: 9.17 },
                { id: 3, x: 75.42, y: 75.0, w: 19.17, h: 8.33 }
            ]
        },
        {
            level: 8,
            title: "うさぎのお茶会",
            leftImg: "assets/stage8_left.png",
            rightImg: "assets/stage8_right.png",
            mistakes: [
                { id: 1, x: 65.83, y: 40.42, w: 8.0, h: 8.0 },
                { id: 2, x: 80.83, y: 50.83, w: 21.67, h: 16.67 },
                { id: 3, x: 30.83, y: 61.67, w: 13.33, h: 11.67 },
                { id: 4, x: 59.17, y: 86.25, w: 21.67, h: 19.17 }
            ]
        },
        {
            level: 9,
            title: "ちいさなバレリーナ",
            leftImg: "assets/stage9_left.png",
            rightImg: "assets/stage9_right.png",
            mistakes: [
                { id: 1, x: 75.83, y: 45.0, w: 26.67, h: 35.0 },
                { id: 2, x: 46.67, y: 33.75, w: 8.33, h: 9.17 },
                { id: 3, x: 22.92, y: 67.08, w: 29.17, h: 29.17 }
            ]
        },
        {
            level: 10,
            title: "巨大アイスクリームショップ",
            leftImg: "assets/stage10_left.png",
            rightImg: "assets/stage10_right.png",
            mistakes: [
                { id: 1, x: 83.33, y: 14.17, w: 25.0, h: 16.67 },
                { id: 2, x: 57.5, y: 41.25, w: 15.0, h: 14.17 },
                { id: 3, x: 25.42, y: 40.83, w: 15.83, h: 11.67 }
            ]
        },
        {
            level: 11,
            title: "妖精の花冠",
            leftImg: "assets/stage11_left.png",
            rightImg: "assets/stage11_right.png",
            mistakes: [
                { id: 1, x: 88.33, y: 20.0, w: 20.0, h: 26.67 },
                { id: 2, x: 65.0, y: 91.5, w: 20.0, h: 14.0 },
                { id: 3, x: 15.83, y: 22.92, w: 8.0, h: 8.0 }
            ]
        },
        {
            level: 12,
            title: "子犬の遊び場",
            leftImg: "assets/stage12_left.png",
            rightImg: "assets/stage12_right.png",
            mistakes: [
                { id: 1, x: 48.33, y: 11.25, w: 18.33, h: 17.5 },
                { id: 2, x: 61.25, y: 60.42, w: 15.83, h: 15.83 },
                { id: 3, x: 91.67, y: 68.33, w: 11.67, h: 11.67 }
            ]
        },
        {
            level: 13,
            title: "マジカルサーカス",
            leftImg: "assets/stage13_left.png",
            rightImg: "assets/stage13_right.png",
            mistakes: [
                { id: 1, x: 42.08, y: 78.75, w: 29.17, h: 29.17 },
                { id: 2, x: 69.58, y: 53.33, w: 27.5, h: 25.0 },
                { id: 3, x: 14.17, y: 41.25, w: 10.0, h: 10.83 }
            ]
        },
        {
            level: 14,
            title: "マーメイドの海のお城",
            leftImg: "assets/stage14_left.png",
            rightImg: "assets/stage14_right.png",
            mistakes: [
                { id: 1, x: 10.42, y: 15.0, w: 15.83, h: 13.33 },
                { id: 2, x: 59.58, y: 75.42, w: 39.17, h: 32.5 },
                { id: 3, x: 18.33, y: 67.5, w: 8.0, h: 8.0 }
            ]
        },
        {
            level: 15,
            title: "蝶の庭",
            leftImg: "assets/stage15_left.png",
            rightImg: "assets/stage15_right.png",
            mistakes: [
                { id: 1, x: 58.0, y: 82.2, w: 9.4, h: 9.4 },
                { id: 2, x: 38.5, y: 71.0, w: 7.8, h: 7.8 },
                { id: 3, x: 44.4, y: 14.7, w: 11.9, h: 11.9 }
            ]
        },
        {
            level: 16,
            title: "魔法の図書館",
            leftImg: "assets/stage16_left.png",
            rightImg: "assets/stage16_right.png",
            mistakes: [
                { id: 1, x: 43.6, y: 56.2, w: 8.1, h: 8.1 },
                { id: 2, x: 68.4, y: 87.5, w: 11.2, h: 11.2 },
                { id: 3, x: 76.3, y: 65.9, w: 9.1, h: 9.1 }
            ]
        },
        {
            level: 17,
            title: "雲のお城",
            leftImg: "assets/stage17_left.png",
            rightImg: "assets/stage17_right.png",
            mistakes: [
                { id: 1, x: 13.4, y: 14.1, w: 10.3, h: 10.3 },
                { id: 2, x: 42.8, y: 23.9, w: 6.2, h: 6.2 },
                { id: 3, x: 55.2, y: 52.3, w: 10.3, h: 10.3 },
                { id: 4, x: 32.2, y: 47.0, w: 10.6, h: 10.6 }
            ]
        },
        {
            level: 18,
            title: "さくらの森",
            leftImg: "assets/stage18_left.png",
            rightImg: "assets/stage18_right.png",
            mistakes: [
                { id: 1, x: 85.1, y: 73.7, w: 9.1, h: 9.1 },
                { id: 2, x: 77.7, y: 79.5, w: 10.3, h: 10.3 },
                { id: 3, x: 71.3, y: 86.5, w: 6.6, h: 6.6 }
            ]
        },
        {
            level: 19,
            title: "ふしぎなパン屋",
            leftImg: "assets/stage19_left.png",
            rightImg: "assets/stage19_right.png",
            mistakes: [
                { id: 1, x: 30.8, y: 70.3, w: 8.1, h: 8.1 },
                { id: 2, x: 44.1, y: 15.5, w: 7.2, h: 7.2 },
                { id: 3, x: 73.4, y: 83.0, w: 7.2, h: 7.2 },
                { id: 4, x: 50.5, y: 39.8, w: 6.2, h: 6.2 },
                { id: 5, x: 52.0, y: 27.2, w: 6.9, h: 6.9 }
            ]
        },
        {
            level: 20,
            title: "おとぎの森",
            leftImg: "assets/stage20_left.png",
            rightImg: "assets/stage20_right.png",
            mistakes: [
                { id: 1, x: 45.6, y: 26.6, w: 11.9, h: 11.9 },
                { id: 2, x: 43.0, y: 59.5, w: 12.2, h: 12.2 },
                { id: 3, x: 59.6, y: 72.7, w: 7.2, h: 7.2 },
                { id: 4, x: 77.3, y: 89.0, w: 7.8, h: 7.8 }
            ]
        },
        {
            level: 21,
            title: "クリスタルの洞窟",
            leftImg: "assets/stage21_left.png",
            rightImg: "assets/stage21_right.png",
            mistakes: [
                { id: 1, x: 78.6, y: 34.7, w: 10.6, h: 10.6 },
                { id: 2, x: 82.8, y: 84.4, w: 12.5, h: 12.5 },
                { id: 3, x: 23.8, y: 47.9, w: 12.2, h: 12.2 }
            ]
        },
        {
            level: 22,
            title: "オルゴールの中",
            leftImg: "assets/stage22_left.png",
            rightImg: "assets/stage22_right.png",
            mistakes: [
                { id: 1, x: 61.4, y: 90.8, w: 11.2, h: 11.2 },
                { id: 2, x: 37.0, y: 73.4, w: 7.2, h: 7.2 },
                { id: 3, x: 39.1, y: 17.4, w: 7.8, h: 7.8 },
                { id: 4, x: 79.7, y: 33.8, w: 6.2, h: 6.2 },
                { id: 5, x: 87.2, y: 76.9, w: 11.9, h: 11.9 }
            ]
        },
        {
            level: 23,
            title: "王家のガーデン",
            leftImg: "assets/stage23_left.png",
            rightImg: "assets/stage23_right.png",
            mistakes: [
                { id: 1, x: 32.3, y: 35.6, w: 6.9, h: 6.9 },
                { id: 2, x: 44.9, y: 53.7, w: 8.4, h: 8.4 },
                { id: 3, x: 30.0, y: 26.8, w: 10.0, h: 10.0 },
                { id: 4, x: 44.0, y: 25.2, w: 7.0, h: 7.0 }
            ]
        },
        {
            level: 24,
            title: "雪の国",
            leftImg: "assets/stage24_left.png",
            rightImg: "assets/stage24_right.png",
            mistakes: [
                { id: 1, x: 90.6, y: 54.1, w: 8.8, h: 8.8 },
                { id: 2, x: 16.6, y: 50.1, w: 9.1, h: 9.1 },
                { id: 3, x: 53.0, y: 20.3, w: 11.2, h: 11.2 },
                { id: 4, x: 25.4, y: 67.3, w: 10.9, h: 10.9 },
                { id: 5, x: 31.6, y: 38.8, w: 9.4, h: 9.4 }
            ]
        },
        {
            level: 25,
            title: "おもちゃの部屋",
            leftImg: "assets/stage25_left.png",
            rightImg: "assets/stage25_right.png",
            mistakes: [
                { id: 1, x: 86.3, y: 58.8, w: 9.7, h: 9.7 },
                { id: 2, x: 33.6, y: 17.0, w: 7.5, h: 7.5 },
                { id: 3, x: 21.6, y: 40.8, w: 6.9, h: 6.9 }
            ]
        },
        {
            level: 26,
            title: "わくわくペットランド",
            leftImg: "assets/stage26_left.png",
            rightImg: "assets/stage26_right.png",
            mistakes: [
                { id: 1, x: 59.8, y: 39.5, w: 8.8, h: 8.8 },
                { id: 2, x: 81.4, y: 49.2, w: 6.9, h: 6.9 },
                { id: 3, x: 64.1, y: 74.8, w: 11.6, h: 11.6 },
                { id: 4, x: 75.2, y: 61.7, w: 8.8, h: 8.8 }
            ]
        },
        {
            level: 27,
            title: "虹の滝",
            leftImg: "assets/stage27_left.png",
            rightImg: "assets/stage27_right.png",
            mistakes: [
                { id: 1, x: 49.5, y: 29.8, w: 11.9, h: 11.9 },
                { id: 2, x: 75.6, y: 72.0, w: 7.5, h: 7.5 },
                { id: 3, x: 79.3, y: 27.3, w: 10.3, h: 10.3 }
            ]
        },
        {
            level: 28,
            title: "星空観測所",
            leftImg: "assets/stage28_left.png",
            rightImg: "assets/stage28_right.png",
            mistakes: [
                { id: 1, x: 13.0, y: 9.0, w: 8.8, h: 8.8 },
                { id: 2, x: 32.0, y: 10.0, w: 8.4, h: 8.4 },
                { id: 3, x: 13.0, y: 33.8, w: 9.1, h: 9.1 },
                { id: 4, x: 65.4, y: 19.9, w: 7.8, h: 7.8 },
                { id: 5, x: 88.4, y: 83.8, w: 10.9, h: 10.9 }
            ]
        },
        {
            level: 29,
            title: "夕暮れの遊園地",
            leftImg: "assets/stage29_left.png",
            rightImg: "assets/stage29_right.png",
            mistakes: [
                { id: 1, x: 72.0, y: 49.3, w: 9.7, h: 9.7 },
                { id: 2, x: 37.6, y: 59.3, w: 12.2, h: 12.2 },
                { id: 3, x: 45.1, y: 21.2, w: 10.3, h: 10.3 },
                { id: 4, x: 29.8, y: 33.9, w: 7.5, h: 7.5 },
                { id: 5, x: 35.2, y: 20.4, w: 9.1, h: 9.1 }
            ]
        },
        {
            level: 30,
            title: "夢の王宮",
            leftImg: "assets/stage30_left.png",
            rightImg: "assets/stage30_right.png",
            mistakes: [
                { id: 1, x: 48.4, y: 49.8, w: 10.3, h: 10.3 },
                { id: 2, x: 52.1, y: 33.0, w: 7.2, h: 7.2 },
                { id: 3, x: 79.8, y: 36.6, w: 9.7, h: 9.7 }
            ]
        }
    ];

    function getCurrentStageData() {
        // ステージが存在しない場合は最後のステージをループ
        return STAGES[Math.min(currentLevel - 1, STAGES.length - 1)];
    }

    // 効果音
    let audioCtx = null;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('AudioContext not supported or disabled', e);
    }

    function playSound(type) {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            osc.frequency.setValueAtTime(783.99, now + 0.2);
            osc.frequency.setValueAtTime(1046.50, now + 0.3);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'clear') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.15);
            osc.frequency.setValueAtTime(659.25, now + 0.3);
            osc.frequency.setValueAtTime(880, now + 0.45);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    }

    // ゲームの初期化
    function initGame() {
        // パネル内の古いパッチ（間違い要素）をクリア
        const oldPatchesRight = panelRight.querySelectorAll('.patch');
        oldPatchesRight.forEach(p => p.remove());
        const oldPatchesLeft = panelLeft.querySelectorAll('.patch');
        oldPatchesLeft.forEach(p => p.remove());

        // 現在のレベルのデータを取得
        const stageData = getCurrentStageData();
        const leftImgUrl = stageData.leftImg;
        const rightImgUrl = stageData.rightImg;

        // 画像のプリロード（読み込み完了を待つ）
        const imgLeft = new Image();
        const imgRight = new Image();
        let loaded = 0;

        const onBothLoaded = () => {
            panelLeft.querySelector('.panel-background').style.backgroundImage = `url('${leftImgUrl}')`;
            panelRight.querySelector('.panel-background').style.backgroundImage = `url('${rightImgUrl}')`;

            effectContainer.innerHTML = '';
            foundMistakes = 0;
            showMascot('start');
            isGameOver = false;
            hintGiven = false;

            document.getElementById('level-display').textContent = `Lv.${currentLevel} ${stageData.title}`;

            timeRemaining = STAGE_TIME_LIMIT;
            updateTimerDisplay(100);
            document.getElementById('score-display').textContent = totalScore;

            TOTAL_MISTAKES = stageData.mistakes.length;
            starContainer.innerHTML = '';
            stars = [];
            for (let i = 0; i < TOTAL_MISTAKES; i++) {
                const s = document.createElement('span');
                s.className = 'star-empty';
                s.innerHTML = '⭐';
                starContainer.appendChild(s);
                stars.push(s);
            }

            clearScreen.classList.add('hidden-screen');

            renderMistakes();
            startTimer();
        };

        imgLeft.onload = () => { loaded++; if (loaded === 2) onBothLoaded(); };
        imgRight.onload = () => { loaded++; if (loaded === 2) onBothLoaded(); };
        imgLeft.src = leftImgUrl;
        imgRight.src = rightImgUrl;
    }

    // タイマー処理
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);

        const totalTime = timeRemaining;
        const timerBar = document.getElementById('timer-bar');

        timerInterval = setInterval(() => {
            timeRemaining--;

            const percentage = (timeRemaining / totalTime) * 100;
            updateTimerDisplay(percentage);

            // ヒント表示ロジックはマニュアルボタン化されたため削除

            if (timeRemaining <= 0) {
                handleTimeOut();
            }
        }, 1000);
    }

    function updateTimerDisplay(percentage) {
        const timerBar = document.getElementById('timer-bar');
        timerBar.style.width = `${percentage}%`;

        // 色の変更
        timerBar.className = 'timer-bar';
        if (percentage <= 20) {
            timerBar.classList.add('danger');
        } else if (percentage <= 50) {
            timerBar.classList.add('warning');
        }
    }

    function getAreaName(x, y) {
        // 座標(%)からエリア名を返す
        let vertical = '';
        let horizontal = '';
        if (y <= 33) vertical = 'うえのほう';
        else if (y <= 66) vertical = 'まんなかあたり';
        else vertical = 'したのほう';

        if (x <= 33) horizontal = 'ひだり';
        else if (x <= 66) horizontal = 'まんなか';
        else horizontal = 'みぎ';

        // まんなか+まんなか は「ど真ん中」にする
        if (horizontal === 'まんなか' && vertical === 'まんなかあたり') {
            return 'まんなかあたり';
        }
        return `${horizontal}の ${vertical}`;
    }

    function triggerHint() {
        hintGiven = true;

        // 左側のパネルで見つかっていないパッチを1つ探す
        const unfoundPatches = Array.from(panelLeft.querySelectorAll('.patch')).filter(p => p.dataset.found !== 'true');
        if (unfoundPatches.length > 0) {
            // ランダムに1つ選ぶ
            const targetPatch = unfoundPatches[Math.floor(Math.random() * unfoundPatches.length)];
            const mistakeId = targetPatch.dataset.mistakeId;

            // 座標からエリア名を取得
            const stageData = getCurrentStageData();
            const mistake = stageData.mistakes.find(m => m.id == mistakeId);
            let areaName = 'どこか';
            if (mistake) {
                areaName = getAreaName(mistake.x, mistake.y);
            }

            // 抽象的だけどわかりやすいヒントメッセージを生成
            const hintMessages = [
                `${areaName}を よーく みてね👀`,
                `${areaName}に ひんとが あるかも！🔍`,
                `ひんと！ ${areaName}が あやしいよ✨`,
                `${areaName}に なにか あるかも…？🌟`,
                `${areaName}の あたりを さがしてみてね💫`
            ];
            const msg = hintMessages[Math.floor(Math.random() * hintMessages.length)];
            showMascotWithMessage(msg);

            // 左右両方の対応するパッチにヒントアニメーションクラスを追加
            const hintRight = panelRight.querySelector(`.patch[data-mistake-id="${mistakeId}"]`);
            const hintLeft = panelLeft.querySelector(`.patch[data-mistake-id="${mistakeId}"]`);

            if (hintRight) hintRight.classList.add('hint-animation');
            if (hintLeft) hintLeft.classList.add('hint-animation');
        } else {
            // もう全部見つけているか、見つかっていないパッチが無い場合
            showMascotWithMessage("もう ぜんぶ みつけたよ！すごーい！🎉");
        }
    }

    function handleTimeOut() {
        clearInterval(timerInterval);
        isGameOver = true;
        playSound('wrong'); // 時間切れ音
        showMascot('timeout');
        showResultScreen(false);
    }

    function showResultScreen(isClear) {
        const resultTitle = document.getElementById('result-title');
        const resultDesc = document.getElementById('result-desc');
        const replayBtn = document.getElementById('replay-button');

        if (isClear) {
            playSound('clear');
            stageScore = timeRemaining * 100;
            totalScore += stageScore;
            document.getElementById('score-display').textContent = totalScore;

            resultTitle.textContent = '🎉 やったね！ 🎉';
            resultTitle.classList.add('rainbow-text');
            resultDesc.textContent = `ぜんぶ みつけたよ！`;
            document.getElementById('stage-score-display').textContent = `このステージ: +${stageScore}てん`;
            document.getElementById('total-score-display').textContent = `ごうけい: ${totalScore}てん`;

            // 最終ステージクリア判定
            if (currentLevel >= STAGES.length) {
                replayBtn.textContent = '🎉 おめでとう！さいしょから';
                resultTitle.textContent = '👑 ぜんぶクリア！ 👑';
                resultDesc.textContent = `すごい！ぜんぶクリアしたよ！`;
                document.getElementById('total-score-display').textContent = `ファイナルスコア: ${totalScore}てん`;
                currentLevel = 1;
                totalScore = 0;
            } else {
                replayBtn.textContent = 'つぎのレベルへすすむ';
                currentLevel++;
            }

            // 紙吹雪エフェクト
            createConfetti();
        } else {
            resultTitle.textContent = '⏱ タイムアップ！ ⏱';
            resultTitle.classList.remove('rainbow-text');
            resultDesc.textContent = `あと ${TOTAL_MISTAKES - foundMistakes}こ だったね！`;
            document.getElementById('stage-score-display').textContent = `このステージ: +0てん`;
            document.getElementById('total-score-display').textContent = `ごうけい: ${totalScore}てん`;
            replayBtn.textContent = 'もう１かい あそぶ';
            // 失敗時は同じレベルからやり直すため、currentLevelは減らさない
        }

        clearScreen.classList.remove('hidden-screen');
    }

    // パッチの描画
    function renderMistakes() {
        const stageData = getCurrentStageData();
        stageData.mistakes.forEach((mistake) => {
            const createHotspot = (panel) => {
                const patch = document.createElement('div');
                patch.className = 'patch';
                // 座標はパーセンテージ。中心から幅引くのではなく、w, h に応じて適宜調整（今回は find_diffs が中央 x, y で計算したと仮定）
                // ただし find_diffs で出した cx, cy は中心点なので、 - w/2 します。
                patch.style.left = `calc(${mistake.x}% - ${mistake.w / 2}%)`;
                patch.style.top = `calc(${mistake.y}% - ${mistake.h / 2}%)`;
                patch.style.width = `${mistake.w}%`;
                patch.style.height = `${mistake.h}%`;
                patch.dataset.mistakeId = mistake.id;
                patch.style.backgroundColor = 'transparent';
                patch.addEventListener('click', handleMistakeClick);
                panel.appendChild(patch);
            };

            createHotspot(panelLeft);
            createHotspot(panelRight);
        });

        // 何もないところ（背景など）をクリックした場合の処理
        panelRight.querySelector('.panel-background').addEventListener('click', handleWrongClick);
        panelLeft.querySelector('.panel-background').addEventListener('click', handleWrongClick);
    }

    // 間違い（ホットスポット）をクリックした時の処理
    function handleMistakeClick(e) {
        if (isGameOver) return;
        e.stopPropagation();

        const el = e.currentTarget;
        const mistakeId = el.dataset.mistakeId;

        // すでに見つけた間違いなら何もしない
        if (el.dataset.found === 'true') return;

        // 左右の対応するパッチを見つける
        const rootPatchRight = panelRight.querySelector(`.patch[data-mistake-id="${mistakeId}"]`);
        const rootPatchLeft = panelLeft.querySelector(`.patch[data-mistake-id="${mistakeId}"]`);

        // 両方とも発見済みにする
        if (rootPatchRight) rootPatchRight.dataset.found = 'true';
        if (rootPatchLeft) rootPatchLeft.dataset.found = 'true';

        // 視覚的エフェクト：右側のエラーパッチを消し（透明にし）て、左と同じに見えるようにする
        if (rootPatchRight) {
            rootPatchRight.style.opacity = '0';
            rootPatchRight.style.transition = 'opacity 0.5s ease';
        }

        // 正解演出
        showCorrectEffect(e.clientX, e.clientY);
        stars[foundMistakes].className = 'star-filled';
        showMascot('found');
        // マスコットの派手なジャンプ＋回転アニメーション
        setTimeout(() => {
            const char = mascotEl && mascotEl.querySelector('.mascot-character');
            if (char) {
                char.animate([
                    { transform: 'translateY(0) scale(1) rotate(0deg)' },
                    { transform: 'translateY(-40px) scale(1.6) rotate(-25deg)', offset: 0.3 },
                    { transform: 'translateY(-20px) scale(1.4) rotate(20deg)', offset: 0.55 },
                    { transform: 'translateY(-45px) scale(1.5) rotate(-15deg)', offset: 0.75 },
                    { transform: 'translateY(0) scale(1) rotate(0deg)' }
                ], { duration: 900, easing: 'ease-in-out' });
            }
        }, 50);
        foundMistakes++;

        // ヒントアニメーションがついていたら消す
        if (rootPatchRight) rootPatchRight.classList.remove('hint-animation');
        if (rootPatchLeft) rootPatchLeft.classList.remove('hint-animation');

        // 正解が見つかったら、ヒントフラグをリセットして次のヒントが出るようにする
        hintGiven = false;

        // クリア判定
        if (foundMistakes >= TOTAL_MISTAKES) {
            isGameOver = true;
            clearInterval(timerInterval); // クリアしたらタイマー停止
            setTimeout(() => {
                showResultScreen(true);
            }, 1000); // 1秒遅れでクリア画面を表示
        }
    }

    function handleWrongClick(e) {
        if (isGameOver) return;
        e.stopPropagation();
        showWrongEffect(e.clientX, e.clientY);
        showMascot('miss');
    }

    function showCorrectEffect(x, y) {
        playSound('correct');

        // 虹色グロー丸マーカー
        const marker = document.createElement('div');
        marker.className = 'circle-marker';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        effectContainer.appendChild(marker);
        setTimeout(() => marker.remove(), 1500);

        // バーストリング（2重に絞りDOM負荷を抑制）
        [80, 150].forEach((size, i) => {
            const burst = document.createElement('div');
            burst.className = 'correct-burst';
            burst.style.left = `${x}px`;
            burst.style.top = `${y}px`;
            burst.style.width = `${size}px`;
            burst.style.height = `${size}px`;
            const colors = ['#ff6bff', '#ffd93d'];
            burst.style.borderColor = colors[i];
            effectContainer.appendChild(burst);
            burst.animate([
                { transform: `translate(-50%, -50%) scale(0)`, opacity: 1 },
                { transform: `translate(-50%, -50%) scale(2.5)`, opacity: 0 }
            ], { duration: 600 + i * 100, delay: i * 80, easing: 'ease-out' }).onfinish = () => burst.remove();
        });

        // 「やったー！」テキストが飛び出す
        const text = document.createElement('div');
        text.className = 'correct-text';
        text.textContent = 'やったー！🎉';
        text.style.left = `${x}px`;
        text.style.top = `${y}px`;
        effectContainer.appendChild(text);
        text.animate([
            { transform: 'translate(-50%, -50%) scale(0.3) rotate(-15deg)', opacity: 1 },
            { transform: 'translate(-50%, calc(-50% - 60px)) scale(1.3) rotate(8deg)', opacity: 1, offset: 0.4 },
            { transform: 'translate(-50%, calc(-50% - 110px)) scale(1) rotate(-3deg)', opacity: 0 }
        ], { duration: 1200, easing: 'ease-out' }).onfinish = () => text.remove();

        // 大量のパーティクル（星・ハート・キラキラ）
        createParticles(x, y, ['⭐', '✨', '💖', '🌟', '💫', '❤️', '🎉', '💥', '🌈', '🎊']);
    }

    function showWrongEffect(x, y) {
        playSound('wrong');
        const marker = document.createElement('div');
        marker.className = 'x-marker';
        marker.innerHTML = '✕';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        effectContainer.appendChild(marker);
        setTimeout(() => marker.remove(), 800);
    }

    function createParticles(x, y, symbols) {
        const numParticles = 12; // スマホ性能に配慮して上限12個
        for (let i = 0; i < numParticles; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            const angle = (i / numParticles) * Math.PI * 2 + Math.random() * 0.4;
            const distance = 60 + Math.random() * 80; // 画面外に大きくはみ出さない距離
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 60;
            const scale = 0.8 + Math.random() * 0.8;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            p.style.fontSize = `${1.5 + Math.random() * 1.5}rem`;

            p.animate([
                { transform: `translate(-50%, -50%) scale(0.3) rotate(0deg)`, opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale}) rotate(${Math.random() * 300}deg)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                delay: Math.random() * 100,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => p.remove();
            effectContainer.appendChild(p);
        }
    }

    function createConfetti() {
        const colors = ['#ff6b8a', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9a3c', '#a855f7'];
        const emojis = ['🎊', '🎈', '⭐', '🌸', '💖', '✨', '🎀', '🦋', '🌟', '💫', '🎉'];
        const container = effectContainer;
        let count = 0;
        const maxConfetti = 30; // スマホ性能に配慮して上限30個

        const interval = setInterval(() => {
            if (clearScreen.classList.contains('hidden-screen') || count >= maxConfetti) {
                clearInterval(interval);
                return;
            }
            // 1回に3個ずつ生成（負荷分散）
            for (let i = 0; i < 3; i++) {
                const p = document.createElement('div');
                const isEmoji = Math.random() > 0.5;
                if (isEmoji) {
                    p.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
                    p.style.fontSize = `${2 + Math.random() * 2}rem`;
                } else {
                    // カラフル四角・リボン
                    const isRibbon = Math.random() > 0.5;
                    p.style.width = isRibbon ? `${5 + Math.random() * 6}px` : `${10 + Math.random() * 12}px`;
                    p.style.height = isRibbon ? `${16 + Math.random() * 16}px` : `${8 + Math.random() * 10}px`;
                    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    p.style.borderRadius = isRibbon ? '3px' : (Math.random() > 0.5 ? '50%' : '2px');
                }
                // position:absolute + コンテナがoverflow:hiddenなのでスクロール不発生
                p.style.position = 'absolute';
                p.style.left = `${Math.random() * 100}%`;
                p.style.top = `-30px`;
                p.style.pointerEvents = 'none'; // タップを絶対にブロックしない

                // 水平ぶれ幅を画面幅の15%以内に制限してはみ出し抑制
                const swayX = (Math.random() - 0.5) * window.innerWidth * 0.3;
                const rotation = Math.random() * 720 - 360;
                const duration = 2000 + Math.random() * 1500;

                p.animate([
                    { transform: `translateX(0) translateY(0) rotate(0deg)`, opacity: 1 },
                    { transform: `translateX(${swayX * 0.5}px) translateY(${window.innerHeight * 0.5}px) rotate(${rotation * 0.5}deg)`, opacity: 1, offset: 0.5 },
                    { transform: `translateX(${swayX}px) translateY(${window.innerHeight + 40}px) rotate(${rotation}deg)`, opacity: 0.4 }
                ], { duration, easing: 'linear' }).onfinish = () => p.remove();
                container.appendChild(p);
                count++;
            }
        }, 150); // 150msごとに生成（80msから緩和してCPU負荷を下げる）
    }

    // ===== マスコットキャラクター（うさぎちゃん） =====
    const mascotMessages = {
        start: ['がんばってね！🌟', 'いっしょに さがそう！', 'よーく みてね！👀'],
        found: ['すごーい！✨', 'みつけたね！💖', 'やったー！🎉', 'さすが！👏', 'えらい！🌈'],
        miss: ['おしいっ！💦', 'もうちょっと！', 'がんばれ〜！', 'ここじゃないよ〜'],
        timeout: ['つぎは がんばろうね！', 'ドンマイ！💪', 'おしかったね〜！'],
        clear: ['やったね！🎉', 'すごすぎ！👑', 'パーフェクト！💖'],
        hint: ['ヒントをあげるね〜！👀']
    };
    let mascotEl = null;
    let mascotTimeout = null;

    function createMascotElement() {
        if (mascotEl) return;
        // HTML に静的配置済みの要素を取得（body への動的追加は廃止）
        mascotEl = document.getElementById('mascot-container');

        // ヒントボタンのクリックイベントを設定
        const hintBtn = document.getElementById('hint-button');
        hintBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGameOver) return;
            playSound('correct');
            triggerHint();
        });
    }

    function showMascot(type) {
        createMascotElement();
        const messages = mascotMessages[type] || mascotMessages.start;
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showMascotWithMessage(msg);
    }

    function showMascotWithMessage(msg) {
        createMascotElement();
        const bubble = document.getElementById('mascot-bubble');
        bubble.textContent = msg;
        bubble.style.display = 'block';
        mascotEl.classList.add('mascot-visible');

        // バウンスアニメーション
        const char = mascotEl.querySelector('.mascot-character');
        char.animate([
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(-12px) scale(1.15)' },
            { transform: 'translateY(0) scale(1)' }
        ], { duration: 400, easing: 'ease-in-out' });

        if (mascotTimeout) clearTimeout(mascotTimeout);
        mascotTimeout = setTimeout(() => {
            bubble.style.display = 'none';
        }, 3500);
    }

    replayButton.addEventListener('click', () => {
        playSound('correct');
        initGame();
    });

    startButton.addEventListener('click', () => {
        playSound('correct');
        titleScreen.classList.add('hidden-screen');
        gameUi.classList.remove('hidden-screen');
        initGame();
    });

});
