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
    // Check if the hexagon exists
    const hexagon = await db.oneOrNone(
      "SELECT id FROM hexagons WHERE name = $1",
      hexagonName
    );



    if (!hexagon) {
      return Result.error("Hexagon not found");
    }

    // Check if the hexagon is the only connection between two hotspots
    const count = await db.one(
      `SELECT COUNT(*) AS count FROM hexagonneighbors  
          WHERE hexagon_id = $1 OR neighbor_hexagon_id = $1`,
      [hexagon.id],
      (data) => +data.count
    );

    if (count === 1) {
      return Result.error(
        "Hexagon cannot be removed as it is the only connection between two hotspots"
      );
    }

    // Delete the hexagon from the table
    await db.one("DELETE FROM hexagons WHERE id = $1", hexagon.id);
  
    return Result.ok("Delete hexagonal successfully");
  } catch (err) {
    return Result.error(`Error delete hexagonal  => ${err}`);
  }
};

// find out the neighbors border which is connected to the hexagonal
const neighborBorder = (borderNumber: number) => {
  switch (borderNumber) {
    case 0:
      return 3;
    case 1:
      return 4;

    case 2:
      return 5;
    case 3:
      return 0;
    case 4:
      return 1;
    case 5:
      return 2;
  }
};
