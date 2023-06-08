import { ICreateHexagonal, IHexagonalNeighbour } from "../interfaces/hexagonal";
import { Result } from "../interfaces/result";
import * as hexagonalRepo from "../repositories/hexagonal";

export const addHexagonal = async (data: ICreateHexagonal) => {
  try {
    // calling repo function to store data
    const addHexagonalResult: Result = await hexagonalRepo.addHexagonal(data);
    // If there is any error then throw error
    if (addHexagonalResult.isError()) {
      throw addHexagonalResult.error;
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
