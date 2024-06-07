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
		this.physics.world.setBounds(0,0, 36*16*SCALE, 21*16*SCALE);

		// Create map
		this.createMap();

		// Create door
		this.door = this.physics.add.staticSprite(20, game.config.height/2, "Door");
		this.door.setBodySize(this.door.displayWidth/4, this.door.displayHeight/4);
		this.door.setVisible(false);

		// Create player
		this.player = new Player(this, 1000, game.config.height/2);

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
		this.map = this.add.tilemap("starting-area", 16, 16, 36, 21);

		// Add tilesets
		this.tilesetList = [
			this.map.addTilesetImage("urban_tilemap_packed_bigger", "urban_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent_bigger", "rpg_tiles_bigger"), 
		];

		// Create layers
		this.floorLayer = this.map.createLayer("Flooring", this.tilesetList);
		this.floorLayer.setScale(SCALE);

		this.carpetLayer = this.map.createLayer("Carpet", this.tilesetList);
		this.carpetLayer.setScale(SCALE);

		this.wallsLayer = this.map.createLayer("Walls", this.tilesetList);
		this.wallsLayer.setScale(SCALE);
		this.wallsLayer.setTint(0xbad0d8);

		this.decorLayer = this.map.createLayer("Decor", this.tilesetList);
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
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.dashText = this.add.text(700, 400, "SPACE\nto dash")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.netText = this.add.text(500, 400, "LEFT CLICK\nto swing net")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setTint(0x000000);
		this.netText = this.add.text(250, 400, "Right CLICK\nto shoot bread")
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