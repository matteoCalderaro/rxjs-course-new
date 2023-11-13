import { Injectable, Output, EventEmitter, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BehaviorSubject, Observable, of, Subject, throwError } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { catchError, filter, finalize, map } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
  providedIn: "root",
})
export class Store {
  subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  init() {
    createHttpObservable("/api/courses")
      .pipe(
        catchError((err) => {
          console.log(err);
          return throwError(err);
        }),
        map((val) => Object.values(val["payload"])),
      )
      .subscribe((val: Course[]) => this.subject.next(val));
  }
  // SELECTORS
  selectBeginnerCourses() {
    return this.select("BEGINNER");
  }
  selectAdvancedCourses() {
    return this.select("ADVANCED");
  }
  select(category: string) {
    return this.courses$.pipe(
      map((courses) => courses.filter((course) => course.category == category)),
    );
  }
  // OPTIMISTIC UPDATE
  saveCourse(courseId: number, changes: object) {
    const courses = this.subject.getValue();
    const courseToChange = courses.findIndex((course) => course.id == courseId);
    const newCourses = courses.slice(0);
    console.log(courses[courseToChange], changes);
    newCourses[courseToChange] = {
      ...courses[courseToChange],
      ...changes,
    };
    this.subject.next(newCourses);

    return createHttpObservable(`/api/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(changes),
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
