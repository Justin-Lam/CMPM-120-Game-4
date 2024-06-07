// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.WEBGL,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true  // prevent pixel art from getting blurred when scaled
	},
	width: 16 * 70,
	height: 9 * 70,
	autoCenter: true,
	physics: {
		default: "arcade",
		arcade: {
			gravity: {
				x: 0,
				y: 0
			},
			//debug: true
		}
	},
	scene: [Load, TitleScreen, Lab, CombatTest, DungeonFunctionalityTest, EnemyTest, Test_MapGen]
}

const SCALE = 2;
const game = new Phaser.Game(config);