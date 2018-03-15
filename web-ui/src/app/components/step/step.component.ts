import {Component, EventEmitter, OnInit, Output} from '@angular/core';


@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements OnInit {

  constructor() {

  }

  @Output() isValid = new EventEmitter<Boolean>();

  ngOnInit() {
  }

  /**
   * Check if the input of the user is valid
   */
  public checkIfValid(){
    throw new Error("checkIfValid not implemented");
  }

  /**
   * Gives an warning that helps the user to understand why the current input is not valid
   */
  public showWarning(){
    throw new Error("showWarning not implemented");
  }

}
