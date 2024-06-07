class Lab extends Phaser.Scene
{
	constructor() {
		super("labScene");
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();
		
		// Set world
        this.physics.world.setBounds(0,0, 20*16*SCALE, 15*16*SCALE);

		// Create map
		this.createMap();
		
		// Create door
		this.door = this.physics.add.staticSprite(5 + 0.75 * this.map.widthInPixels, game.config.height/2.5 + 0.25 * this.map.heightInPixels, "Door");
		this.door.setBodySize(this.door.displayWidth/4, this.door.displayHeight/4);
		this.door.setVisible(false);

		// Create player
		this.player = new Player(this, 500 + 0.75 * this.map.widthInPixels, game.config.height/2);

		// Create colliders
		this.createColliders();

		// Create instructions
		this.createInstructions();

		// Play music
		this.music = this.sound.add("Lab", {
			volume: 0.5,
			loop: true
		});
		this.music.play();
	}

	createMap()
	{
		// Create map		
		this.map = this.add.tilemap("starting-area", 16, 16, 20, 15);

		// Add tilesets
		this.tilesetList = [
			this.map.addTilesetImage("urban_tilemap_packed_bigger", "urban_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent_bigger", "rpg_tiles_bigger"), 
		];

		// Create map layers
        this.floorLayer = this.map.createLayer("Flooring", this.tilesetList, 0.75 * this.map.widthInPixels, 0.25 * this.map.heightInPixels);
        this.floorLayer.setScale(SCALE);

		this.wallsLayer = this.map.createLayer("Walls", this.tilesetList, 0.75 * this.map.widthInPixels, 0.25 * this.map.heightInPixels);
        this.wallsLayer.setScale(SCALE);
		this.wallsLayer.setTint(0xbad0d8);

		this.decorLayer = this.map.createLayer("Decor", this.tilesetList, 0.75 * this.map.widthInPixels, 0.25 * this.map.heightInPixels);
        this.decorLayer.setScale(SCALE);
	}

	createColliders()
	{
		this.wallsLayer.setCollisionByExclusion([-1], true);
		// this.decorLayer.setCollisionByExclusion([-1], true);

		this.physics.add.collider(this.player, this.wallsLayer);
		// this.physics.add.collider(this.player, this.decorLayer);

		this.physics.add.overlap(this.player, this.door, () => {
			this.music.stop();
			this.sound.play("Door");
			this.scene.start("dungeonFunctionalityTestScene");
		});
	}

	createInstructions()
	{
		this.wasdText = this.add.text(900, 400, "WASD\nto move")
		// Create instructions
		this.wasdText = this.add.text(400 + 0.75 * this.map.widthInPixels, 200 + 0.25 * this.map.heightInPixels, "WASD\nto move")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.dashText = this.add.text(200 + 0.75 * this.map.widthInPixels, 200 + 0.25 * this.map.heightInPixels, "SPACE\nto dash")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.netText = this.add.text(400 + 0.75 * this.map.widthInPixels, 300 + 0.25 * this.map.heightInPixels, "LEFT CLICK\nto swing net")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.netText = this.add.text(200 + 0.75 * this.map.widthInPixels, 300 + 0.25 * this.map.heightInPixels, "Right CLICK\nto shoot bread")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
	}

	update(time, delta)
	{
		// Update player
		this.player.update(delta);
	}
}