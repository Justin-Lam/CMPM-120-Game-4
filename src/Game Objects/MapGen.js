class MapGen
{
    mapWidth = 120;
    mapHeight = 68; // In tiles

    TILES = 
    {
        FLOOR: [
            {index: 0, weight: 2.5},
            {index: 1, weight: 2.5},
            {index: 2, weight: 3},
            {index: 3, weight: 1},
            //{index: 4, weight: 0.5},
        ],
        DECOR: [
            {index: 0, weight: 0.2},
            {index: 1, weight: 0.1},
            {index: 2, weight: 0.1},
            {index: 3, weight: 0.1},
            {index: 4, weight: 0.1},
            {index: 5, weight: 0.1},
            {index: 6, weight: 0.3},
            {index: 7, weight: 10},
        ],
        COLLIDES: [
            {index: 1, weight: 0.2},
            //{index: 2, weight: 0.1},
            {index: 3, weight: 30},
        ],
        TREE_BORDERS: [
            {}
        ],
    } // Contains information on what each layer's possible tile images are along with weight (likelihood of being chosen)

    constructor(scene) 
    {
        this.scene = scene;
    }

    create()
	{
        if (this.map != undefined)
        {
            this.map.destroy();
        }

        // Create a blank tilemap
        this.map = this.scene.make.tilemap({tileWidth: 16, tileHeight: 16, width: this.mapWidth, height: this.mapHeight});

        this.generateFloor();
        this.generateDecor(); 
        this.generateCollidables(); 
    }

    generateFloor() 
    {
        this.floorTileset = this.map.addTilesetImage("flooring-tileset", "floor_tiles");

        // Make layer with tileset lists
        this.floorLayer = this.map.createBlankLayer('Floor', this.floorTileset);
        this.floorLayer.setScale(SCALE);

        // From Phaser docs: The probability of any index being picked is (the indexs weight) / (sum of all weights)
        // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
        // See "Weighted Randomize" example for more information on how to use weightedRandomize.
        this.map.weightedRandomize(this.TILES.FLOOR, 0, 0, this.mapWidth, this.mapHeight, 'Floor');
    }

    generateDecor() 
    {
        this.decorTileset = this.map.addTilesetImage("decor", "decor_tiles");
        this.decorLayer = this.map.createBlankLayer('Decor', this.decorTileset);
        this.decorLayer.setScale(SCALE);
        this.map.weightedRandomize(this.TILES.DECOR, 0, 0, this.mapWidth, this.mapHeight, 'Decor');
    }

    generateCollidables() 
    {
        this.collideTileset = this.map.addTilesetImage("collidables", "collide_tiles");
        this.decorLayer = this.map.createBlankLayer('Collide', this.collideTileset);
        this.decorLayer.setScale(SCALE * 1.5);
        this.map.weightedRandomize(this.TILES.COLLIDES, 0, 0, this.mapWidth, this.mapHeight, 'Collide');

        /*
        let tileArray = this.layersToGrid();

        for (let row of tileArray) {
            for (let til of row) {
                if (til != null && til != undefined)
                {
                    if (tileset.getTileProperties(til) != null && tileset.getTileProperties(til) != undefined) {
                        let tileCost = tileset.getTileProperties(til).cost;
                        this.finder.setTileCost(til, tileCost);
                    }


                }
            }
        } 
        */
    }

    /*
    generateTreeBorder() 
    {
        this.treeBorderTileset = this.map.addTilesetImage("tree-border-tileset", "tree_tiles"), 

    }
    */
}