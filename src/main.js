// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true  // prevent pixel art from getting blurred when scaled
	},
	physics: {
		default: "arcade",
		arcade: {
			gravity: {
				x: 0,
				y: 0
			},
			debug: true
		}
	},
	width: 16 * 70,
	height: 9 * 70,
	autoCenter: true,
	scene: [Load, Test]
}

const game = new Phaser.Game(config);