import express, { NextFunction, Request, Response } from "express";
import STATUS from "../constants/statusCode";
import { CustomError } from "../middlewares/error";
import { addHexagonal, deleteHexagonal, fetchNeighbourOfHexagonal } from "../controllers/hexagonal";

const router = express.Router();

/**
 * @route for adding hexagonal
 * @description
 * - @accept name, neighbour, border
 * - @returns success response if configuration is saved
 * @params
 * - @requires name: name of the hexagonal
 * - @requires neighbour: neighbour of the hexagonal to be added
 * - @requires border: border of the hexagonal to be added
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, neighbour, border } = req.body;

 

    // Verify parameters
    if (!name ) {
      // Throw an error if any parameter is not provided
      const err: CustomError = {
        statusCode: STATUS.BAD_REQUEST,
        customMessage: `All parameters for hexagonal are required`,
      };

      throw err;
    }
    
    const addHexagonalResult = await addHexagonal({name, neighbour, border});

    if (addHexagonalResult.isError()) {
      throw addHexagonalResult.error;
    }

  
    res.status(200).json({
      status: STATUS.OK,
      message: "Hexagon added successfully",
    });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

/**
 * @route to get hexagonal a name
 * @description
 * - @accept name
 * - @returns neighbours of hexagonal
 * @params
 * - @requires name: name of the hexagonal
 */
router.get(
  "/:name/neighbours",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const name = req.params.name;

      const neighbours = await fetchNeighbourOfHexagonal(name);

      if (neighbours.isError()) {
        throw neighbours.error;
      }

      res.status(200).json({
        status: 200,
        data: neighbours.data,
        message: `Retrieved neighbours successfully`,
      });
    } catch (error) {
      
      next(error);
    }
  }
);

/**
 * @route to delete a hexagonal
 * @description
 * - @accept name
 * - @returns success response if hexagonal is successfully deleted
 * @params
 * - @requires name: name of the hexagonal
 */
router.delete(
  "/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const { name } = req.params;

      const hexagonal = await deleteHexagonal(name);

      if(hexagonal.isError()){
        throw hexagonal.error;
      }

      res.status(200).json({
        status: 200,
        message: "Hexagon removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
