class StartingArea extends Phaser.Scene
{
	constructor() {
		super("startingAreaScene");
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Create instructions
		this.wasdText = this.add.text(900, 400, "WASD\nto move")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20);
		this.dashText = this.add.text(700, 400, "SPACE\nto dash")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20);
		this.netText = this.add.text(500, 400, "LEFT CLICK\nto swing net")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20);
		this.netText = this.add.text(250, 400, "Right CLICK\nto shoot bread")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20);

		// Create door
		this.door = this.physics.add.staticSprite(100, game.config.height/2, "Door");
		this.door.setBodySize(this.door.displayWidth/4, this.door.displayHeight/4);

		// Create player
		this.player = new Player(this, 1000, game.config.height/2);

		// Create colliders
		this.physics.add.overlap(this.player, this.door, () => {
			this.scene.start("dungeonFunctionalityTestScene");
		});
	}

	update(time, delta)
	{
		// Update player
		this.player.update(delta);
	}
}