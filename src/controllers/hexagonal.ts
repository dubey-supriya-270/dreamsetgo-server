import {
  ICreateHexagonal,
  IHexagonalNeighbour,
  IStoreHexagonal,
} from "../interfaces/hexagonal";
import { Result } from "../interfaces/result";
import { CustomError } from "../middlewares/error";
import * as hexagonalRepo from "../repositories/hexagonal";

export const addHexagonal = async (data: ICreateHexagonal) => {
  try {
    // check if neighbor exists
    const isNeighborExist = await hexagonalRepo.getHexagonDetails(
      data.neighbour
    );

    if (isNeighborExist.isError()) {
      throw isNeighborExist.error;
    }

    if (isNeighborExist.data.length == 0 && data.neighbour !== '') {
      const err: CustomError = {
        customMessage: "neighbor hexagon not found",
      };

      throw err;
    }

    // calling repo function to store data
    const addHexagonalResult: Result = await hexagonalRepo.addHexagonal(data);
    // If there is any error then throw error
    if (addHexagonalResult.isError()) {
      throw addHexagonalResult.error;
    }

    // Logic to update other relations due to this entry
    let updatedRelations: IStoreHexagonal[] = [];

    let currentNeighborWithBorder = {
      neighbor: data.neighbour,
      border: data.border,
    };

    // left side processing
    while (true) {
      let hexagonalName = "";

      // check if relation in present in updated relation list
      let filteredList = updatedRelations.filter(
        (relation) =>
          relation.neighbor_name === currentNeighborWithBorder.neighbor &&
          relation.border_number === currentNeighborWithBorder.border - 1
      );

     
      if (filteredList.length === 0) {
        // check if there is any connection in the left with this current neighbor
        const neighborLeftSideConnection =
          await hexagonalRepo.getHexagonNameByNeighbor(
            currentNeighborWithBorder.neighbor,
            currentNeighborWithBorder.border - 1
          );

        if (neighborLeftSideConnection.isError()) {
          throw neighborLeftSideConnection.error;
        }

        // close left side processing if no hexagon with this neighbor and border
        if (
          !neighborLeftSideConnection.data ||
          neighborLeftSideConnection.data.length === 0
        ) {
          break;
        }

        hexagonalName = neighborLeftSideConnection.data[0].name;
      } else {
        hexagonalName = filteredList[0].name;
      }

      if (!hexagonalName) break;

      let hexagonalBorder =
        (((currentNeighborWithBorder.border + 2) % 6) + 5) % 6;

      // check if this entry is already present in the array, if present break the loop to avoid infinite loop
      const isEntryAlreadyPresent = updatedRelations.some(
        (relations) =>
          relations.name === data.name &&
          relations.neighbor_name === hexagonalName &&
          relations.border_number === hexagonalBorder
      );


      if (isEntryAlreadyPresent) {
        break;
      }

      // if it exists then update the updated relations list
      updatedRelations.push(
        {
          name: data.name,
          neighbor_name: hexagonalName,
          border_number: hexagonalBorder,
        },
        {
          name: hexagonalName,
          neighbor_name: data.name,
          border_number: (hexagonalBorder + 3) % 6,
        }
      );

      currentNeighborWithBorder.neighbor = hexagonalName;
      currentNeighborWithBorder.border = hexagonalBorder;
    }

   

    // right side processing
    while (true) {
      let hexagonalName = "";

      // check if relation in presemt in updated relation list
      let filteredList = updatedRelations.filter(
        (relation) =>
          relation.neighbor_name === currentNeighborWithBorder.neighbor &&
          relation.border_number === currentNeighborWithBorder.border + 1
      );

      if (filteredList.length === 0) {
        // check if there is any connection in the left with this current neighbor
        const neighborLeftSideConnection =
          await hexagonalRepo.getHexagonNameByNeighbor(
            currentNeighborWithBorder.neighbor,
            currentNeighborWithBorder.border + 1
          );

        if (neighborLeftSideConnection.isError()) {
          throw neighborLeftSideConnection.error;
        }

        // close left side processing if no hexagon with this neighbor and border
        if (
          !neighborLeftSideConnection.data ||
          neighborLeftSideConnection.data.length === 0
        ) {
          break;
        }

        hexagonalName = neighborLeftSideConnection.data[0].name;
      } else {
        hexagonalName = filteredList[0].name;
      }

      if (!hexagonalName) break;

      let hexagonalBorder =
        (((currentNeighborWithBorder.border + 4) % 6) + 1) % 6;

      // check if this entry is already present in the array, if present break the loop to avoid infinite loop
      const isEntryAlreadyPresent = updatedRelations.some(
        (relations) =>
          relations.name === data.name &&
          relations.neighbor_name === hexagonalName &&
          relations.border_number === hexagonalBorder
      );

      if (isEntryAlreadyPresent) {
        break;
      }

      // if it exists then update the updated relations list
      updatedRelations.push(
        {
          name: data.name,
          neighbor_name: hexagonalName,
          border_number: hexagonalBorder,
        },
        {
          name: hexagonalName,
          neighbor_name: data.name,
          border_number: (hexagonalBorder + 3) % 6,
        }
      );

      currentNeighborWithBorder.neighbor = hexagonalName;
      currentNeighborWithBorder.border = hexagonalBorder;
    }



    // push the updated relations if any
    if (updatedRelations.length > 0) {
      const addMultipleRelationHexagons =
        await hexagonalRepo.addMultipleHexagonal(updatedRelations);

      if (addMultipleRelationHexagons.isError()) {
        throw addMultipleRelationHexagons.error;
      }
    }

    return Result.ok(addHexagonalResult.data);
  } catch (error) {
    return Result.error(error);
  }
};

export const fetchNeighbourOfHexagonal = async (name: string) => {
  try {
    // To check whether hexagonal exists with this name
    const isHexagonalExists: Result<IHexagonalNeighbour[]> =
      await hexagonalRepo.fetchNeighbourOfHexagonal(name);

    if (isHexagonalExists.isError()) {
      throw isHexagonalExists.error;
    }

    // If userName doesn't exist throw an error
    if (!isHexagonalExists.data?.length) {
      return Result.error("Hexagonal neighbour doesn't exist!");
    }

    // return user details if exists
    return Result.ok(isHexagonalExists.data);
  } catch (error) {
    // return negative response
    return Result.error("Error fetching hexagonal");
  }
};

export const deleteHexagonal = async (hexagonName: string): Promise<Result> => {
  try {
    // To check whether hexagonal exists with this name
    const isHexagonDelete = await hexagonalRepo.deleteHexagonal(hexagonName);

    if (isHexagonDelete.isError()) {
      throw isHexagonDelete.error;
    }

    // return user details if exists
    return Result.ok(isHexagonDelete.data);
  } catch (error) {
    // return negative response
    return Result.error("Error delete hexagonal");
  }
};
