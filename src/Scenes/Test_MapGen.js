class Test_MapGen extends Phaser.Scene
{
    constructor() 
    {
        super('testMapGenScene');
    }

    init()
    {
        this.mapWidth = 50;
        this.mapHeight = 20; // In tiles

        const TILES = 
        {
        } // Contains information on what each layer's possible tile images are along with weight (likelihood of being chosen)
    }

    create()
	{
        // Create a blank tilemap with dimensions
        this.map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: this.mapWidth, height: this.mapHeight });

        // Add tilesets to the map
        this.tilesetList = [
            this.map.addTilesetImage("urban_tilemap_packed_bigger", "urban_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles"), 
			this.map.addTilesetImage("shmup_tiles_packed", "shmup_tiles"), 
			this.map.addTilesetImage("town_tilemap_packed", "town_tiles") 
        ];

        // Make layer with tileset list
        this.floorLayer = this.map.createBlankLayer('Floor', this.tilesetList);

        // The probability of any index being picked is (the indexs weight) / (sum of all weights)
        weightedRandomize(weightedIndexes, [layer]);
    	// Map randomgen tester (assigned to Q key)
		this.input.keyboard.on('keydown-Q', () => {
			console.log("switched to game test scene");
			this.scene.start("testScene");
		});
    }
}