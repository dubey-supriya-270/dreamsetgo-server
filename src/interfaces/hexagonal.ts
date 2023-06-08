export interface ICreateHexagonal {
    name: string;
    neighbour: string;
    border:number;
}

export interface IHexagonalNeighbour {
    neighbor_hexagon_id: string;
    border_number:number;
}