import { Result } from "../interfaces/result";
import { db } from "../db_init/dbConn";
import { ICreateHexagonal, IHexagonalNeighbour } from "../interfaces/hexagonal";

export const addHexagonal = async (data: ICreateHexagonal): Promise<Result> => {
  try {
    // check if neighbors exist or not
    const hexagonNeighbor = await db.query(
      `select id from hexagons where name = $1`,
      [data.neighbour]
    );

    if (hexagonNeighbor.lenght === 0) {
      return Result.error("Hexagonal neighbors not found");
    }
    // check if name already exists
    const hexagonalName = await db.query(
      `select id from hexagons where name = $1`,
      [data.name]
    );

    if (hexagonalName.length === 0) {
      const hexagonSql = await db.one(
        `INSERT INTO hexagons (name) VALUES ($1) returning id`,
        [data.name]
      );
      await db.one(
        `INSERT INTO hexagonneighbors (hexagon_id, border_number, neighbor_hexagon_id) VALUES ($1, $2, $3) returning id`,
        [
          hexagonSql.id,
          data.border,
          data.neighbour !== "" ? hexagonNeighbor[0].id : null,
        ]
      );
    } else {
      await db.one(
        `INSERT INTO hexagonneighbors (hexagon_id, border_number, neighbor_hexagon_id) VALUES ($1, $2,  $3) returning id `,
        [
          hexagonalName[0].id,
          data.border,
          data.neighbour !== "" ? hexagonNeighbor[0].id : null,
        ]
      );
    }

    return Result.ok();
  } catch (err) {
    return Result.error(`Error adding hexagonal => ${err}`);
  }
};

export const fetchNeighbourOfHexagonal = async (
  name: string
): Promise<Result<IHexagonalNeighbour[]>> => {
  try {
    const result = await db.query(
      `SELECT hn.border_number, h2.name
      FROM hexagonneighbors AS hn
      INNER JOIN hexagons AS h1 ON hn.hexagon_id = h1.id
      INNER JOIN hexagons AS h2 ON hn.neighbor_hexagon_id = h2.id
      WHERE h1.name = $1`,
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

    console.log("hexagon",hexagon)

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
    await db.one(
      "DELETE FROM hexagons WHERE id = $1",
      hexagon.id
    );
    console.log("count",count)
    return Result.ok("Delete hexagonal successfully");
  } catch (err) {
    return Result.error(`Error delete hexagonal  => ${err}`);
  }
};
