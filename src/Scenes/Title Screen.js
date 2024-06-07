class TitleScreen extends Phaser.Scene
{
	constructor() {
		super("titleScreenScene");
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Play music
		let music = this.sound.add("Title Screen", {
			volume: 0.5,
			loop: true
		});
		music.play();

		// Set background
		this.cameras.main.setBackgroundColor(0xfafafa);

		// Create title
		this.add.image(game.config.width/2, game.config.height/2 - 125, "Title");

		// Create start game button
		let startGameButton = this.add.sprite(game.config.width/2, game.config.height/2 + 125, "Start Game Button");
		startGameButton.setInteractive();
		startGameButton.on("pointerover", () => {
			startGameButton.setTint(0xdadada);
		});
		startGameButton.on("pointerout", () => {
			startGameButton.clearTint();
		});
		startGameButton.on("pointerdown", () => {
			music.stop();
			this.sound.play("Button Press");
			this.scene.start("labScene");
		});
	}
}