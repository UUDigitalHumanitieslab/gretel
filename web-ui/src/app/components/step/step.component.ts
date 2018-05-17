/**
 * A step component is a component that should be inherited from
 * It is used to give a outline of how a step in a multi-step process should look
 * This component is used as parent for the steps in the xpath-search page
 */
import {Component, EventEmitter, OnInit, Output} from '@angular/core';


@Component({
  selector: 'grt-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements OnInit {
    warning: boolean = false;

  constructor() {

  }

  @Output() onChangeValid = new EventEmitter<Boolean>();

  ngOnInit() {
  }

  /**
   * Check if the input of the user is valid
   */
  public updateValidity(){
    throw new Error("updateValidity not implemented");
  }

  /**
   * Gives an warning that helps the user to understand why the current input is not valid
   */
  public showWarning(){
    throw new Error("showWarning not implemented");
  }

}
