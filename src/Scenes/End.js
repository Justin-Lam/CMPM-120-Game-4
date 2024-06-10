class End extends Phaser.Scene
{
	constructor() {
		super("endScene");
	}

    create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Play music
		this.music = this.sound.add("Lab", {
			volume: 0.5,
			loop: true
		});
		this.music.play();
        
		// Set background
		this.cameras.main.setBackgroundColor(0x000000);

        // Add text
		this.winText = this.add.text(game.config.width/2, 0.25 * game.config.height/2, "You win!!!")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(100)
			.setTint(0xfafafa);

		this.creditsText1 = this.add.text(game.config.width/2, 0.25 * game.config.height/2 + 100, "Credits")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(50)
			.setTint(0xfafafa);

		this.creditsText2 = this.add.text(game.config.width/2, 0.25 * game.config.height/2 + 200, `Developers: Justin Lam, Blythe Chen, Michelle Tan
Environmental assets: Kenney Assets
Music: 
Angry Birds (Title screen), Undertale (Lab + credits), Tamagotchi (Field)
Sound effects: Scratch, Chiptone, Pixabay`)
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0xfafafa);

		// Create restart game button
		let startGameButton = this.add.sprite(game.config.width/2, game.config.height/2 + 125, "Start Game Button");
		startGameButton.setInteractive();
		startGameButton.on("pointerover", () => {
			startGameButton.setTint(0xdadada);
		});
		startGameButton.on("pointerout", () => {
			startGameButton.clearTint();
		});
		startGameButton.on("pointerdown", () => {
			this.music.stop();
			this.sound.play("Button Press");
			this.scene.start("titleScreenScene");
		});
	}
}