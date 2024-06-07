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

        this.TILES = 
        {
            FLOOR: [
                {index: 0, weight: 2.5},
                {index: 1, weight: 2.5},
                {index: 2, weight: 3},
                {index: 3, weight: 1},
                {index: 4, weight: 0.5},
            ]
        } // Contains information on what each layer's possible tile images are along with weight (likelihood of being chosen)
    }

    create()
	{
        // Create a blank tilemap
        this.map = this.make.tilemap({tileWidth: 16, tileHeight: 16, width: this.mapWidth, height: this.mapHeight});

        this.floorTileset = this.map.addTilesetImage("flooring-tileset", "floor_tiles"), 
        console.log(this.floorTileset);

        // Make layer with tileset lists
        this.floorLayer = this.map.createBlankLayer('Floor', this.floorTileset);
        this.floorLayer.setScale(SCALE);

        // From Phaser docs: The probability of any index being picked is (the indexs weight) / (sum of all weights)
        // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
        // See "Weighted Randomize" example for more information on how to use weightedRandomize.
        console.log(this.mapWidth);
        this.map.weightedRandomize(this.TILES.FLOOR, 0, 0, this.mapWidth, this.mapHeight, 'Floor');

        // Map randomgen tester (assigned to Q key)
		this.input.keyboard.on('keydown-Q', () => {
			console.log("switched to game test scene");
			this.scene.start("combatTestScene");
		});
    }
}