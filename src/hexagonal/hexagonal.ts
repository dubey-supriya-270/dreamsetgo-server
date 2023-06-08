class HexaNode {
  public name: string;
  public neighbours: [number, HexaNode][];
  constructor(name: string) {
    this.name = name;
    this.neighbours = [];
  }
}

export class Cluster {
  public hexaNodes: Map<string, HexaNode>;

  constructor() {
    this.hexaNodes = new Map();
  }

  public addHexagon(name: string): void {
    const hexagon = new HexaNode(name);
    this.hexaNodes.set(name, hexagon);
    console.log("here");
  }

  public removeHexagon(name: string): void {
    this.hexaNodes.delete(name);
    // Remove the hexagon from its neighbours' list
    this.hexaNodes.forEach((hexagon) => {
      hexagon.neighbours = hexagon.neighbours.filter(
        ([_, neighbour]) => neighbour.name !== name
      );
    });
  }

  public addNeighbour(
    source: string,
    border: number,
    neighbourName: string
  ): void {
    const sourceHexagon = this.hexaNodes.get(source);

    const neighbourHexagon = this.hexaNodes.get(neighbourName);

    if (sourceHexagon === undefined || neighbourHexagon === undefined) {
      throw new Error("Hexagons not found");
    }

    sourceHexagon.neighbours.push([border, neighbourHexagon]);
    neighbourHexagon.neighbours.push([(border + 3) % 6, sourceHexagon]);
    console.log("neighbours added");
  }

  public getNeighbours(name: string): [number, string][] {
    const hexagon = this.hexaNodes.get(name);

    if (!hexagon) {
      throw new Error("Hexagon not found");
    }
    console.log("neighbours added",hexagon.neighbours);
    return hexagon.neighbours.map(([border, neighbour]) => [
      border,
      neighbour.name,
    ]);
  }
}
