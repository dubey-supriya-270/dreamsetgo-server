import { Result } from "../interfaces/result";
import { db } from "../db_init/dbConn";
import {
  ICreateHexagonal,
  IHexagonalNeighbour,
  IStoreHexagonal,
} from "../interfaces/hexagonal";

import format from "pg-format";

export const getHexagonDetails = async (name: string): Promise<Result<any>> => {
  try {
    const hexagonDetails = await db.query(
      `select id from hexagons where name = $1`,
      [name]
    );

    return Result.ok(hexagonDetails);
  } catch (error) {
    return Result.error(error);
  }
};

export const getHexagonNameByNeighbor = async (
  neighbor_name: string,
  border_number: number
): Promise<Result<any>> => {
  try {
    const connectionDetails = await db.query(
      `select name from hexagons where neighbor_name = $1 and border_number = $2`,
      [neighbor_name, border_number]
    );

    return Result.ok(connectionDetails);
  } catch (error) {
    return Result.error(error);
  }
};

export const addHexagonal = async (data: ICreateHexagonal): Promise<Result> => {
  try {
    await db.query(
      `insert into hexagons (name, neighbor_name, border_number) values ($1, $2,$3)`,
      [data.name, data.neighbour, data.border]
    );
    if (data.neighbour !== "") {
     
      await db.query(
        `insert into hexagons (name, neighbor_name, border_number) values ($1, $2,$3)`,
        [data.neighbour, data.name, (+data.border + 3) % 6]
      );
    }

    return Result.ok();
  } catch (err) {
    return Result.error(`Error adding hexagonal => ${err}`);
  }
};

export const addMultipleHexagonal = async (
  data: IStoreHexagonal[]
): Promise<Result> => {
  try {
    let updatedArray = data.map((obj) => Object.values(obj));

    let query1 = `INSERT INTO hexagons (name, neighbor_name, border_number) VALUES 
      ${updatedArray
        .map((val) => `('${val[0]}', '${val[1]}', ${val[2]})`)
        .join(", ")} returning id`;

    const result = await db.query(query1);

    return Result.ok(result);
  } catch (err) {
    return Result.error(err);
  }
};

export const fetchNeighbourOfHexagonal = async (
  name: string
): Promise<Result<IHexagonalNeighbour[]>> => {
  try {
    const result = await db.query(
      `SELECT border_number, neighbor_name from hexagons WHERE name = $1`,
      [name]
    );

    return Result.ok(result);
  } catch (err) {
    return Result.error(`Error fetching hexagonal neighbour => ${err}`);
  }
};

export const deleteHexagonal = async (hexagonName: string): Promise<Result> => {
  try {
    // Check if the hexagon is the only connecting hexagon between two hotspots
    const neighborCountResult = await db.query(
      'SELECT COUNT(*) FROM hexagons WHERE neighbor_name = $1',
      [hexagonName]
    );

    console.log("neighborCountResult",neighborCountResult)

    const neighborCount = parseInt(neighborCountResult.count, 10);
    
    if (neighborCount === 1) {
      
      return Result.error( 'Hexagon cannot be removed as it is the only connecting hexagon between two hotspots' );
    }

    // Remove the hexagon from the cluster
    await db.query(
      'DELETE FROM hexagons WHERE name = $1',
      [hexagonName]
    );

    // Update the neighbor's record to remove the reference to the removed hexagon
    await db.query(
      'UPDATE hexagons SET neighbor_name = NULL WHERE neighbor_name = $1',
      [hexagonName]
    );

  
    return Result.ok("Delete hexagonal successfully");
  } catch (err) {
    return Result.error(`Error delete hexagonal  => ${err}`);
  }
};


