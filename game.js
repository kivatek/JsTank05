enchant();

// 画面サイズ
var SCREEN_WIDTH	= 320;
var SCREEN_HEIGHT	= 320;
// 戦車の種別
var TANKTYPE_PLAYER	= 0;
var TANKTYPE_ENEMY	= 1;

var Tank = Class.create(Sprite, {
	initialize: function(type,direction){
		Sprite.call(this, 32, 32);
		this.image = game.assets['js/images/chara3.png'];
		this.pattern = 0;
		this.direction = direction;
		this.isMoving = false;
		if (type == TANKTYPE_PLAYER) {
			// 緑色の戦車を表すフレーム番号
			this.frame = direction * 6;
			// キー入力の確認や戦車の移動プログラムを登録する。
			this.addEventListener('enterframe', function() {
				if (this.isMoving == false) {
					// 移動方向を表す情報をクリアする。
					this.vx = this.vy = 0;

					// キーの入力状態をチェックする。
					// 入力状態に合わせて戦車の向き情報を変更する。
					// 向き 0:下、1:左、2:右、3:上
					if (game.input.left) {
						this.direction = 1;
						this.vx = -1;
					} else if (game.input.right) {
						this.direction = 2;
						this.vx = 1;
					} else if (game.input.up) {
						this.direction = 3;
						this.vy = -1;
					} else if (game.input.down) {
						this.direction = 0;
						this.vy = 1;
					} else if (game.input.a) {
						// 弾を撃つ。つまり弾スプライトを発生する。
						// スプライトのサイズが違うため、戦車の座標をそのまま使うことができない。
						// そのため弾の座標を特別に計算する。
						var shot = new Shot(this.x+((32-16)/2), this.y+((32-16)/2), TANKTYPE_PLAYER, this.direction);
						game.currentScene.addChild(shot);
					} else if (game.input.b) {
					}
					if (this.vx || this.vy) {
						// 一ブロック分移動した後の座標を計算する。
						var x = this.x + this.vx * 32;
						var y = this.y + this.vy * 32;
						if (0 <= x && x < SCREEN_WIDTH && 0 <= y && y < SCREEN_HEIGHT) {
							// 一ブロック分移動した後の座標がステージの範囲内であれば移動処理を開始する。
							this.isMoving = true;
							// Timeline機能を使って移動処理を行う。
							this.tl
								.moveTo(x, y, 4, enchant.Easing.LINEAR)
								.and()
								.repeat(function() {
									// ４方向、３パターンのうちどのフレームを使うかを計算する。
									this.pattern = (this.pattern + 1) % 3;
									this.frame = this.direction * 6 + this.pattern;
								}, 4)
								.then(function() {
									this.isMoving = false;
								});
							
						}
					}
				}
			});
		} else {
			// デザートカラーの戦車を表すフレーム番号
			this.frame = direction * 6 + 3;
		}
	}
});

var Shot = Class.create(Sprite, {
	initialize: function(x,y,type,direction){
		Sprite.call(this, 16, 16);
		this.image = game.assets['js/images/icon0.png'];
		this.x = x;
		this.y = y;
		// 使用する弾画像のフレーム番号をセット。
		var topFrame = 0;
		if (type == TANKTYPE_PLAYER) {
			topFrame = 48;
		} else {
			topFrame = 56;
		}
		// 向きは戦車と同じ情報を受け取る。しかし画像の格納順は一致していない。
		// 0:下、1:左、2:右、3:下
		this.vx = this.vy = 0;
		if (direction == 0) {
			this.frame = topFrame + 4;
			this.vy = 1;
		} else if (direction == 1) {
			this.frame = topFrame + 2;
			this.vx = -1;
		} else if (direction == 2) {
			this.frame = topFrame + 6;
			this.vx = 1;
		} else if (direction == 3) {
			this.frame = topFrame;
			this.vy = -1;
		}
		this.addEventListener('enterframe', function() {
			// スクリーンの端かまたは何かに当たるまで飛んでいく。
			if (this.checkCollision() == true) {
				// 何かに衝突したらこれ以上は処理をしない。
				return;
			}
			// フレーム毎にやることが増えてくるとプログラムが見づらくなる。
			// そのときに備えて移動処理を関数へ変更。
			this.move();
		});
	},
	move: function() {
		this.moveBy(this.vx * 8, this.vy * 8);
	},
	checkCollision: function() {
		// collision: 「コリジョン」とはモノとモノとの衝突といった意味です。
		if (this.x < 0 || SCREEN_WIDTH <= this.x || this.y < 0 || SCREEN_HEIGHT <= this.y) {
			// 現在座標がすでに画面外であればステージから削除する。
			// この時点でこの弾スプライトはゲーム内に存在しなくなる。
			game.currentScene.removeChild(this);
			return true;
		}
		
		var i;
		for (i = 0; i < enemies.length; i++) {
			if (this.intersect(enemies[i])) {
				// enchant.jsの関数intersectを使ってスプライトが重なっているかをチェックします。
				// 敵タンクに当たったら弾を消す。
				// 2012/12/10時点では敵タンクへ当たったことを伝える処理は実装していない。
				game.currentScene.removeChild(this);
				return true;
			}
		}
		
		return false;
	}
});

function loadLevel(){
	backgroundMap = [
		[0,0,0,0,0,0,0,0,0,0],
		[0,1,1,0,0,0,0,1,1,0],
		[0,1,0,0,0,1,0,0,1,0],
		[0,0,0,1,0,0,1,0,0,0],
		[0,1,1,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,1,1,0],
		[0,0,0,1,0,0,1,0,0,0],
		[0,1,0,0,1,0,0,0,1,0],
		[0,1,1,0,0,0,0,1,1,0],
		[0,0,0,0,0,0,0,0,0,0]
	];
	
	background = new Map(32, 32);
	background.image = game.assets['js/images/tankmap.png'];
	background.loadData(backgroundMap);
}

window.onload = function() {
	
	game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
	
	game.fps = 24;
	game.touched = false;
	game.preload('js/images/chara3.png', 'js/images/icon0.png', 'js/images/tankmap.png');
	game.keybind(90, 'a');      // ＺキーをＡボタンとみなす
	game.keybind(88, 'b');      // ＸキーをＢボタンと見なす
	
	enemies = [];	// 敵タンクの情報を保持する配列

	game.onload = function() {
		game.currentScene.backgroundColor = 'rgb(239, 228, 202)';

		loadLevel();
		
		// 緑色の戦車（自分用）のスプライトを用意。
		var myTank = new Tank(TANKTYPE_PLAYER, 0);
		// 表示位置の指定
		myTank.x = 0;
		myTank.y = 0;
		
		// デザートカラーの戦車（敵用）のスプライトを用意。
		var teki = new Tank(TANKTYPE_ENEMY, 1);
		// 表示位置の指定
		teki.x = 288;
		teki.y = 288;
		
		enemies.push(teki);

		// 用意したスプライト、バックグラウンドをシーンに関連づける。シーンはスクラッチで言えばステージのこと。
		// これで表示されるようになる。
		game.currentScene.addChild(background);
		game.currentScene.addChild(teki);
		game.currentScene.addChild(myTank);
	};
	game.start();
};
