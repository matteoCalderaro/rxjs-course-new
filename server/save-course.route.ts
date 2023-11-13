import { Request, Response } from "express";
import { COURSES } from "./db-data";

export function saveCourse(req: Request, res: Response) {
  const id = req.params["merda"],
    body = req.body;

  COURSES[id] = {
    ...COURSES[id],
    ...body,
  };
  setTimeout(() => {
    res.status(200).json(COURSES[id]);
  }, 2000);
}
